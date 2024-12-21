// src/features/mix/utils/cleanupUtils.ts
import { MixerChannel, Device, Send } from "../types";

export const disposeChannel = (channel: MixerChannel): void => {
  try {
    // Dispose devices
    channel.preDevices.forEach((device) => device.dispose());
    channel.postDevices.forEach((device) => device.dispose());

    // Dispose sends
    channel.sends.forEach((send) => send.gain.dispose());

    // Dispose channel nodes
    channel.input.dispose();
    channel.channel.dispose();
    channel.meter.dispose();
  } catch (error) {
    console.error("Error disposing channel:", error);
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
