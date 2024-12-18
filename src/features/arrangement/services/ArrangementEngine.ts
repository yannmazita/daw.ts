// src/features/arrangement/services/ArrangementEngine.ts
import { v4 as uuidv4 } from "uuid";
import * as Tone from "tone";
import { Time } from "tone/build/esm/core/type/Units";
import { ArrangementEngine, ArrangementState, Track } from "../types";
import { TransportEngine } from "../../transport/types";
import { ClipEngine } from "../../clips/types";
import { MixEngine } from "../../mix/types";
import { AutomationEngine } from "../../automation/types";
import { initialArrangementState } from "../utils/initialState";
import { useEngineStore } from "@/core/stores/useEngineStore";

export class ArrangementEngineImpl implements ArrangementEngine {
  constructor(
    public readonly transportEngine: TransportEngine,
    public readonly clipEngine: ClipEngine,
    public readonly mixEngine: MixEngine,
    public readonly automationEngine: AutomationEngine,
  ) {
    // Initialize master track
    const masterTrackId = this.createTrack("master", "Master");
    useEngineStore.getState().updateArrangement({ masterTrackId });
  }

  createTrack(type: Track["type"], name: string): string {
    const id = uuidv4();
    let mixerChannelId: string | undefined;

    try {
      useEngineStore.setState((state) => {
        const index = state.arrangement.trackOrder.length;

        // Create mixer channel first
        try {
          mixerChannelId = this.mixEngine.createChannel(type);
        } catch (error) {
          console.error("Failed to create mixer channel:", error);
          throw new Error("Mixer channel creation failed:");
        }

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

        return {
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
        };
      });

      return id;
    } catch (error) {
      // Cleanup on failure
      if (mixerChannelId) {
        try {
          this.mixEngine.deleteChannel(mixerChannelId);
        } catch (cleanupError) {
          console.error("Failed to cleanup mixer channel:", cleanupError);
          // Don't throw cleanup error, we want to throw the original error
        }
      }

      // Ensure arrangement state is clean
      useEngineStore.setState((state) => {
        const { [id]: removedTrack, ...remainingTracks } =
          state.arrangement.tracks;
        return {
          arrangement: {
            ...state.arrangement,
            tracks: remainingTracks,
            trackOrder: state.arrangement.trackOrder.filter(
              (trackId) => trackId !== id,
            ),
            ...(type === "return" && {
              returnTracks: state.arrangement.returnTracks.filter(
                (trackId) => trackId !== id,
              ),
            }),
          },
        };
      });

      // Throw the original error with context
      throw new Error(`Track creation failed: ${error.message}`);
    }
  }

  deleteTrack(trackId: string): void {
    useEngineStore.setState((state) => {
      const track = state.arrangement.tracks[trackId];
      if (!track) return state;

      // Prevent master track deletion
      if (trackId === state.arrangement.masterTrackId) {
        throw new Error("Cannot delete master track");
      }

      try {
        // Clean up clips
        track.clipIds.forEach((clipId) => {
          this.clipEngine.unscheduleClip(clipId);
        });

        // Clean up automation
        track.automationIds.forEach((automationId) => {
          this.automationEngine.unscheduleLane(automationId);
        });

        // Clean up mixer channel
        this.mixEngine.deleteChannel(track.mixerChannelId);

        // Remove track and update all related state in one operation
        const { [trackId]: removedTrack, ...remainingTracks } =
          state.arrangement.tracks;

        // Reindex remaining tracks
        const reindexedTracks = Object.fromEntries(
          Object.entries(remainingTracks).map(([id, t]) => [
            id,
            t.index > track.index ? { ...t, index: t.index - 1 } : t,
          ]),
        );

        return {
          arrangement: {
            ...state.arrangement,
            tracks: reindexedTracks,
            trackOrder: state.arrangement.trackOrder.filter(
              (id) => id !== trackId,
            ),
            returnTracks:
              track.type === "return"
                ? state.arrangement.returnTracks.filter((id) => id !== trackId)
                : state.arrangement.returnTracks,
            selection: {
              ...state.arrangement.selection,
              trackIds: state.arrangement.selection.trackIds.filter(
                (id) => id !== trackId,
              ),
              // Optionally also clean up related clip and automation selections
              clipIds: state.arrangement.selection.clipIds.filter(
                (id) => !track.clipIds.includes(id),
              ),
              automationPoints:
                state.arrangement.selection.automationPoints.filter(
                  (point) => !track.automationIds.includes(point.laneId),
                ),
            },
          },
        };
      } catch (error) {
        console.error("Failed to delete track:", error);
        throw new Error(`Failed to delete track: ${error.message}`);
      }
    });
  }

