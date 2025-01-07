// src/features/composition/services/CompositionMixService.ts
import {
  Device,
  DeviceType,
  MixEngine,
  MixerTrack,
  Send,
} from "@/features/mix/types";
import { useEngineStore } from "@/core/stores/useEngineStore";

export class CompositionMixService {
  constructor(private readonly mixEngine: MixEngine) {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.initializeMix(state);
    useEngineStore.setState({ mix: newState });
  }

  createMixerTrack(type: MixerTrack["type"], name?: string): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.createMixerTrack(state, type, name);
    useEngineStore.setState({ mix: newState });
  }

  deleteMixerTrack(trackId: string): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.deleteMixerTrack(state, trackId);
    useEngineStore.setState({ mix: newState });
  }

  moveMixerTrack(trackId: string, newIndex: number): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.moveMixerTrack(state, trackId, newIndex);
    useEngineStore.setState({ mix: newState });
  }

  setSolo(trackId: string, solo: boolean): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.setSolo(state, trackId, solo);
    useEngineStore.setState({ mix: newState });
  }

  setMute(trackId: string, mute: boolean): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.setMute(state, trackId, mute);
    useEngineStore.setState({ mix: newState });
  }

  setVolume(trackId: string, volume: number): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.setVolume(state, trackId, volume);
    useEngineStore.setState({ mix: newState });
  }

  setPan(trackId: string, pan: number): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.setPan(state, trackId, pan);
    useEngineStore.setState({ mix: newState });
  }

  getMeterValues(trackId: string): number | number[] {
    const state = useEngineStore.getState().mix;
    return this.mixEngine.getMeterValues(state, trackId);
  }

  addDevice(parentId: string, deviceType: DeviceType): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.addDevice(state, parentId, deviceType);
    useEngineStore.setState({ mix: newState });
  }

  updateDevice(
    parentId: string,
    deviceId: string,
    updates: Partial<Device>,
  ): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.updateDevice(
      state,
      parentId,
      deviceId,
      updates,
    );
    useEngineStore.setState({ mix: newState });
  }

  removeDevice(parentId: string, deviceId: string): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.removeDevice(state, parentId, deviceId);
    useEngineStore.setState({ mix: newState });
  }

  createSend(sourceTrackId: string, targetTrackId: string): void {
    const state = useEngineStore.getState();
    const newState = this.mixEngine.createSend(
      state,
      sourceTrackId,
      targetTrackId,
    );
    useEngineStore.setState({ ...newState });
  }

  updateSend(
    baseTrackId: string,
    sendId: string,
    updates: Partial<Send>,
  ): void {
    const state = useEngineStore.getState();
    const newState = this.mixEngine.updateSend(
      state,
      baseTrackId,
      sendId,
      updates,
    );
    useEngineStore.setState({ ...newState });
  }

  removeSend(baseTrackId: string, sendId: string): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.removeSend(state, baseTrackId, sendId);
    useEngineStore.setState({ mix: newState });
  }

  setSendAmount(baseTrackId: string, sendId: string, amount: number): void {
    const state = useEngineStore.getState();
    const newState = this.mixEngine.setSendAmount(
      state,
      baseTrackId,
      sendId,
      amount,
    );
    useEngineStore.setState({ ...newState });
  }

  getTrackSends(baseTrackId: string): Send[] {
    const state = useEngineStore.getState().mix;
    return this.mixEngine.getTrackSends(state, baseTrackId);
  }

  disconnectTrackSends(baseTrackId: string): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.disconnectTrackSends(state, baseTrackId);
    useEngineStore.setState({ mix: newState });
  }

  createSoundChain(name?: string): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.createSoundChain(state, name);
    useEngineStore.setState({ mix: newState });
  }

  dispose(): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.dispose(state);
    useEngineStore.setState({ mix: newState });
  }
}
