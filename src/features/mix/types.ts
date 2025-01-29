// src/features/mix/types.ts
import { MixParameterService } from "./services/MixParameterService";
import { MixTrackService } from "./services/MixTrackService";
import { MixRoutingService } from "./services/MixRoutingService";
import { SamplerEngine } from "@/features/sampler/types";

export type TrackType = "audio" | "midi";

export interface Track {
  id: string;
  type: TrackType;
  name: string;
  inputNode: AudioNode;
  outputNode: GainNode;
  panNode: StereoPannerNode;
  isSoundChainActive: boolean;
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
  inputNode: GainNode;
  outputNode: GainNode;
  instrument: SamplerEngine | null;
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
  inputNode: AudioNode;
  outputNode: GainNode;
  chains: Record<string, Chain>;
  chainsOrder: string[];
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
  createTrack(state: MixState, type: TrackType, name?: string): MixState;
  createSend(
    state: MixState,
    trackId: string,
    returnTrackId: string,
    name?: string,
  ): MixState;
  createReturnTrack(state: MixState, name?: string): MixState;
  createSoundChain(state: MixState, trackId: string, name?: string): MixState;

  createChain(
    state: MixState,
    trackId: string,
    position: number,
    name?: string,
    instrument?: AudioNode | SamplerEngine | null,
  ): MixState;

  toggleSoundChain(state: MixState, trackId: string): MixState;

  getRoutingService(): MixRoutingService;
  getTrackService(): MixTrackService;
  getParameterService(): MixParameterService;

  dispose(state: MixState): Promise<void>;
}

export interface MixState {
  mixer: Mixer;
}
