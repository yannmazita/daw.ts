// src/features/composition/services/CompositionTrackService.ts
import { useEngineStore } from "@/core/stores/useEngineStore";
import { Track, TrackEngine } from "@/features/tracks/types";

export class CompositionTrackService {
  constructor(private readonly trackEngine: TrackEngine) {}

  createTrack(type: Track["type"], name?: string): void {
    const state = useEngineStore.getState().tracks;
    const newState = this.trackEngine.createTrack(state, type, name);
    useEngineStore.setState({ tracks: newState });
  }

  updateTrack(trackId: string, updates: Partial<Track>): void {
    const state = useEngineStore.getState().tracks;
    const newState = this.trackEngine.updateTrack(state, trackId, updates);
    useEngineStore.setState({ tracks: newState });
  }

  deleteTrack(trackId: string): void {
    const state = useEngineStore.getState().tracks;
    const newState = this.trackEngine.deleteTrack(state, trackId);
    useEngineStore.setState({ tracks: newState });
  }

  moveTrack(trackId: string, position: number): void {
    const state = useEngineStore.getState().tracks;
    const newState = this.trackEngine.moveTrack(state, trackId, position);
    useEngineStore.setState({ tracks: newState });
  }

  setSolo(trackId: string, solo: boolean): void {
    const state = useEngineStore.getState().tracks;
    const newState = this.trackEngine.setSolo(state, trackId, solo);
    useEngineStore.setState({ tracks: newState });
  }

  setMute(trackId: string, mute: boolean): void {
    const state = useEngineStore.getState().tracks;
    const newState = this.trackEngine.setMute(state, trackId, mute);
    useEngineStore.setState({ tracks: newState });
  }

  setArmed(trackId: string, armed: boolean): void {
    const state = useEngineStore.getState().tracks;
    const newState = this.trackEngine.setArmed(state, trackId, armed);
    useEngineStore.setState({ tracks: newState });
  }

  setPan(trackId: string, pan: number): void {
    const state = useEngineStore.getState().tracks;
    const newState = this.trackEngine.setPan(state, trackId, pan);
    useEngineStore.setState({ tracks: newState });
  }

  setVolume(trackId: string, volume: number): void {
    const state = useEngineStore.getState().tracks;
    const newState = this.trackEngine.setVolume(state, trackId, volume);
    useEngineStore.setState({ tracks: newState });
  }

  getMeterValues(trackId: string): number | number[] {
    const state = useEngineStore.getState().tracks;
    return this.trackEngine.getMeterValues(state, trackId);
  }

  dispose(): void {
    const state = useEngineStore.getState().tracks;
    this.trackEngine.dispose(state);
  }
}
