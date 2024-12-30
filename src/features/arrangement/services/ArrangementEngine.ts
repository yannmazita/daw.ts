// src/features/arrangement/services/ArrangementEngine.ts
import { ArrangementEngine, ArrangementState, Track } from "../types";
import { TransportEngine } from "../../transport/types";
import { ClipEngine } from "../../clips/types";
import { MixEngine } from "../../mix/types";
import { AutomationEngine } from "../../automation/types";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { initialArrangementState } from "../utils/initialState";
import { createTrackData } from "../utils/trackUtils";
import { moveTrackInOrder } from "../utils/orderUtils";
import { validateArrangementState } from "../utils/validation";
import { calculateSoloState, updateTrackSoloStates } from "../utils/stateUtils";

export class ArrangementEngineImpl implements ArrangementEngine {
  private disposed = false;

  constructor(
    public readonly transportEngine: TransportEngine,
    public readonly clipEngine: ClipEngine,
    public readonly mixEngine: MixEngine,
    public readonly automationEngine: AutomationEngine,
  ) {
    this.initializeDefaultTracks();
  }

  private initializeDefaultTracks(): void {
    const state = useEngineStore.getState();
    const persistedTracks = state.arrangement.trackOrder;

    try {
      if (persistedTracks.length > 0) {
        // Reinitialize persisted tracks
        console.log("Reinitializing persisted tracks");
        persistedTracks.forEach((trackId) => {
          const persistedTrack = state.arrangement.tracks[trackId];
          if (persistedTrack) {
            this.createTrack(persistedTrack.type, persistedTrack.name);
          }
        });
      } else {
        // Create default tracks
        console.log("Creating default tracks");
        this.createTrack("midi", "MIDI 1");
        this.createTrack("midi", "MIDI 2");
        this.createTrack("audio", "AUDIO 1");
        this.createTrack("audio", "AUDIO 2");
      }
    } catch (error) {
      console.error("Failed to initialize tracks:", error);
      throw error;
    }
  }

  createTrack(type: Track["type"], name: string): string {
    this.checkDisposed();

    const id = crypto.randomUUID();

    try {
      const track = createTrackData(id, type, name);

      useEngineStore.setState((state) => {
        const newState = {
          arrangement: {
            ...state.arrangement,
            tracks: {
              ...state.arrangement.tracks,
              [id]: { ...track },
            },
            trackOrder: [...state.arrangement.trackOrder, id],
          },
          mix: {
            ...state.mix,
            trackSends: {
              ...state.mix.trackSends,
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

      // Route all new tracks to master mixer track by default
      try {
        this.mixEngine.createSend(id, "master");
      } catch (error) {
        console.error("Failed to create send to master track:", error);
      }

      return id;
    } catch (error) {
      console.error("Failed to create track:", error);
      throw error;
    }
  }

  deleteTrack(trackId: string): void {
    this.checkDisposed();
    const state = useEngineStore.getState().arrangement;
    const track = state.tracks[trackId];

    if (!track) {
      throw new Error("Track not found");
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
        };

        return {
          arrangement: {
            ...newState,
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

    // Cleanup sends
    //
  }

  updateTrack(trackId: string, updates: Partial<Track>): void {
    this.checkDisposed();
    const state = useEngineStore.getState().arrangement;
    const track = state.tracks[trackId];
    if (!track) {
      throw new Error("Track not found");
    }
    try {
      useEngineStore.setState((state) => {
        const newState = {
          arrangement: {
            ...state.arrangement,
            tracks: {
              ...state.arrangement.tracks,
              [trackId]: { ...track, ...updates },
            },
          },
        };
        // Validate new state
        const validation = validateArrangementState(newState.arrangement);
        if (!validation.valid) {
          throw new Error(
            `Invalid state after track update: ${validation.errors.join(", ")}`,
          );
        }
        return newState;
      });
    } catch (error) {
      console.error("Failed to update track:", error);
      throw error;
    }
  }

  moveTrack(trackId: string, newIndex: number): void {
    this.checkDisposed();
    const state = useEngineStore.getState().arrangement;
    const track = state.tracks[trackId];

    if (!track) {
      throw new Error("Cannot move track");
    }

    try {
      const newOrder = moveTrackInOrder(trackId, newIndex, state);

      useEngineStore.setState((state) => {
        const newState = {
          arrangement: {
            ...state.arrangement,
            trackOrder: newOrder,
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

  setSolo(trackId: string, solo: boolean): void {
    const stateSnapshot = useEngineStore.getState().arrangement;
    const track = stateSnapshot.tracks[trackId];

    if (!track) throw new Error("Track not found");

    try {
      const soloUpdate = calculateSoloState(
        trackId,
        solo,
        stateSnapshot.tracks,
      );

      // Apply mute states to audio nodes
      Object.entries(soloUpdate.muteStates).forEach(([id, mute]) => {
        const track = stateSnapshot.tracks[id];
        if (track) {
          track.channel.mute = mute;
        }
      });

      // Update state
      useEngineStore.setState((state) => ({
        arrangement: updateTrackSoloStates(state.arrangement, soloUpdate),
      }));
    } catch (error) {
      console.error("Failed to set solo state:", error);
      throw error;
    }
  }

  setMute(trackId: string, mute: boolean): void {
    const stateSnapshot = useEngineStore.getState().arrangement;
    const track = stateSnapshot.tracks[trackId];
    if (!track) throw new Error("Track not found");

    try {
      // Only apply mute if track is not affected by solo
      const anySolo = Object.values(stateSnapshot.tracks).some(
        (t) => t.controls.solo,
      );
      if (!anySolo || track.controls.solo) {
        track.channel.mute = mute;
      }

      useEngineStore.setState((state) => ({
        arrangement: {
          ...state.arrangement,
          tracks: {
            ...state.arrangement.tracks,
            [trackId]: {
              ...track,
              controls: { ...track.controls, mute },
            },
          },
        },
      }));
    } catch (error) {
      console.error("Failed to set mute state:", error);
      throw error;
    }
  }

  setPan(trackId: string, pan: number): void {
    const stateSnapshot = useEngineStore.getState().arrangement;
    const track = stateSnapshot.tracks[trackId];
    if (!track) throw new Error("Track not found");

    const clampedPan = Math.max(-1, Math.min(1, pan));

    try {
      track.panner.pan.value = clampedPan;

      useEngineStore.setState((state) => ({
        arrangement: {
          ...state.arrangement,
          tracks: {
            ...state.arrangement.tracks,
            [trackId]: {
              ...track,
              controls: { ...track.controls, pan: clampedPan },
            },
          },
        },
      }));
    } catch (error) {
      console.error("Failed to set pan value:", error);
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

      // Cleanup all tracks
      Object.values(state.tracks).forEach((track) => {
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
