// src/features/mix/services/MixEngine.ts
import { MasterTrack, MixState } from "../types";
import { MixRoutingService } from "./MixRoutingService";
import { MixTrackService } from "./MixTrackService";
import { MixParameterService } from "./MixParameterService";

/**
 * Main class for the mix engine.
 */
export class MixEngineImpl {
  private audioContext: AudioContext;
  private routingService: MixRoutingService;
  private trackService: MixTrackService;
  private parameterService: MixParameterService;

  constructor() {
    this.audioContext = new AudioContext();
    this.routingService = new MixRoutingService(this.audioContext);
    this.trackService = new MixTrackService(
      this.audioContext,
      this.routingService,
    );
    this.parameterService = new MixParameterService(this.audioContext);
  }

  /**
   * Initializes the mixer with a master track.
   * @param state - The current state.
   * @returns The updated state.
   */
  initializeMixer(state: MixState): MixState {
    const masterTrack = this.createMasterTrack();
    return { ...state, mixer: { ...state.mixer, masterTrack } };
  }

  /**
   * Creates a master track.
   * The Master Track input node is connected to pan then to destination (speakers etc).
   * @returns The created master track.
   */
  private createMasterTrack(): MasterTrack {
    const inputNode = this.audioContext.createGain();
    const outputNode = this.audioContext.destination;
    const panNode = this.audioContext.createStereoPanner();

    const masterTrack: MasterTrack = {
      id: "master",
      name: "Master Track",
      inputNode,
      outputNode,
      panNode,
      isMuted: false,
      isSoloed: false,
      effects: {},
      effectsOrder: [],
    };
    this.routingService.connect(masterTrack.inputNode, masterTrack.panNode);
    this.routingService.connect(masterTrack.panNode, masterTrack.outputNode);
    return masterTrack;
  }

  /**
   * Creates a new track.
   * @param state - The current state.
   * New tracks send to the Master Track by default.
   * @param name - The name of the track.
   * @returns The updated state.
   */
  createTrack(state: MixState, name: string): MixState {
    const track = this.trackService.createTrack(name);
    const masterTrack = state.mixer.masterTrack;
    this.routingService.connectTrackInput(track);
    this.routingService.connectTrackOutput(track, masterTrack.inputNode);
    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: { ...state.mixer.tracks, [track.id]: track },
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
    name: string,
  ): MixState {
    const track = state.mixer.tracks[trackId];
    const returnTrack = state.mixer.returnTracks[returnTrackId];

    if (!track || !returnTrack) {
      throw new Error("Track or return track not found");
    }

    const send = this.trackService.createSend(track, returnTrack, name);
    this.routingService.connectSendToReturn(send, returnTrack);
    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: {
          ...state.mixer.tracks,
          [trackId]: {
            ...state.mixer.tracks[trackId],
            sends: [...state.mixer.tracks[trackId].sends, send],
          },
        },
      },
    };
  }

  /**
   * Creates a new return track.
   * @param state - The current state.
   * @param name - The name of the return track.
   * @returns The updated state.
   */
  createReturnTrack(state: MixState, name: string): MixState {
    const returnTrack = this.trackService.createReturnTrack(name);
    this.routingService.connectTrackOutput(
      returnTrack,
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
      },
    };
  }

  /**
   * Creates a new sound chain.
   * @param state - The current state.
   * @param trackId - The id of the track to add the chain to.
   * @param name - The name of the sound chain.
   * @returns The updated state.
   */
  createSoundChain(state: MixState, trackId: string, name: string): MixState {
    const soundChain = this.trackService.createSoundChain(name);
    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: {
          ...state.mixer.tracks,
          [trackId]: {
            ...state.mixer.tracks[trackId],
            soundChain,
          },
        },
      },
    };
  }

  /**
   * Creates a new chain.
   * @param state - The current state.
   * @param trackId - The id of the sound chain track.
   * @param name - The name of the chain.
   * @param instrument - The instrument node of the chain.
   * @returns The updated state.
   * @throws If track has no sound chain.
   */
  createChain(
    state: MixState,
    trackId: string,
    name: string,
    instrument: AudioNode | null = null,
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
    this.routingService.connectChainOutput(chain, soundChain.outputNode);

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
      track.sends.forEach((send) => {
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
