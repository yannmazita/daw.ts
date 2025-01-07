// src/features/composition/services/CompositionTrackService.ts
import { useEngineStore } from "@/core/stores/useEngineStore";
import { Track, TrackEngine } from "@/features/tracks/types";
import { MixEngine } from "@/features/mix/types";
import { ClipEngine } from "@/features/clips/types";

export class CompositionTrackService {
  constructor(
    private readonly trackEngine: TrackEngine,
    private readonly clipEngine: ClipEngine,
    private readonly mixEngine: MixEngine,
  ) {
    const state = useEngineStore.getState();
    const newState = this.trackEngine.initializeTracks(state.tracks);
    useEngineStore.setState({ tracks: newState });
  }

  createTrack(type: Track["type"], name?: string): void {
    const state = useEngineStore.getState();
    const trackState = state.tracks;

    const newTrackState = this.trackEngine.createTrack(trackState, type, name);
    const newTrackId =
      newTrackState.trackOrder[newTrackState.trackOrder.length - 1];

    // Send new track to master track
    const newState = this.mixEngine.createSend(
      { ...state, tracks: newTrackState },
      newTrackId,
      "master",
    );
    useEngineStore.setState(newState);
  }

  updateTrack(trackId: string, updates: Partial<Track>): void {
    const state = useEngineStore.getState().tracks;
    const newState = this.trackEngine.updateTrack(state, trackId, updates);
    useEngineStore.setState({ tracks: newState });
  }

  deleteTrack(trackId: string): void {
    const state = useEngineStore.getState();
    const trackState = state.tracks;
    const mixState = state.mix;

    const newTrackState = this.trackEngine.deleteTrack(trackState, trackId);
    const track = trackState.tracks[trackId];
    const sendIds = mixState.trackSends[trackId] || [];
    let newState = { ...state, tracks: newTrackState };

    // Cleanup clips
    if (track) {
      track.clipIds.forEach((clipId) => {
        newState = {
          ...newState,
          ...this.clipEngine.removeClip(newState, clipId),
        };
      });
    }

    // Cleanup sends
    sendIds.forEach((sendId) => {
      newState = {
        ...newState,
        ...this.mixEngine.removeSend(newState.mix, trackId, sendId),
      };
    });

    useEngineStore.setState(newState);
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
