// src/features/mix/utils/stateUtils.ts
import { MixState, MixerTrack, Device, Send } from "../types";

export const updateMixerTrack = (
  state: MixState,
  mixerTrackId: string,
  updates: Partial<MixerTrack>,
): MixState => ({
  ...state,
  mixerTracks: {
    ...state.mixerTracks,
    [mixerTrackId]: {
      ...state.mixerTracks[mixerTrackId],
      ...updates,
    },
  },
});

export const updateDevice = (
  state: MixState,
  deviceId: string,
  updates: Partial<Device>,
): MixState => ({
  ...state,
  devices: {
    ...state.devices,
    [deviceId]: {
      ...state.devices[deviceId],
      ...updates,
    },
  },
});

export const updateSend = (
  state: MixState,
  mixerTrackId: string,
  sendId: string,
  updates: Partial<Send>,
): MixState => {
  const mixerTrack = state.mixerTracks[mixerTrackId];
  return updateMixerTrack(state, mixerTrackId, {
    sends: mixerTrack.sends.map((send) =>
      send.id === sendId ? { ...send, ...updates } : send,
    ),
  });
};
