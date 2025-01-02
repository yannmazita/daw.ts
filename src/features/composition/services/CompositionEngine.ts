// src/features/composition/services/CompositionEngine.ts
import { CompositionEngine, CompositionState, Track } from "../types";
import { TransportEngine } from "../../transport/types";
import { ClipEngine } from "../../clips/types";
import { MixEngine } from "../../mix/types";
import { InstrumentEngine } from "@/features/instruments/types";
import { AutomationEngine } from "../../automation/types";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { initialCompositionState } from "../utils/initialState";
import { createTrackData } from "../utils/trackUtils";
import { moveTrackInOrder } from "../utils/orderUtils";
import { validateCompositionState } from "../utils/validation";
import { calculateSoloState, updateTrackSoloStates } from "../utils/stateUtils";

export class CompositionEngineImpl implements CompositionEngine {
  private disposed = false;

  constructor(
    public readonly transportEngine: TransportEngine,
    public readonly mixEngine: MixEngine,
    public readonly clipEngine: ClipEngine,
    public readonly instrumentEngine: InstrumentEngine,
    public readonly automationEngine: AutomationEngine,
  ) {
    this.initializeDefaultTracks();
    this.initializeDummyMidiClips();
  }

  private initializeDefaultTracks(): void {
    const state = useEngineStore.getState();
    const persistedTracks = state.composition.trackOrder;

    try {
      if (persistedTracks.length > 0) {
        // Reinitialize persisted tracks
        console.log("Reinitializing persisted tracks");
        persistedTracks.forEach((trackId) => {
          const persistedTrack = state.composition.tracks[trackId];
          if (persistedTrack) {
            this.createTrack(persistedTrack.type, persistedTrack.name);
          }
        });
      } else {
        // Create default tracks
        // 2 MIDI, 2 Audio but using more for debugging purposes
        console.log("Creating default tracks");
        for (let i = 0; i < 5; i++) {
          this.createTrack("midi", `Test MIDI ${i + 1}`);
        }
        for (let i = 0; i < 5; i++) {
          this.createTrack("audio", `Test Audio ${i + 1}`);
        }
      }
    } catch (error) {
      console.error("Failed to initialize tracks:", error);
      throw error;
    }
  }

  private initializeDummyMidiClips(): void {
    const stateSNapshot = useEngineStore.getState().composition;
    const trackOrder = stateSNapshot.trackOrder;

    trackOrder.forEach((trackId, index) => {
      const track = stateSNapshot.tracks[trackId];
      if (track.type === "midi") {
        const contentId = this.clipEngine.createMidiClip({
          name: `Test MIDI Clip ${index + 1}`,
          duration: 4,
          tracks: [],
        });
        const clipId = this.clipEngine.addClip(contentId, 0);
        this.updateTrack(trackId, { clipIds: [clipId] });
      }
    });
  }

  createTrack(type: Track["type"], name?: string): string {
    this.checkDisposed();

    const id = crypto.randomUUID();

    try {
      const track = createTrackData(id, type, name);

      useEngineStore.setState((state) => {
        const newState = {
          composition: {
            ...state.composition,
            tracks: {
              ...state.composition.tracks,
              [id]: { ...track },
            },
            trackOrder: [...state.composition.trackOrder, id],
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
        const validation = validateCompositionState(newState.composition);
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
    const state = useEngineStore.getState().composition;
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
          state.composition.tracks;
        const newTrackOrder = state.composition.trackOrder.filter(
          (id) => id !== trackId,
        );

        // Create new state
        const newState = {
          ...state.composition,
          tracks: remainingTracks,
          trackOrder: newTrackOrder,
        };

        return {
          composition: {
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
    const state = useEngineStore.getState().composition;
    const track = state.tracks[trackId];
    if (!track) {
      throw new Error("Track not found");
    }
    try {
      useEngineStore.setState((state) => {
        const newState = {
          composition: {
            ...state.composition,
            tracks: {
              ...state.composition.tracks,
              [trackId]: { ...track, ...updates },
            },
          },
        };
        // Validate new state
        const validation = validateCompositionState(newState.composition);
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
    const state = useEngineStore.getState().composition;
    const track = state.tracks[trackId];

    if (!track) {
      throw new Error("Cannot move track");
    }

    try {
      const newOrder = moveTrackInOrder(trackId, newIndex, state);

      useEngineStore.setState((state) => {
        const newState = {
          composition: {
            ...state.composition,
            trackOrder: newOrder,
          },
        };

        // Validate new state
        const validation = validateCompositionState(newState.composition);
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
    const stateSnapshot = useEngineStore.getState().composition;
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
        composition: updateTrackSoloStates(state.composition, soloUpdate),
      }));
    } catch (error) {
      console.error("Failed to set solo state:", error);
      throw error;
    }
  }

  setMute(trackId: string, mute: boolean): void {
    const stateSnapshot = useEngineStore.getState().composition;
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
        composition: {
          ...state.composition,
          tracks: {
            ...state.composition.tracks,
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

  setArmed(trackId: string, armed: boolean): void {
    const stateSnapshot = useEngineStore.getState().composition;
    const track = stateSnapshot.tracks[trackId];
    if (!track) throw new Error("Track not found");
    try {
      useEngineStore.setState((state) => ({
        composition: {
          ...state.composition,
          tracks: {
            ...state.composition.tracks,
            [trackId]: {
              ...track,
              controls: { ...track.controls, armed },
            },
          },
        },
      }));
    } catch (error) {
      console.error("Failed to set armed state:", error);
      throw error;
    }
  }

  setPan(trackId: string, pan: number): void {
    const stateSnapshot = useEngineStore.getState().composition;
    const track = stateSnapshot.tracks[trackId];
    if (!track) throw new Error("Track not found");

    const clampedPan = Math.max(-1, Math.min(1, pan));

    try {
      track.panner.pan.value = clampedPan;

      useEngineStore.setState((state) => ({
        composition: {
          ...state.composition,
          tracks: {
            ...state.composition.tracks,
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

  setVolume(trackId: string, volume: number): void {
    const stateSnapshot = useEngineStore.getState().composition;
    const track = stateSnapshot.tracks[trackId];
    if (!track) throw new Error("Track not found");
    const clampedVolume = Math.max(0, Math.min(1, volume));
    try {
      track.channel.volume.value = clampedVolume;
      useEngineStore.setState((state) => ({
        composition: {
          ...state.composition,
          tracks: {
            ...state.composition.tracks,
            [trackId]: {
              ...track,
              controls: { ...track.controls, volume: clampedVolume },
            },
          },
        },
      }));
    } catch (error) {
      console.error("Failed to set volume value:", error);
      throw error;
    }
  }

  getMeterValues(trackId: string): number | number[] {
    const stateSnapshot = useEngineStore.getState().composition;
    const track = stateSnapshot.tracks[trackId];
    if (!track) throw new Error("Track not found");
    return track.meter.getValue();
  }

  getState(): CompositionState {
    return useEngineStore.getState().composition;
  }

  dispose(): void {
    if (this.disposed) return;

    try {
      const state = useEngineStore.getState().composition;

      // Cleanup all tracks
      Object.values(state.tracks).forEach((track) => {
        this.cleanupTrackResources(track);
      });

      // Reset to initial state
      useEngineStore.setState({ composition: initialCompositionState });

      this.disposed = true;
    } catch (error) {
      console.error("Failed to dispose composition engine:", error);
      throw error;
    }
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("CompositionEngine is disposed");
    }
  }
}
