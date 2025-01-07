// src/features/services/TrackEngine.ts
import { createTrackData } from "../utils/trackUtils";
import { Track, TrackEngine, TrackState } from "../types";
import { updateTrackSoloStates, calculateSoloState } from "../utils/stateUtils";
import { applyMuteStatesToNodes } from "../utils/audioUtils";

export class TrackEngineImpl implements TrackEngine {
  private disposed = false;

  initializeTracks(state: TrackState): TrackState {
    console.log("Initializing tracks:", state.tracks);

    try {
      const midi1 = this.createTrack(state, "midi", "Test MIDI 1");
      const midi2 = this.createTrack(midi1, "midi", "Test MIDI 2");
      const audio1 = this.createTrack(midi2, "audio", "Test Audio 1");
      const audio2 = this.createTrack(audio1, "audio", "Test Audio 2");

      return audio2;
    } catch (error) {
      console.error("Failed to initialize tracks");
      throw error;
    }
  }

  createTrack(
    state: TrackState,
    type: Track["type"],
    name?: string,
  ): TrackState {
    this.checkDisposed();
    const id = crypto.randomUUID();
    try {
      const track = createTrackData(id, type, name);

      const newState = {
        ...state,
        tracks: {
          ...state.tracks,
          [id]: track,
        },
        trackOrder: [...state.trackOrder, id],
      };

      return newState;
    } catch (error) {
      console.error("Failed to create track:");
      throw error;
    }
  }

  updateTrack(
    state: TrackState,
    trackId: string,
    updates: Partial<Track>,
  ): TrackState {
    this.checkDisposed();
    try {
      const track = state.tracks[trackId];
      const newState = {
        ...state,
        tracks: {
          ...state.tracks,
          [trackId]: {
            ...track,
            ...updates,
          },
        },
      };
      return newState;
    } catch (error) {
      console.error("Failed to update track");
      throw error;
    }
  }

  deleteTrack(state: TrackState, trackId: string): TrackState {
    this.checkDisposed();
    try {
      const { [trackId]: _, ...tracks } = state.tracks;
      const trackOrder = state.trackOrder.filter((id) => id !== trackId);
      const newState = {
        ...state,
        tracks,
        trackOrder,
      };
      return newState;
    } catch (error) {
      console.error("Failed to delete track");
      throw error;
    }
  }

  moveTrack(state: TrackState, trackId: string, newIndex: number): TrackState {
    this.checkDisposed();
    try {
      const trackOrder = state.trackOrder.filter((id) => id !== trackId);
      trackOrder.splice(newIndex, 0, trackId);
      const newState = {
        ...state,
        trackOrder,
      };
      return newState;
    } catch (error) {
      console.error("Failed to move track");
      throw error;
    }
  }

  setSolo(state: TrackState, trackId: string, solo: boolean): TrackState {
    this.checkDisposed();
    try {
      const soloUpdate = calculateSoloState(trackId, solo, state.tracks);
      applyMuteStatesToNodes(state, soloUpdate.muteStates);
      const newState = updateTrackSoloStates(state, soloUpdate);

      return newState;
    } catch (error) {
      console.error("Failed to set solo");
      throw error;
    }
  }

  setMute(state: TrackState, trackId: string, mute: boolean): TrackState {
    this.checkDisposed();
    try {
      const track = state.tracks[trackId];
      const newState = {
        ...state,
        tracks: {
          ...state.tracks,
          [trackId]: {
            ...track,
            controls: { ...track.controls, mute },
          },
        },
      };
      // Only apply mute if track is not affected by solo
      const anySolo = Object.values(state.tracks).some((t) => t.controls.solo);
      if (!anySolo || track.controls.solo) {
        track.channel.mute = mute;
      }

      return newState;
    } catch (error) {
      console.error("Failed to set mute");
      throw error;
    }
  }

  setArmed(state: TrackState, trackId: string, armed: boolean): TrackState {
    this.checkDisposed();
    try {
      const track = state.tracks[trackId];
      const newState = {
        ...state,
        tracks: {
          ...state.tracks,
          [trackId]: {
            ...track,
            controls: { ...track.controls, armed },
          },
        },
      };
      return newState;
    } catch (error) {
      console.error("Failed to set armed");
      throw error;
    }
  }

  setPan(state: TrackState, trackId: string, pan: number): TrackState {
    this.checkDisposed();
    try {
      const track = state.tracks[trackId];
      const newState = {
        ...state,
        tracks: {
          ...state.tracks,
          [trackId]: {
            ...track,
            controls: { ...track.controls, pan },
          },
        },
      };
      return newState;
    } catch (error) {
      console.error("Failed to set pan");
      throw error;
    }
  }

  setVolume(state: TrackState, trackId: string, volume: number): TrackState {
    this.checkDisposed();
    try {
      const track = state.tracks[trackId];
      const newState = {
        ...state,
        tracks: {
          ...state.tracks,
          [trackId]: {
            ...track,
            controls: { ...track.controls, volume },
          },
        },
      };
      return newState;
    } catch (error) {
      console.error("Failed to set volume");
      throw error;
    }
  }

  getMeterValues(state: TrackState, trackId: string): number | number[] {
    this.checkDisposed();
    try {
      const track = state.tracks[trackId];
      return track.meter.getValue();
    } catch (error) {
      console.error("Failed to get meter values");
      throw error;
    }
  }

  dispose(state: TrackState): TrackState {
    if (this.disposed) {
      return state;
    }
    try {
      const newState = {
        ...state,
        tracks: {},
        trackOrder: [],
      };
      return newState;
    } catch (error) {
      console.error("Failed to dispose");
      throw error;
    }
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error("TrackEngine is disposed");
    }
  }
}
