// src/features/mix/types.ts
import { AudioNode } from "@/core/types/audio";

export type Device = SoundChain | AudioNode;

export interface Track {
  id: string;
  name: string;
  inputNode: AudioNode;
  outputNode: GainNode;
  panNode: StereoPannerNode;
  isMuted: boolean;
  isSoloed: boolean;
  previousGain: number;
  sends: Record<string, Send>;
  sendsOrder: string[];
  soundChain: SoundChain | null;
}

export interface Send {
  id: string;
  name: string;
  outputNode: GainNode;
  trackId: string;
  returnTrackId: string;
  preFader: boolean;
}

export interface ReturnTrack {
  id: string;
  name: string;
  inputNode: AudioNode | null;
  outputNode: GainNode;
  panNode: StereoPannerNode;
  isMuted: boolean;
  isSoloed: boolean;
  previousGain: number;
  effects: Record<string, AudioNode>;
  effectsOrder: string[];
}

export interface Chain {
  id: string;
  name: string;
  outputNode: GainNode;
  instrument: AudioNode | null;
  effects: Record<string, AudioNode>;
  effectsOrder: string[];
  panNode: StereoPannerNode;
  isMuted: boolean;
  isSoloed: boolean;
  previousGain: number;
  keyZone: any; // to define
  velocityZone: any; // to define
}

export interface SoundChain {
  id: string;
  name: string;
  chains: Record<string, Chain>;
  chainsOrder: string[];
  outputNode: AudioNode;
}

export interface Mixer {
  tracks: Record<string, Track>;
  returnTracks: Record<string, ReturnTrack>;
  masterTrack: MasterTrack;
  soloedElementsIds: Set<string>;
  tracksOrder: string[];
  returnTracksOrder: string[];
}

export interface MasterTrack {
  id: string;
  name: string;
  inputNode: AudioNode;
  gainNode: GainNode;
  outputNode: AudioDestinationNode;
  panNode: StereoPannerNode;
  isMuted: boolean;
  isSoloed: boolean;
  previousGain: number;
  effects: Record<string, AudioNode>;
  effectsOrder: string[];
}

export interface MixEngine {
  initializeMixer(state: MixState): MixState;
  createTrack(state: MixState, name?: string): MixState;
  createSend(
    state: MixState,
    trackId: string,
    returnTrackId: string,
    name: string,
  ): MixState;
  createReturnTrack(state: MixState, name?: string): MixState;
  createSoundChain(state: MixState, trackId: string, name?: string): MixState;
  createChain(
    state: MixState,
    trackId: string,
    name?: string,
    instrument?: AudioNode | null,
  ): MixState;

  dispose(state: MixState): Promise<void>;
}

export interface MixState {
  mixer: Mixer;
}
