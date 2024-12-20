// src/features/arrangement/services/ArrangementEngine.ts
import { Time } from "tone/build/esm/core/type/Units";
import { ArrangementEngine, ArrangementState, Track } from "../types";
import { TransportEngine } from "../../transport/types";
import { ClipEngine } from "../../clips/types";
import { MixEngine } from "../../mix/types";
import { AutomationEngine } from "../../automation/types";
import { initialArrangementState } from "../utils/initialState";
import { useEngineStore } from "@/core/stores/useEngineStore";
import {
  validateAndCalculateNewOrder,
  validateSelection,
  validateTimeRange,
  validateViewRangeWithZoom,
} from "../utils/validation";

export class ArrangementEngineImpl implements ArrangementEngine {
  constructor(
    public readonly transportEngine: TransportEngine,
    public readonly clipEngine: ClipEngine,
    public readonly mixEngine: MixEngine,
    public readonly automationEngine: AutomationEngine,
    private disposed = false,
  ) {
    // Initialize master track outside of any setState calls
    try {
      const masterTrackId = this.initializeMasterTrack();
      useEngineStore.setState((state) => ({
        arrangement: {
          ...state.arrangement,
          masterTrackId,
        },
      }));
    } catch (error) {
      console.error("Failed to initialize master track:", error);
      throw new Error("DAW initialization failed");
    }
  }

  private initializeMasterTrack(): string {
    return this.createTrack("master", "Master");
  }

  createTrack(type: Track["type"], name: string): string {
    this.checkDisposed();
    const id = crypto.randomUUID();
    let mixerChannelId: string | undefined;

    try {
      // Create mixer channel outside setState
      mixerChannelId = this.mixEngine.createChannel(type);

      // Prepare track data
      const state = useEngineStore.getState();
      const index = state.arrangement.trackOrder.length;

      const track: Track = {
        id,
        type,
        name,
        index,
        height: 100,
        isVisible: true,
        isFolded: false,
        mixerChannelId,
        clipIds: [],
        automationIds: [],
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      };

      // Update state atomically
      useEngineStore.setState((state) => ({
        arrangement: {
          ...state.arrangement,
          tracks: {
            ...state.arrangement.tracks,
            [id]: track,
          },
          trackOrder: [...state.arrangement.trackOrder, id],
          ...(type === "return" && {
            returnTracks: [...state.arrangement.returnTracks, id],
          }),
        },
      }));

      return id;
    } catch (error) {
      this.handleTrackCreationFailure(id, mixerChannelId, type);
      throw error;
    }
  }

  private handleTrackCreationFailure(
    trackId: string,
    mixerChannelId: string | undefined,
    type: Track["type"],
  ): void {
    // Cleanup mixer channel if it was created
    if (mixerChannelId) {
      try {
        this.mixEngine.deleteChannel(mixerChannelId);
      } catch (cleanupError) {
        console.error("Failed to cleanup mixer channel:", cleanupError);
      }
    }

    // Clean up arrangement state
    useEngineStore.setState((state) => {
      const { [trackId]: removedTrack, ...remainingTracks } =
        state.arrangement.tracks;
      return {
        arrangement: {
          ...state.arrangement,
          tracks: remainingTracks,
          trackOrder: state.arrangement.trackOrder.filter(
            (id) => id !== trackId,
          ),
          ...(type === "return" && {
            returnTracks: state.arrangement.returnTracks.filter(
              (id) => id !== trackId,
            ),
          }),
        },
      };
    });
  }

  deleteTrack(trackId: string): void {
    this.checkDisposed();
    // Get track data outside setState
    const state = useEngineStore.getState();
    const track = state.arrangement.tracks[trackId];

    if (!track) return;
    if (trackId === state.arrangement.masterTrackId) {
      throw new Error("Cannot delete master track");
    }

    try {
      // Clean up resources outside setState
      this.cleanupTrackResources(track);

      // Update state atomically
      useEngineStore.setState((state) => {
        const { [trackId]: removedTrack, ...remainingTracks } =
          state.arrangement.tracks;

        return {
          arrangement: {
            ...state.arrangement,
            tracks: this.reindexTracks(remainingTracks, track.index),
            trackOrder: state.arrangement.trackOrder.filter(
              (id) => id !== trackId,
            ),
            returnTracks:
              track.type === "return"
                ? state.arrangement.returnTracks.filter((id) => id !== trackId)
                : state.arrangement.returnTracks,
            selection: this.cleanupTrackSelection(
              state.arrangement.selection,
              track,
            ),
          },
        };
      });
    } catch (error) {
      console.error("Failed to delete track:", error);
      throw error;
    }
  }

