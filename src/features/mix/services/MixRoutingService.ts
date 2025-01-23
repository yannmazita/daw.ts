// src/features/mix/services/MixRoutingService.ts
import { Track, SoundChain, Chain } from "@/features/mix/types";
import { AudioNode } from "@/core/types/audio";

/**
 * Handles audio routing within the mix engine.
 */
export class MixRoutingService {
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  /**
   * Connects an audio node to another.
   * @param source - The source audio node.
   * @param destination - The destination audio node.
   */
  connect(source: AudioNode, destination: AudioNode): void {
    if (source && destination && "connect" in source) {
      source.connect(destination);
    }
  }

  /**
   * Disconnects an audio node from another.
   * @param source - The source audio node.
   * @param destination - The destination audio node.
   */
  disconnect(source: AudioNode, destination: AudioNode): void {
    if (source && destination && "disconnect" in source) {
      source.disconnect(destination);
    }
  }

  /**
   * Connects a sound chain's output to a destination.
   * @param soundChain - The sound chain to connect.
   * @param destination - The destination audio node.
   */
  connectSoundChainOutput(
    soundChain: SoundChain,
    destination: AudioNode,
  ): void {
    this.connect(soundChain.outputNode, destination);
  }

  /**
   * Disconnects a sound chain's output from a destination.
   * @param soundChain - The sound chain to disconnect.
   * @param destination - The destination audio node.
   */
  disconnectSoundChainOutput(
    soundChain: SoundChain,
    destination: AudioNode,
  ): void {
    this.disconnect(soundChain.outputNode, destination);
  }

  /**
   * Connects a chain's output to a destination.
   * @param chain - The chain to connect.
   * @param destination - The destination audio node.
   */
  connectChainOutput(chain: Chain, destination: AudioNode): void {
    if (chain.effectsOrder.length > 0) {
      this.connect(
        chain.effects[chain.effectsOrder[chain.effectsOrder.length - 1]],
        destination,
      );
    } else if (chain.instrument) {
      this.connect(chain.instrument, destination);
    }
  }

  /**
   * Disconnects a chain's output from a destination.
   * @param chain - The chain to disconnect.
   * @param destination - The destination audio node.
   */
  disconnectChainOutput(chain: Chain, destination: AudioNode): void {
    if (chain.effectsOrder.length > 0) {
      this.disconnect(
        chain.effects[chain.effectsOrder[chain.effectsOrder.length - 1]],
        destination,
      );
    } else if (chain.instrument) {
      this.disconnect(chain.instrument, destination);
    }
  }

  /**
   * Connects a track's input node to its first processing node
   * @param track - The track to connect.
   */
  connectTrackInput(track: Track): void {
    if (track.soundChain) {
      if (track.soundChain.chainsOrder.length > 0) {
        const firstChain =
          track.soundChain.chains[track.soundChain.chainsOrder[0]];
        if (firstChain.instrument) {
          this.connect(firstChain.instrument, track.inputNode);
        }
      }
    } else {
      this.connect(track.inputNode, track.outputNode);
    }
  }

  /**
   * Disconnects a track's input node from its first processing node
   * @param track - The track to disconnect.
   */
  disconnectTrackInput(track: Track): void {
    if (track.soundChain && track.inputNode) {
      if (track.soundChain.chainsOrder.length > 0) {
        const firstChain =
          track.soundChain.chains[track.soundChain.chainsOrder[0]];
        if (firstChain.instrument) {
          this.disconnect(track.inputNode, firstChain.instrument);
        } else {
          console.warn(
            `Chain ${firstChain.id} has no instrument, cannot disconnect`,
          );
        }
      }
    } else if (track.inputNode && track.outputNode) {
      this.disconnect(track.inputNode, track.outputNode);
    } else {
      console.warn(`Track ${track.id} has no input node, cannot disconnect`);
    }
  }

  /**
   * Disposes of all audio nodes.
   * @param node - The node to dispose
   */
  disposeNode(node: AudioNode): void {
    if ("disconnect" in node) {
      node.disconnect();
    }
  }
}
