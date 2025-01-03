// src/features/mix/utils/routingUtils.ts
import * as Tone from "tone";
import { Device, MixerTrack, Send, SoundChain } from "../types";
import { Track } from "@/features/composition/types";

export interface SendRoutingState {
  returnTrackId: string;
  preFader: boolean;
  gainValue: number;
  channelVolume: number;
}

export const connectMixerTrackChain = (
  mixerTrack: MixerTrack,
  masterTrack: MixerTrack,
  devices: Record<string, Device>,
): void => {
  // Disconnect existing chain
  mixerTrack.input.disconnect();
  mixerTrack.deviceIds.forEach((deviceId) =>
    devices[deviceId]?.node.disconnect(),
  );
  mixerTrack.channel.disconnect();

  // Connect chain
  let currentNode: Tone.ToneAudioNode = mixerTrack.input;

  // Connect devices
  mixerTrack.deviceIds.forEach((deviceId) => {
    if (devices[deviceId]) {
      currentNode.connect(devices[deviceId].node);
      currentNode = devices[deviceId].node;
    }
  });

  // Connect to channel strip
  currentNode.connect(mixerTrack.channel);
  currentNode = mixerTrack.channel;

  // Connect to meter
  currentNode.connect(mixerTrack.meter);

  // All tracks route to master except master track itself
  if (mixerTrack.type === "master") {
    currentNode.toDestination();
  } else {
    currentNode.connect(masterTrack.input);
  }
};

export const connectSoundChain = (
  soundChain: SoundChain,
  devices: Record<string, Device>,
): void => {
  // Disconnect existing chain
  soundChain.input.disconnect();
  soundChain.deviceIds.forEach((deviceId) =>
    devices[deviceId]?.node.disconnect(),
  );
  soundChain.output.disconnect();

  // Connect chain
  let currentNode: Tone.ToneAudioNode = soundChain.input;

  // Connect devices
  soundChain.deviceIds.forEach((deviceId) => {
    if (devices[deviceId]) {
      currentNode.connect(devices[deviceId].node);
      currentNode = devices[deviceId].node;
    }
  });

  // Connect to output
  currentNode.connect(soundChain.output);
};

export const connectSend = (
  send: Send,
  sourceTrack: Track,
  returnTrack: MixerTrack,
): void => {
  console.log("Connecting send:", {
    sendId: send.id,
    sourceTrackId: sourceTrack.id,
    returnTrackId: returnTrack.id,
    sourceHasInput: !!sourceTrack.input,
    sourceHasChannel: !!sourceTrack.channel,
    returnHasInput: !!returnTrack.input,
    sendHasGain: !!send.gain,
  });

  // Validate nodes
  if (!sourceTrack.input || !sourceTrack.channel) {
    console.error("Source track nodes:", sourceTrack);
    throw new Error(`Source track ${sourceTrack.id} missing audio nodes`);
  }

  if (!returnTrack.input) {
    console.error("Return track nodes:", returnTrack);
    throw new Error(`Return track ${returnTrack.id} missing input node`);
  }

  if (!send.gain) {
    console.error("Send node:", send);
    throw new Error(`Send ${send.id} missing gain node`);
  }

  try {
    // Disconnect existing connections
    send.gain.disconnect();

    // Connect from appropriate point in source track
    if (send.preFader) {
      console.log(
        `Connecting pre-fader: ${sourceTrack.id} -> ${returnTrack.id}`,
      );
      sourceTrack.input.connect(send.gain);
    } else {
      console.log(
        `Connecting post-fader: ${sourceTrack.id} -> ${returnTrack.id}`,
      );
      sourceTrack.channel.connect(send.gain);
    }

    // Connect to return track input
    console.log(`Connecting send gain to return: ${returnTrack.id}`);
    send.gain.connect(returnTrack.input);
  } catch (error) {
    console.error("Connection error:", error);
    throw new Error("Failed to connect send");
  }
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
  sourceTrack: Track,
): SendRoutingState => ({
  returnTrackId: send.returnTrackId,
  preFader: send.preFader,
  gainValue: send.gain.gain.value,
  channelVolume: sourceTrack.channel.volume.value,
});

export const restoreSendRouting = (
  send: Send,
  sourceTrack: Track,
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