  private cleanupTrackResources(track: Track): void {
    // Clean up clips
    track.clipIds.forEach((clipId) => {
      try {
        this.clipEngine.unscheduleClip(clipId);
      } catch (e) {
        console.warn(`Failed to unschedule clip ${clipId}:`, e);
      }
    });

    // Clean up automation
    track.automationIds.forEach((automationId) => {
      try {
        this.automationEngine.unscheduleLane(automationId);
      } catch (e) {
        console.warn(`Failed to unschedule automation ${automationId}:`, e);
      }
    });

    // Clean up mixer channel
    try {
      this.mixEngine.deleteChannel(track.mixerChannelId);
    } catch (e) {
      console.warn(
        `Failed to delete mixer channel ${track.mixerChannelId}:`,
        e,
      );
    }
  }

  private reindexTracks(
    tracks: Record<string, Track>,
    removedIndex: number,
  ): Record<string, Track> {
    return Object.fromEntries(
      Object.entries(tracks).map(([id, track]) => [
        id,
        track.index > removedIndex
          ? { ...track, index: track.index - 1 }
          : track,
      ]),
    );
  }

  private cleanupTrackSelection(
    selection: ArrangementState["selection"],
    track: Track,
  ): ArrangementState["selection"] {
    return {
      ...selection,
      trackIds: selection.trackIds.filter((id) => id !== track.id),
      clipIds: selection.clipIds.filter((id) => !track.clipIds.includes(id)),
      automationPoints: selection.automationPoints.filter(
        (point) => !track.automationIds.includes(point.laneId),
      ),
    };
  }

  moveTrack(trackId: string, newIndex: number): void {
    this.checkDisposed();
    // Validate inputs outside setState
    const state = useEngineStore.getState();
    const track = state.arrangement.tracks[trackId];

    if (!track) {
      throw new Error(`Track ${trackId} not found`);
    }

    if (track.type === "master") {
      throw new Error("Cannot move master track");
    }

    try {
      // Validate and calculate new track order
      const { isValid, error, newOrder } = validateAndCalculateNewOrder(
        state.arrangement.trackOrder,
        trackId,
        newIndex,
      );

      if (!isValid || !newOrder) {
        throw new Error(error ?? "Invalid track move operation");
      }

      // Update state atomically
      useEngineStore.setState((state) => ({
        arrangement: {
          ...state.arrangement,
          trackOrder: newOrder,
          tracks: this.updateTrackIndices(state.arrangement.tracks, newOrder),
        },
      }));
    } catch (error) {
      console.error(
        `Failed to move track ${trackId} to index ${newIndex}:`,
        error,
      );
      throw error;
    }
  }

  private updateTrackIndices(
    tracks: Record<string, Track>,
    newOrder: string[],
  ): Record<string, Track> {
    try {
      // Create index map for efficient lookup
      const indexMap = new Map(newOrder.map((id, index) => [id, index]));

      // Update all tracks with new indices
      return Object.fromEntries(
        Object.entries(tracks).map(([id, track]) => {
          const newIndex = indexMap.get(id);

          // If track not in order, maintain current index
          if (newIndex === undefined) {
            return [id, track];
          }

          return [
            id,
            {
              ...track,
              index: newIndex,
            },
          ];
        }),
      );
    } catch (error) {
      console.error("Failed to update track indices:", error);
      throw new Error("Track index update failed");
    }
  }

  setSelection(selection: Partial<ArrangementState["selection"]>): void {
    this.checkDisposed();
    // Get current state outside setState
    const state = useEngineStore.getState();

    try {
      // Validate selection data
      const validatedSelection = validateSelection(selection, state);

      // Update state atomically
      useEngineStore.setState((state) => ({
        arrangement: {
          ...state.arrangement,
          selection: {
            ...state.arrangement.selection,
            ...validatedSelection,
          },
        },
      }));
    } catch (error) {
      console.error("Selection update failed:", error);
      throw error;
    }
  }

  setViewRange(startTime: Time, endTime: Time): void {
    this.checkDisposed();
    try {
      // Validate and normalize times outside setState
      const { validatedStart, validatedEnd } = validateTimeRange(
        startTime,
        endTime,
      );

      // Check if the range is reasonable for current zoom level
      validateViewRangeWithZoom(validatedStart, validatedEnd);

      // Update state atomically
      useEngineStore.setState((state) => ({
        arrangement: {
          ...state.arrangement,
          viewState: {
            ...state.arrangement.viewState,
            startTime: validatedStart,
            endTime: validatedEnd,
          },
        },
      }));
    } catch (error) {
      console.error("View range update failed:", error);
      throw error;
    }
  }

