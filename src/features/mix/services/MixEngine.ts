// src/features/mix/services/MixEngine.ts
import { MasterTrack, MixEngine, MixState, TrackType } from "../types";
import { MixRoutingService } from "./MixRoutingService";
import { MixTrackService } from "./MixTrackService";
import { MixParameterService } from "./MixParameterService";
import { SamplerEngine } from "@/features/sampler/types";

/**
 * Main class for the mix engine.
 */
export class MixEngineImpl implements MixEngine {
  private routingService: MixRoutingService;
  private trackService: MixTrackService;
  private parameterService: MixParameterService;

  constructor(private audioContext: AudioContext) {
    this.routingService = new MixRoutingService(this.audioContext);
    this.trackService = new MixTrackService(this.audioContext);
    this.parameterService = new MixParameterService(this.audioContext);
  }

  /**
   * Initializes the mixer with a master track, 2 midi tracks and 2 audio tracks.
   * @param state - The current state.
   * @returns The updated state.
   */
  initializeMixer(state: MixState): MixState {
    const masterTrack = this.createMasterTrack();
    const newState1 = this.createTrack(state, "midi");
    const newState2 = this.createTrack(state, "midi");
    const newState3 = this.createTrack(state, "audio");
    const newState4 = this.createTrack(state, "audio");
    return {
      ...state,
      mixer: {
        ...state.mixer,
        masterTrack,
        tracks: {
          ...state.mixer.tracks,
          [newState1.mixer.tracksOrder[0]]:
            newState1.mixer.tracks[newState1.mixer.tracksOrder[0]],
          [newState2.mixer.tracksOrder[0]]:
            newState2.mixer.tracks[newState2.mixer.tracksOrder[0]],
          [newState3.mixer.tracksOrder[0]]:
            newState3.mixer.tracks[newState3.mixer.tracksOrder[0]],
          [newState4.mixer.tracksOrder[0]]:
            newState4.mixer.tracks[newState4.mixer.tracksOrder[0]],
        },
        tracksOrder: [
          ...state.mixer.tracksOrder,
          newState1.mixer.tracksOrder[0],
          newState2.mixer.tracksOrder[0],
          newState3.mixer.tracksOrder[0],
          newState4.mixer.tracksOrder[0],
        ],
      },
    };
  }

  /**
   * Creates a master track.
   * The Master Track input node is connected to pan then to destination (speakers etc).
   * @returns The created master track.
   */
  private createMasterTrack(): MasterTrack {
    const inputNode = this.audioContext.createGain();
    const gainNode = this.audioContext.createGain();
    const outputNode = this.audioContext.destination;
    const panNode = this.audioContext.createStereoPanner();

    const masterTrack: MasterTrack = {
      id: "master",
      name: "Master Track",
      inputNode,
      gainNode,
      outputNode,
      panNode,
      isMuted: false,
      isSoloed: false,
      previousGain: 1,
      effects: {},
      effectsOrder: [],
    };
    this.routingService.connect(masterTrack.inputNode, masterTrack.panNode);
    this.routingService.connect(masterTrack.panNode, masterTrack.gainNode);
    this.routingService.connect(masterTrack.gainNode, masterTrack.outputNode);
    return masterTrack;
  }

