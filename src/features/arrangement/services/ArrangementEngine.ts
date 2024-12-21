// src/features/arrangement/services/ArrangementEngine.ts
import { ArrangementEngine, ArrangementState, Track } from "../types";
import { TransportEngine } from "../../transport/types";
import { ClipEngine } from "../../clips/types";
import { MixEngine } from "../../mix/types";
import { AutomationEngine } from "../../automation/types";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { initialArrangementState } from "../utils/initialState";
import {
  createTrackData,
  getTrackChildren,
  isTrackFoldable,
} from "../utils/trackUtils";
import {
  calculateTrackHeight,
  calculateTotalHeight,
} from "../utils/heightUtils";
import { moveTrackInOrder, reorderTracks } from "../utils/orderUtils";
import { toggleAutomationLane } from "../utils/automationUtils";
import {
  validateArrangementState,
  validateTrackHeight,
} from "../utils/validation";

export class ArrangementEngineImpl implements ArrangementEngine {
  private disposed = false;

  constructor(
    public readonly transportEngine: TransportEngine,
    public readonly clipEngine: ClipEngine,
    public readonly mixEngine: MixEngine,
    public readonly automationEngine: AutomationEngine,
  ) {
    this.initializeMasterTrack();
  }

  private initializeMasterTrack(): void {
    try {
      const masterTrackId = crypto.randomUUID();
      const mixerChannelId = this.mixEngine.createChannel("master");

      const masterTrack = createTrackData(
        masterTrackId,
        "master",
        "Master",
        0,
        initialArrangementState.viewSettings,
      );

      useEngineStore.setState((state) => ({
        arrangement: {
          ...initialArrangementState,
          tracks: { [masterTrackId]: { ...masterTrack, mixerChannelId } },
          trackOrder: [masterTrackId],
          masterTrackId,
        },
      }));
    } catch (error) {
      console.error("Failed to initialize master track:", error);
      throw new Error("DAW initialization failed");
    }
  }

  createTrack(type: Track["type"], name: string): string {
    this.checkDisposed();

    if (type === "master") {
      throw new Error("Cannot create additional master tracks");
    }

    const id = crypto.randomUUID();
    const mixerChannelId = this.mixEngine.createChannel(type);

    try {
      const state = useEngineStore.getState().arrangement;
      const index = state.trackOrder.length;
      const track = createTrackData(id, type, name, index, state.viewSettings);

      useEngineStore.setState((state) => {
        const newState = {
          arrangement: {
            ...state.arrangement,
            tracks: {
              ...state.arrangement.tracks,
              [id]: { ...track, mixerChannelId },
            },
            trackOrder: [...state.arrangement.trackOrder, id],
            visibleAutomationLanes: {
              ...state.arrangement.visibleAutomationLanes,
              [id]: [],
            },
          },
        };

        // Validate new state
        const validation = validateArrangementState(newState.arrangement);
        if (!validation.valid) {
          throw new Error(
            `Invalid state after track creation: ${validation.errors.join(", ")}`,
          );
        }

        return newState;
      });

      return id;
    } catch (error) {
      if (mixerChannelId) {
        try {
          this.mixEngine.deleteChannel(mixerChannelId);
        } catch (cleanupError) {
          console.error("Failed to cleanup mixer channel:", cleanupError);
        }
      }
      throw error;
    }
  }

  deleteTrack(trackId: string): void {
    this.checkDisposed();
    const state = useEngineStore.getState().arrangement;
    const track = state.tracks[trackId];

    if (!track || track.type === "master") {
      throw new Error("Cannot delete track");
    }

    try {
      // Cleanup resources
      this.cleanupTrackResources(track);

      // Update state atomically
      useEngineStore.setState((state) => {
        const { [trackId]: removed, ...remainingTracks } =
          state.arrangement.tracks;
        const newTrackOrder = state.arrangement.trackOrder.filter(
          (id) => id !== trackId,
        );

        // Create new state
        const newState = {
          ...state.arrangement,
          tracks: remainingTracks,
          trackOrder: newTrackOrder,
          foldedTracks: new Set(
            Array.from(state.arrangement.foldedTracks).filter(
              (id) => id !== trackId,
            ),
          ),
          selectedTracks: new Set(
            Array.from(state.arrangement.selectedTracks).filter(
              (id) => id !== trackId,
            ),
          ),
        };

        // Remove from visible automation lanes
        const { [trackId]: removedLanes, ...remainingLanes } =
          state.arrangement.visibleAutomationLanes;

        return {
          arrangement: {
            ...newState,
            visibleAutomationLanes: remainingLanes,
          },
        };
      });
    } catch (error) {
      console.error("Failed to delete track:", error);
      throw error;
    }
  }

  private cleanupTrackResources(track: Track): void {
    // Cleanup clips
    track.clipIds.forEach((clipId) => {
      try {
        this.clipEngine.unscheduleClip(clipId);
      } catch (e) {
        console.warn(`Failed to unschedule clip ${clipId}:`, e);
      }
    });

    // Cleanup automation
    track.automationIds.forEach((automationId) => {
      try {
        this.automationEngine.unscheduleLane(automationId);
      } catch (e) {
        console.warn(`Failed to unschedule automation ${automationId}:`, e);
      }
    });

    // Cleanup mixer channel
    try {
      this.mixEngine.deleteChannel(track.mixerChannelId);
    } catch (e) {
      console.warn(
        `Failed to delete mixer channel ${track.mixerChannelId}:`,
        e,
      );
    }
  }