  // Todo: update this
  setZoom(zoom: number): void {
    this.checkDisposed();
    if (typeof zoom !== "number" || !isFinite(zoom)) {
      throw new Error("Invalid zoom value");
    }

    useEngineStore.setState((state) => {
      const clampedZoom = Math.max(0.1, Math.min(10, zoom));

      if (clampedZoom !== zoom) {
        console.warn(`Zoom value ${zoom} clamped to ${clampedZoom}`);
      }

      return {
        arrangement: {
          ...state.arrangement,
          viewState: {
            ...state.arrangement.viewState,
            zoom: clampedZoom,
          },
        },
      };
    });
  }

  getState(): ArrangementState {
    return useEngineStore.getState().arrangement;
  }

  dispose(): void {
    if (this.disposed) {
      console.warn("ArrangementEngine already disposed");
      return;
    }

    try {
      // Get final state snapshot before cleanup
      const state = useEngineStore.getState().arrangement;

      // Clean up tracks in reverse order (children before parents)
      // This ensures dependent resources are cleaned up properly
      this.disposeAllTracks(state);

      // Reset state atomically after all cleanup is complete
      useEngineStore.setState((state) => ({
        arrangement: {
          ...initialArrangementState,
          // Preserve master track ID if needed for reconstruction
          masterTrackId: state.arrangement.masterTrackId,
        },
      }));

      this.disposed = true;
    } catch (error) {
      console.error("Error during ArrangementEngine disposal:", error);
      // Attempt to force cleanup even if errors occur
      this.forceCleanup();
      throw error;
    }
  }

  private disposeAllTracks(state: ArrangementState): void {
    // Get ordered list of tracks (returns and regular tracks before master)
    const orderedTrackIds = this.getTrackDisposalOrder(state);

    // Track any failures during cleanup
    const failures: { trackId: string; error: Error }[] = [];

    // Clean up each track
    orderedTrackIds.forEach((trackId) => {
      try {
        if (trackId !== state.masterTrackId) {
          this.disposeTrackResources(state.tracks[trackId]);
        }
      } catch (error) {
        console.error(`Failed to dispose track ${trackId}:`, error);
        failures.push({ trackId, error: error as Error });
      }
    });

    // Handle master track last
    if (state.masterTrackId) {
      try {
        this.disposeTrackResources(state.tracks[state.masterTrackId]);
      } catch (error) {
        console.error("Failed to dispose master track:", error);
        failures.push({
          trackId: state.masterTrackId,
          error: error as Error,
        });
      }
    }

    // If there were any failures, report them
    if (failures.length > 0) {
      throw new Error(
        `Failed to dispose ${failures.length} tracks: ${failures
          .map((f) => f.trackId)
          .join(", ")}`,
      );
    }
  }

  private getTrackDisposalOrder(state: ArrangementState): string[] {
    // Order: return tracks, regular tracks, master track
    const orderedIds: string[] = [];

    // Add return tracks first
    state.returnTracks.forEach((id) => {
      if (id !== state.masterTrackId) {
        orderedIds.push(id);
      }
    });

    // Add regular tracks
    state.trackOrder.forEach((id) => {
      if (!orderedIds.includes(id) && id !== state.masterTrackId) {
        orderedIds.push(id);
      }
    });

    // Add master track last
    if (state.masterTrackId) {
      orderedIds.push(state.masterTrackId);
    }

    return orderedIds;
  }

  private disposeTrackResources(track: Track): void {
    if (!track) return;

    const errors: Error[] = [];

    // Clean up clips first
    track.clipIds.forEach((clipId) => {
      try {
        this.clipEngine.unscheduleClip(clipId);
      } catch (error) {
        errors.push(error as Error);
        console.warn(`Failed to dispose clip ${clipId}:`, error);
      }
    });

    // Clean up automation
    track.automationIds.forEach((automationId) => {
      try {
        this.automationEngine.unscheduleLane(automationId);
      } catch (error) {
        errors.push(error as Error);
        console.warn(`Failed to dispose automation ${automationId}:`, error);
      }
    });

    // Clean up mixer channel last
    try {
      this.mixEngine.deleteChannel(track.mixerChannelId);
    } catch (error) {
      errors.push(error as Error);
      console.warn(
        `Failed to dispose mixer channel ${track.mixerChannelId}:`,
        error,
      );
    }

    // If there were any errors, throw combined error
    if (errors.length > 0) {
      throw new Error(
        `Failed to dispose track ${track.id} resources: ${
          errors.length
        } errors occurred`,
      );
    }
  }

  private forceCleanup(): void {
    try {
      // Reset state to initial
      useEngineStore.setState((state) => ({
        arrangement: initialArrangementState,
      }));

      // Force disposal flag
      this.disposed = true;

      console.warn("Forced cleanup completed");
    } catch (error) {
      console.error("Force cleanup failed:", error);
    }
  }

  isDisposed(): boolean {
    return this.disposed;
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("ArrangementEngine is disposed");
    }
  }
}