  /**
   * Creates a new track.
   * Track input is wired to track pan, track pan to track output, track output
   * to master track input. New tracks send to the Master Track by default.
   * @param state - The current state.
   * @param name - The name of the track.
   * @returns The updated state.
   */
  createTrack(state: MixState, type: TrackType, name?: string): MixState {
    const track = this.trackService.createTrack(type, name);
    const masterTrack = state.mixer.masterTrack;

    /*
    if (track.samplerInstance) {
      this.routingService.connect(
        track.samplerInstance.getOutputNode(),
        track.inputNode,
      );
    }
    */
    this.routingService.connect(track.inputNode, track.panNode);
    this.routingService.connect(track.panNode, track.outputNode);
    this.routingService.connect(track.outputNode, masterTrack.inputNode);
    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: { ...state.mixer.tracks, [track.id]: track },
        tracksOrder: [...state.mixer.tracksOrder, track.id],
      },
    };
  }

  /**
   * Creates a new send for a track.
   * @param state - The current state.
   * @param trackId - The id of the track to create the send for.
   * @param returnTrackId - The id of the return track to send to.
   * @param name - The name of the send.
   * @returns The updated state.
   * @throws If track or return track is not found.
   */
  createSend(
    state: MixState,
    trackId: string,
    returnTrackId: string,
    name?: string,
  ): MixState {
    const track = state.mixer.tracks[trackId];
    const returnTrack = state.mixer.returnTracks[returnTrackId];

    if (!track || !returnTrack) {
      throw new Error("Track or return track not found");
    }

    const send = this.trackService.createSend(track, returnTrack, name);

    if (!returnTrack.inputNode) {
      const inputNode = this.audioContext.createGain();
      returnTrack.inputNode = inputNode;
    }
    this.routingService.connect(send.outputNode, returnTrack.inputNode);

    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: {
          ...state.mixer.tracks,
          [trackId]: {
            ...state.mixer.tracks[trackId],
            sends: { ...state.mixer.tracks[trackId].sends, [send.id]: send },
            sendsOrder: [...state.mixer.tracks[trackId].sendsOrder, send.id],
          },
        },
        returnTracks: {
          ...state.mixer.returnTracks,
          [returnTrackId]: returnTrack,
        },
      },
    };
  }

  /**
   * Creates a new return track.
   * Return track pan is connected to return track output.
   * @param state - The current state.
   * @param name - The name of the return track.
   * @returns The updated state.
   */
  createReturnTrack(state: MixState, name?: string): MixState {
    const returnTrack = this.trackService.createReturnTrack(name);

    this.routingService.connect(returnTrack.panNode, returnTrack.outputNode);
    this.routingService.connect(
      returnTrack.outputNode,
      state.mixer.masterTrack.inputNode,
    );

    return {
      ...state,
      mixer: {
        ...state.mixer,
        returnTracks: {
          ...state.mixer.returnTracks,
          [returnTrack.id]: returnTrack,
        },
        returnTracksOrder: [...state.mixer.returnTracksOrder, returnTrack.id],
      },
    };
  }

  /**
   * Creates a new sound chain. An empty chain is added to the sound chain.
   * If track sound chain is active, track input is wired to sound chain input,
   * sound chain input to chain pan, chain pan to chain output, chain output to
   * sound chain output, sound chain output to track pan. Else only sound chain
   * and chain piping is done.
   * @param state - The current state.
   * @param trackId - The id of the track to add the chain to.
   * @param name - The name of the sound chain.
   * @throws If track is not found or already has a sound chain.
   * @returns The updated state.
   */
  createSoundChain(state: MixState, trackId: string, name?: string): MixState {
    const track = state.mixer.tracks[trackId];

    if (!track) {
      throw new Error("Track not found");
    } else if (track.soundChain) {
      throw new Error("Track already has a sound chain");
    }

    const soundChain = this.trackService.createSoundChain(name);
    const chain = this.trackService.createChain();
    soundChain.chains = { [chain.id]: chain };
    soundChain.chainsOrder = [chain.id];

    if (track.isSoundChainActive) {
      this.routingService.disconnect(track.inputNode, track.panNode);
      this.routingService.connect(track.inputNode, soundChain.inputNode);
      this.routingService.connect(soundChain.inputNode, chain.panNode);
      this.routingService.connect(chain.panNode, chain.outputNode);
      this.routingService.connect(chain.outputNode, soundChain.outputNode);
      this.routingService.connect(soundChain.outputNode, track.panNode);
    } else {
      this.routingService.connect(soundChain.inputNode, chain.panNode);
      this.routingService.connect(chain.panNode, chain.outputNode);
      this.routingService.connect(chain.outputNode, soundChain.outputNode);
    }

    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: {
          ...state.mixer.tracks,
          [trackId]: {
            ...track,
            soundChain,
          },
        },
        returnTracksOrder: [...state.mixer.returnTracksOrder, soundChain.id],
      },
    };
  }

  /**
   * Creates a new chain.
   * @param state - The current state.
   * @param trackId - The id of the sound chain track.
   * @param position - The chain position.
   * @param name - The name of the chain.
   * @param instrument - The instrument of the chain.
   * @returns The updated state.
   * @throws If track has no sound chain.
   */
  createChain(
    state: MixState,
    trackId: string,
    position: number,
    name?: string,
    instrument: SamplerEngine | null = null,
  ): MixState {
    const soundChain = state.mixer.tracks[trackId].soundChain;
    let chain = null;

    if (!soundChain) {
      throw new Error("Track has no sound chain");
    }

    if (instrument) {
      chain = this.trackService.createChain(name, instrument);
    } else {
      chain = this.trackService.createChain(name);
    }

    this.routingService.connect(chain.panNode, chain.outputNode);
    if (instrument) {
      // Connect SamplerEngine output if provided
      this.routingService.connect(instrument.getOutputNode(), chain.inputNode);
    }

    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: {
          ...state.mixer.tracks,
          [trackId]: {
            ...state.mixer.tracks[trackId],
            soundChain: {
              ...soundChain,
              chains: { ...soundChain.chains, [chain.id]: chain },
              chainsOrder: [...soundChain.chainsOrder, chain.id],
            },
          },
        },
      },
    };
  }

  /**
   * Toggle sound chain bypass in audio processing.
   * @param state - The current state.
   * @param trackId - The id of the track where sound chain is to be bypassed.
   * @throws If track is not found or has no sound chain.
   * @returns The updated state.
   */
  toggleSoundChain(state: MixState, trackId: string): MixState {
    const track = state.mixer.tracks[trackId];

    if (!track) {
      throw new Error("Track not found");
    } else if (!track.soundChain) {
      throw new Error("Track has no sound chain");
    }

    const soundChain = track.soundChain;

    if (track.isSoundChainActive) {
      this.routingService.disconnect(track.inputNode, soundChain.inputNode);
      this.routingService.disconnect(soundChain.outputNode, track.panNode);
      this.routingService.connect(track.inputNode, track.panNode);
    } else {
      this.routingService.disconnect(track.inputNode, track.panNode);
      this.routingService.connect(track.inputNode, soundChain.inputNode);
      this.routingService.connect(soundChain.outputNode, track.panNode);
    }

    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: {
          ...state.mixer.tracks,
          [trackId]: {
            ...track,
            isSoundChainActive: !track.isSoundChainActive,
          },
        },
      },
    };
  }

  getRoutingService(): MixRoutingService {
    return this.routingService;
  }

  getTrackService(): MixTrackService {
    return this.trackService;
  }

  getParameterService(): MixParameterService {
    return this.parameterService;
  }

  /**
   * Disposes of the mix engine and releases resources.
   */
  async dispose(state: MixState): Promise<void> {
    // Dispose all nodes
    for (const trackId in state.mixer.tracks) {
      const track = state.mixer.tracks[trackId];
      this.routingService.disposeNode(track.outputNode);
      if (track.inputNode) {
        this.routingService.disposeNode(track.inputNode);
      }
      Object.values(track.sends).forEach((send) => {
        this.routingService.disposeNode(send.outputNode);
      });
    }

    for (const returnTrackId in state.mixer.returnTracks) {
      const returnTrack = state.mixer.returnTracks[returnTrackId];
      this.routingService.disposeNode(returnTrack.outputNode);
      if (returnTrack.inputNode) {
        this.routingService.disposeNode(returnTrack.inputNode);
      }
    }

    this.routingService.disposeNode(state.mixer.masterTrack.inputNode);
    this.routingService.disposeNode(state.mixer.masterTrack.outputNode);
    // Close the audio context
    await this.audioContext.close();
  }
}
