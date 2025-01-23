// src/features/mix/services/MixTrackService.ts
import {
  Track,
  Send,
  ReturnTrack,
  SoundChain,
  Chain,
  TrackType,
} from "@/features/mix/types";
import { AudioNode } from "@/core/types/audio";
import { MixRoutingService } from "./MixRoutingService";

/**
 * Manages tracks within the mix engine.
 */
export class MixTrackService {
  constructor(
    private audioContext: AudioContext,
    private routingService: MixRoutingService,
  ) {}

  /**
   * Creates a new track.
   * The pan node is connected to the output node on track creation.
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
      name: name ?? "New Track",
      inputNode,
      outputNode,
      panNode,
      isMuted: false,
      isSoloed: false,
      previousGain: 1,
      sends: {},
      sendsOrder: [],
      soundChain: null,
    };
    this.routingService.connect(track.panNode, track.outputNode);
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
   * The pan node is connected to the output node on return track creation.
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
    this.routingService.connect(returnTrack.panNode, returnTrack.outputNode);
    return returnTrack;
  }

  /**
   * Creates a new sound chain. No wiring.
   * @param name - The name of the sound chain.
   * @returns The created sound chain.
   */
  createSoundChain(name?: string): SoundChain {
    const outputNode = this.audioContext.createGain();
    const soundChain: SoundChain = {
      id: crypto.randomUUID(),
      name: name ?? "New Sound Chain",
      chains: {},
      chainsOrder: [],
      outputNode,
    };
    return soundChain;
  }

  /**
   * Creates a new chain.
   * The pan node is wired to the output node. When provided, the instrument is wired to the pan node.
   * @param name - The name of the chain.
   * @param instrument - The instrument node of the chain.
   * @returns The created chain.
   */
  createChain(name?: string, instrument?: AudioNode): Chain {
    const outputNode = this.audioContext.createGain();
    const panNode = this.audioContext.createStereoPanner();
    const chain: Chain = {
      id: crypto.randomUUID(),
      name: name ?? "New Chain",
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
    if (instrument) {
      this.routingService.connect(instrument, chain.panNode);
    }
    this.routingService.connect(chain.panNode, chain.outputNode);
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
