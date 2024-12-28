// src/features/mix/utils/routingUtils.ts
import * as Tone from "tone";
import { MixerTrack, Send } from "../types";

export interface SendRoutingState {
  returnTrackId: string;
  preFader: boolean;
  gainValue: number;
  channelVolume: number;
}

export const connectMixerTrackChain = (
  mixerTrack: MixerTrack,
  masterTrack: MixerTrack,
): void => {
  // Disconnect existing chain
  mixerTrack.input.disconnect();
  mixerTrack.preDevices.forEach((device) => device.disconnect());
  mixerTrack.postDevices.forEach((device) => device.disconnect());
  mixerTrack.channel.disconnect();

  // Connect chain
  let currentNode: Tone.ToneAudioNode = mixerTrack.input;

  // Pre-fader chain
  mixerTrack.preDevices.forEach((device) => {
    currentNode.connect(device);
    currentNode = device;
  });

  // Connect to channel strip
  currentNode.connect(mixerTrack.channel);
  currentNode = mixerTrack.channel;

  // Post-fader chain
  mixerTrack.postDevices.forEach((device) => {
    currentNode.connect(device);
    currentNode = device;
  });

  // Connect to meter
  currentNode.connect(mixerTrack.meter);

  // All tracks route to master except master track itself
  if (mixerTrack.type === "master") {
    currentNode.toDestination();
  } else {
    currentNode.connect(masterTrack.input);
  }
};

export const connectSend = (
  send: Send,
  sourceTrack: MixerTrack,
  returnTrack: MixerTrack,
): void => {
  if (returnTrack.type !== "return") {
    throw new Error(`Track ${returnTrack.id} is not a return track`);
  }

  send.gain.disconnect();

  // Connect from appropriate point in source track
  if (send.preFader) {
    sourceTrack.input.connect(send.gain);
  } else {
    sourceTrack.channel.connect(send.gain);
  }

  // Connect to return track input
  send.gain.connect(returnTrack.input);
};

export const calculateMasterLevel = (
  sendAmount: number,
  isPrefader: boolean,
): number => {
  if (isPrefader) {
    return 1; // Pre-fader doesn't affect master
  }
  return 1 - Math.max(0, Math.min(1, sendAmount)); // Post-fader reduces master proportionally
};

export const captureRoutingState = (
  send: Send,
  sourceTrack: MixerTrack,
): SendRoutingState => ({
  returnTrackId: send.returnTrackId,
  preFader: send.preFader,
  gainValue: send.gain.gain.value,
  channelVolume: sourceTrack.channel.volume.value,
});

export const restoreSendRouting = (
  send: Send,
  sourceTrack: MixerTrack,
  returnTrack: MixerTrack,
  originalState: SendRoutingState,
): void => {
  send.gain.disconnect();

  if (originalState.preFader) {
    sourceTrack.input.connect(send.gain);
  } else {
    sourceTrack.channel.connect(send.gain);
  }

  send.gain.connect(returnTrack.input);
  send.gain.gain.value = originalState.gainValue;
  sourceTrack.channel.volume.value = originalState.channelVolume;
};
