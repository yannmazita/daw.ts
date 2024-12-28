// src/features/mix/utils/cleanupUtils.ts
import { MixerTrack, Device, Send } from "../types";

export const disposeMixerTrack = (mixerTrack: MixerTrack): void => {
  try {
    // Dispose devices
    mixerTrack.preDevices.forEach((device) => device.dispose());
    mixerTrack.postDevices.forEach((device) => device.dispose());

    // Dispose mixer track nodes
    mixerTrack.input.dispose();
    mixerTrack.channel.dispose();
    mixerTrack.meter.dispose();
  } catch (error) {
    console.error("Error disposing mixer track:", error);
    throw error;
  }
};

export const disposeSend = (send: Send): void => {
  try {
    send.gain.disconnect();
    send.gain.dispose();
  } catch (error) {
    console.error("Error disposing send:", error);
    throw error;
  }
};

export const disposeDevice = (device: Device): void => {
  try {
    device.node.disconnect();
    device.node.dispose();
  } catch (error) {
    console.error("Error disposing device:", error);
    throw error;
  }
};
