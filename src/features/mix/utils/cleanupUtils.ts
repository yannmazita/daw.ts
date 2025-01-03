// src/features/mix/utils/cleanupUtils.ts
import { MixerTrack, Device, Send, SoundChain } from "../types";

export const disposeMixerTrack = (
  mixerTrack: MixerTrack,
  devices: Record<string, Device>,
): void => {
  try {
    // Dispose devices
    mixerTrack.deviceIds.forEach((deviceId) =>
      devices[deviceId].node.dispose(),
    );

    // Dispose mixer track nodes
    mixerTrack.input.dispose();
    mixerTrack.channel.dispose();
    mixerTrack.meter.dispose();
  } catch (error) {
    console.error("Error disposing mixer track:");
    throw error;
  }
};

export const disposeSend = (send: Send): void => {
  try {
    send.gain.disconnect();
    send.gain.dispose();
  } catch (error) {
    console.error("Error disposing send:");
    throw error;
  }
};

export const disposeDevice = (device: Device): void => {
  try {
    device.node.disconnect();
    device.node.dispose();
  } catch (error) {
    console.error("Error disposing device:");
    throw error;
  }
};

export const disposeSoundChain = (
  soundChain: SoundChain,
  devices: Record<string, Device>,
): void => {
  try {
    // Dispose devices
    soundChain.deviceIds.forEach((deviceId) =>
      devices[deviceId].node.dispose(),
    );

    soundChain.input.dispose();
    soundChain.output.dispose();
  } catch (error) {
    console.error("Error disposing sound chain:");
    throw error;
  }
};
