// src/features/mix/utils/stateUtils.ts
import { MixState, MixerChannel, Device, Send } from "../types";

export const updateChannel = (
  state: MixState,
  channelId: string,
  updates: Partial<MixerChannel>,
): MixState => ({
  ...state,
  channels: {
    ...state.channels,
    [channelId]: {
      ...state.channels[channelId],
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
  channelId: string,
  sendId: string,
  updates: Partial<Send>,
): MixState => {
  const channel = state.channels[channelId];
  return updateChannel(state, channelId, {
    sends: channel.sends.map((send) =>
      send.id === sendId ? { ...send, ...updates } : send,
    ),
  });
};
