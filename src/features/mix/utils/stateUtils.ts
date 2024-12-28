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

export const addSendToState = (state: MixState, send: Send): MixState => {
  return {
    ...state,
    sends: {
      ...state.sends,
      [send.id]: send,
    },
    trackSends: {
      ...state.trackSends,
      [send.sourceTrackId]: [
        ...(state.trackSends[send.sourceTrackId] || []),
        send.id,
      ],
    },
  };
};

export const removeSendFromState = (
  state: MixState,
  sendId: string,
): MixState => {
  const send = state.sends[sendId];
  if (!send) return state;

  const { [sendId]: _, ...remainingSends } = state.sends;
  const sourceTrackSends = state.trackSends[send.sourceTrackId] || [];

  return {
    ...state,
    sends: remainingSends,
    trackSends: {
      ...state.trackSends,
      [send.sourceTrackId]: sourceTrackSends.filter((id) => id !== sendId),
    },
  };
};
