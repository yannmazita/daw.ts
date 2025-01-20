// src/features/mix/types.ts
import { AudioNode } from "@/core/types/audio";

export type Device = SoundChain | AudioNode;

export interface Track {
  id: string;
  name: string;
  inputNode: AudioNode | null;
  outputNode: GainNode;
  panNode: StereoPannerNode;
  isMuted: boolean;
  isSoloed: boolean;
  previousGain: number;
  sends: Send[];
  soundChain?: SoundChain;
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
  instrument: AudioNode | null;
  effects: Record<string, AudioNode>;
  effectsOrder: string[];
  outputNode: GainNode;
  panNode: StereoPannerNode;
  isMuted: boolean;
  isSoloed: boolean;
  previousGain: number;
}

export interface SoundChain {
  id: string;
  name: string;
  chains: Record<string, Chain>;
  chainsOrder: string[];
  outputNode: AudioNode;
  chainSelector: number;
}

export interface Mixer {
  tracks: Record<string, Track>;
  returnTracks: Record<string, ReturnTrack>;
  masterTrack: MasterTrack;
  soloedElementsIds: Set<string>;
}

export interface MasterTrack {
  id: string;
  name: string;
  inputNode: AudioNode;
  outputNode: AudioDestinationNode;
  panNode: StereoPannerNode;
  isMuted: boolean;
  isSoloed: boolean;
  effects: Record<string, AudioNode>;
  effectsOrder: string[];
}

export interface MixState {
  mixer: Mixer;
}