  moveTrack(trackId: string, newIndex: number): void {
    useEngineStore.setState((state) => {
      const track = state.arrangement.tracks[trackId];
      if (!track) return state; // No change if track not found

      // Validate new index
      if (newIndex < 0 || newIndex >= state.arrangement.trackOrder.length) {
        throw new Error("Invalid track index");
      }

      // Create new track order by removing and inserting at new position
      const filteredOrder = state.arrangement.trackOrder.filter(
        (id) => id !== trackId,
      );
      const newTrackOrder = [
        ...filteredOrder.slice(0, newIndex),
        trackId,
        ...filteredOrder.slice(newIndex),
      ];

      // Update all track indices based on new order
      const updatedTracks = Object.fromEntries(
        Object.entries(state.arrangement.tracks).map(([id, track]) => [
          id,
          {
            ...track,
            index: newTrackOrder.indexOf(id),
          },
        ]),
      );

      return {
        arrangement: {
          ...state.arrangement,
          trackOrder: newTrackOrder,
          tracks: updatedTracks,
        },
      };
    });
  }

  setSelection(selection: Partial<ArrangementState["selection"]>): void {
    useEngineStore.setState((state) => {
      // Validate track IDs exist
      const invalidTrackIds = (selection.trackIds ?? []).filter(
        (id) => !state.arrangement.tracks[id],
      );
      if (invalidTrackIds.length > 0) {
        throw new Error(`Invalid track IDs: ${invalidTrackIds.join(", ")}`);
      }

      // Validate clip IDs exist
      const invalidClipIds = (selection.clipIds ?? []).filter(
        (id) =>
          !Object.values(state.arrangement.tracks).some((track) =>
            track.clipIds.includes(id),
          ),
      );
      if (invalidClipIds.length > 0) {
        throw new Error(`Invalid clip IDs: ${invalidClipIds.join(", ")}`);
      }

      return {
        arrangement: {
          ...state.arrangement,
          selection: {
            ...state.arrangement.selection,
            ...selection,
          },
        },
      };
    });
  }

  setViewRange(startTime: Time, endTime: Time): void {
    useEngineStore.setState((state) => {
      // Validate time range
      if (Tone.Time(endTime).toSeconds() <= Tone.Time(startTime).toSeconds()) {
        throw new Error("End time must be after start time");
      }

      return {
        arrangement: {
          ...state.arrangement,
          viewState: {
            ...state.arrangement.viewState,
            startTime,
            endTime,
          },
        },
      };
    });
  }

  setZoom(zoom: number): void {
    if (typeof zoom !== "number" || !isFinite(zoom)) {
      throw new Error("Invalid zoom value");
    }

    useEngineStore.setState((state) => {
      const clampedZoom = Math.max(0.1, Math.min(10, zoom));

      // Optional logging
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
    const state = useEngineStore.getState().arrangement;
    // Clean up all tracks
    Object.keys(state.tracks).forEach((trackId) => {
      if (trackId !== state.masterTrackId) {
        this.deleteTrack(trackId);
      }
    });

    // Reset state
    useEngineStore.getState().updateArrangement({ ...initialArrangementState });
  }
}
