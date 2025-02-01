// src/features/mix/services/MixRoutingService.ts

import { Chain, Track } from "../types";

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
   * Disposes of all audio nodes.
   * @param node - The node to dispose
   */
  disposeNode(node: AudioNode): void {
    if ("disconnect" in node) {
      node.disconnect();
    }
  }

  routeNewTrackInstrument(track: Track): void {
    if (!track.instrumentNode) {
      throw new Error("Track does not have an instrument node.");
    }
    this.connect(track.instrumentNode, track.inputNode);
  }

  routeNewChainInstrument(chain: Chain): void {
    if (!chain.instrumentNode) {
      throw new Error("Chain does not have an instrument node.");
    }
    this.connect(chain.instrumentNode, chain.inputNode);
  }
}
