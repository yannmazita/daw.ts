// src/features/mix/utils/audioNodes.ts
import * as Tone from "tone";
import { MixerChannel, Send } from "../types";

export const connectChannelChain = (
  channel: MixerChannel,
  targetInput?: Tone.ToneAudioNode,
): void => {
  // Disconnect existing chain
  channel.input.disconnect();
  channel.preDevices.forEach((device) => device.disconnect());
  channel.postDevices.forEach((device) => device.disconnect());
  channel.channel.disconnect();

  // Connect chain
  let currentNode: Tone.ToneAudioNode = channel.input;

  // Pre-fader chain
  channel.preDevices.forEach((device) => {
    currentNode.connect(device);
    currentNode = device;
  });

  // Connect to channel strip
  currentNode.connect(channel.channel);
  currentNode = channel.channel;

  // Post-fader chain
  channel.postDevices.forEach((device) => {
    currentNode.connect(device);
    currentNode = device;
  });

  // Connect to meter
  currentNode.connect(channel.meter);

  // Connect to target if provided
  if (targetInput) {
    currentNode.connect(targetInput);
  } else if (channel.type === "master") {
    currentNode.toDestination();
  }
};

export const connectSend = (
  send: Send,
  sourceChannel: MixerChannel,
  targetInput: Tone.ToneAudioNode,
): void => {
  send.gain.disconnect();

  if (send.preFader) {
    sourceChannel.input.connect(send.gain);
  } else {
    sourceChannel.channel.connect(send.gain);
  }

  send.gain.connect(targetInput);
};