  moveTrack(trackId: string, newIndex: number): void {
    this.checkDisposed();
    const state = useEngineStore.getState().arrangement;
    const track = state.tracks[trackId];

    if (!track || track.type === "master") {
      throw new Error("Cannot move track");
    }

    try {
      const newOrder = moveTrackInOrder(trackId, newIndex, state);
      const newIndices = reorderTracks(newOrder, state);

      useEngineStore.setState((state) => {
        const newState = {
          arrangement: {
            ...state.arrangement,
            trackOrder: newOrder,
            tracks: Object.fromEntries(
              Object.entries(state.arrangement.tracks).map(([id, track]) => [
                id,
                { ...track, index: newIndices[id] || track.index },
              ]),
            ),
          },
        };

        // Validate new state
        const validation = validateArrangementState(newState.arrangement);
        if (!validation.valid) {
          throw new Error(
            `Invalid state after track move: ${validation.errors.join(", ")}`,
          );
        }

        return newState;
      });
    } catch (error) {
      console.error("Failed to move track:", error);
      throw error;
    }
  }

  getTotalHeight(): number {
    return calculateTotalHeight(this.getState());
  }

  // Add method for getting track height
  getTrackHeight(trackId: string): number {
    return calculateTrackHeight(trackId, this.getState());
  }

  getVisibleHeight(): number {
    const state = this.getState();
    return state.trackOrder.reduce((total, trackId) => {
      const track = state.tracks[trackId];
      if (!track.isVisible) return total;

      return total + calculateTrackHeight(trackId, state);
    }, 0);
  }

  toggleTrackFold(trackId: string): void {
    this.checkDisposed();
    const state = useEngineStore.getState().arrangement;
    const track = state.tracks[trackId];

    if (!track || !isTrackFoldable(track, state)) {
      return;
    }

    try {
      // Get children before state update
      const children = getTrackChildren(trackId, state);

      useEngineStore.setState((state) => {
        const newFoldedTracks = new Set(state.arrangement.foldedTracks);
        const isFolding = !newFoldedTracks.has(trackId);

        if (isFolding) {
          // When folding, add track and all children
          newFoldedTracks.add(trackId);
          children.forEach((childId) => newFoldedTracks.add(childId));
        } else {
          // When unfolding, remove track and all children
          newFoldedTracks.delete(trackId);
          children.forEach((childId) => newFoldedTracks.delete(childId));
        }

        const newState = {
          arrangement: {
            ...state.arrangement,
            foldedTracks: newFoldedTracks,
          },
        };

        // Validate state after modification
        const validation = validateArrangementState(newState.arrangement);
        if (!validation.valid) {
          console.error("State validation failed:", validation.errors);
          throw new Error("Invalid state after folding operation");
        }

        return newState;
      });
    } catch (error) {
      console.error("Failed to toggle track fold:", error);
      throw error;
    }
  }

  setTrackHeight(trackId: string, height: number): void {
    this.checkDisposed();
    const state = useEngineStore.getState().arrangement;

    if (!validateTrackHeight(height, state.viewSettings)) {
      throw new Error("Invalid track height");
    }

    try {
      useEngineStore.setState((state) => ({
        arrangement: {
          ...state.arrangement,
          viewSettings: {
            ...state.arrangement.viewSettings,
            trackHeights: {
              ...state.arrangement.viewSettings.trackHeights,
              [trackId]: height,
            },
          },
        },
      }));
    } catch (error) {
      console.error("Failed to set track height:", error);
      throw error;
    }
  }

  toggleAutomationLane(trackId: string, laneId: string): void {
    this.checkDisposed();
    const state = useEngineStore.getState().arrangement;

    try {
      const newLanes = toggleAutomationLane(trackId, laneId, state);

      useEngineStore.setState((state) => ({
        arrangement: {
          ...state.arrangement,
          visibleAutomationLanes: newLanes,
        },
      }));
    } catch (error) {
      console.error("Failed to toggle automation lane:", error);
      throw error;
    }
  }

  setSelection(trackIds: Set<string>): void {
    this.checkDisposed();
    const state = useEngineStore.getState().arrangement;

    // Validate all track IDs exist
    if (!Array.from(trackIds).every((id) => state.tracks[id])) {
      throw new Error("Invalid track selection");
    }

    try {
      useEngineStore.setState((state) => ({
        arrangement: {
          ...state.arrangement,
          selectedTracks: new Set(trackIds),
        },
      }));
    } catch (error) {
      console.error("Failed to set selection:", error);
      throw error;
    }
  }

  getState(): ArrangementState {
    return useEngineStore.getState().arrangement;
  }

  dispose(): void {
    if (this.disposed) return;

    try {
      const state = useEngineStore.getState().arrangement;

      // Cleanup all tracks except master
      Object.values(state.tracks)
        .filter((track) => track.type !== "master")
        .forEach((track) => {
          this.cleanupTrackResources(track);
        });

      // Reset to initial state
      useEngineStore.setState({ arrangement: initialArrangementState });

      this.disposed = true;
    } catch (error) {
      console.error("Failed to dispose arrangement engine:", error);
      throw error;
    }
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("ArrangementEngine is disposed");
    }
  }
}
