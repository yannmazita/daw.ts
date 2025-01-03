// src/features/mix/utils/stateUtils.ts
import { MixState, MixerTrack, Device, Send, SoundChain } from "../types";

export const updateMixerTrack = (
  state: MixState,
  mixerTrackId: string,
  updates: Partial<MixerTrack>,
): MixState => {
  // Ensure mixerTracks exists
  const mixerTracks = state.mixerTracks || {};
  const existingTrack = mixerTracks[mixerTrackId];

  return {
    ...state,
    mixerTracks: {
      ...mixerTracks,
      [mixerTrackId]: existingTrack
        ? { ...existingTrack, ...updates }
        : (updates as MixerTrack),
    },
  };
};

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
export const updateSoundChain = (
  state: MixState,
  soundChainId: string,
  updates: Partial<SoundChain>,
): MixState => {
  // Ensure soundChains exists
  const soundChains = state.soundChains || {};
  const existingSoundChain = soundChains[soundChainId];

  return {
    ...state,
    soundChains: {
      ...soundChains,
      [soundChainId]: existingSoundChain
        ? { ...existingSoundChain, ...updates }
        : (updates as SoundChain),
    },
  };
};
