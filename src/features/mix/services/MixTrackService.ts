// src/features/mix/services/MixTrackService.ts
import {
  Track,
  Send,
  ReturnTrack,
  SoundChain,
  Chain,
  TrackType,
} from "@/features/mix/types";

/**
 * Manages tracks within the mix engine.
 */
export class MixTrackService {
  constructor(private audioContext: AudioContext) {}

  /**
   * Creates a new track.
   * @param name - The name of the track.
   * @returns The created track.
   */
  createTrack(type: TrackType, name?: string): Track {
    const inputNode = this.audioContext.createGain();
    const outputNode = this.audioContext.createGain();
    const panNode = this.audioContext.createStereoPanner();

    const track: Track = {
      id: crypto.randomUUID(),
      type,
      name: name ?? `New ${type} Track`,
      inputNode,
      outputNode,
      panNode,
      isSoundChainActive: false,
      isMuted: false,
      isSoloed: false,
      previousGain: 1,
      sends: {},
      sendsOrder: [],
      soundChain: null,
    };
    return track;
  }

  /**
   * Creates a new send for a track. No node wiring.
   * @param track - The track to create the send for.
   * @param returnTrack - The return track to send to.
   * @param name - The name of the send.
   * @returns The created send.
   */
  createSend(track: Track, returnTrack: ReturnTrack, name?: string): Send {
    const outputNode = this.audioContext.createGain();
    const send: Send = {
      id: crypto.randomUUID(),
      name: name ?? "New Send",
      outputNode,
      trackId: track.id,
      returnTrackId: returnTrack.id,
      preFader: false,
    };
    return send;
  }

  /**
   * Creates a new return track. Return track pan node is wired to output node.
   * @param name - The name of the return track.
   * @returns The created return track.
   */
  createReturnTrack(name?: string): ReturnTrack {
    const inputNode = this.audioContext.createGain();
    const outputNode = this.audioContext.createGain();
    const panNode = this.audioContext.createStereoPanner();

    const returnTrack: ReturnTrack = {
      id: crypto.randomUUID(),
      name: name ?? "New Return Track",
      inputNode,
      outputNode,
      panNode,
      isMuted: false,
      isSoloed: false,
      previousGain: 1,
      effects: {},
      effectsOrder: [],
    };
    return returnTrack;
  }

  /**
   * Creates a new sound chain. No wiring.
   * @param name - The name of the sound chain.
   * @returns The created sound chain.
   */
  createSoundChain(name?: string): SoundChain {
    const inputNode = this.audioContext.createGain();
    const outputNode = this.audioContext.createGain();
    const soundChain: SoundChain = {
      id: crypto.randomUUID(),
      name: name ?? "New Sound Chain",
      inputNode,
      outputNode,
      chains: {},
      chainsOrder: [],
    };
    return soundChain;
  }

  /**
   * Creates a new chain.
   * @param name - The name of the chain.
   * @param instrument - The instrument node of the chain.
   * @returns The created chain.
   */
  createChain(name?: string, instrument?: AudioNode): Chain {
    const inputNode = this.audioContext.createGain();
    const outputNode = this.audioContext.createGain();
    const panNode = this.audioContext.createStereoPanner();
    const chain: Chain = {
      id: crypto.randomUUID(),
      name: name ?? "New Chain",
      inputNode,
      outputNode,
      instrument: instrument ?? null,
      effects: {},
      effectsOrder: [],
      panNode,
      isMuted: false,
      isSoloed: false,
      previousGain: 1,
      keyZone: null,
      velocityZone: null,
    };
    return chain;
  }

  /**
   * Adds an effect to a return track.
   * @param returnTrack - The return track to add the effect to.
   * @param effect - The effect to add.
   */
  addEffectToReturnTrack(returnTrack: ReturnTrack, effect: AudioNode): void {
    //todo: Implement effect adding for return tracks
  }

  /**
   * Adds an effect to a chain.
   * @param chain - The chain to add the effect to.
   * @param effect - The effect to add.
   */
  addEffectToChain(chain: Chain, effect: AudioNode): void {
    //todo: Implement effect adding for chains
  }
}
