// src/features/sampler/services/SamplerEngine.ts
import { TransportEngine } from "@/features/transport/types";
import { SamplerEngine, SamplerState } from "../types";
import { SamplerInstrumentService } from "./SamplerInstrumentService";
import { EngineState } from "@/core/stores/useEngineStore";
import { FileLoaderService } from "./FileLoaderService";
import { MixRoutingService } from "@/features/mix/services/MixRoutingService";

export class SamplerEngineImpl implements SamplerEngine {
  private loader: FileLoaderService;

  constructor(
    private audioContext: AudioContext,
    private transport: TransportEngine,
    private routingSeriver: MixRoutingService,
  ) {
    this.loader = new FileLoaderService(this.audioContext);
  }

  /**
   * Create a sampler instrument for a track.
   * @param state - The current engine state.
   * @param trackId - The parent track ID.
   * @returns The updated engine state.
   * @throws If track is not found, or if track does not have
   * a sound chain when chainId is given.
   * */
  createSamplerInstrumentForTrack(
    state: EngineState,
    trackId: string,
  ): EngineState {
    const track = state.mix.mixer.tracks[trackId];

    if (!track) {
      throw new Error("Track not found.");
    }
    const id = crypto.randomUUID();
    const instrument = new SamplerInstrumentService(
      this.audioContext,
      this.transport,
      this.loader,
    );
    const instrumentNode = instrument.getOutputNode();
    this.routingSeriver.connect(instrumentNode, track.inputNode);

    return {
      ...state,
      mix: {
        ...state.mix,
        mixer: {
          ...state.mix.mixer,
          tracks: {
            ...state.mix.mixer.tracks,
            [trackId]: {
              ...track,
              instrumentNode,
            },
          },
        },
      },
      sampler: {
        ...state.sampler,
        samplers: {
          ...state.sampler.samplers,
          [id]: {
            id,
            trackId,
            instrument,
          },
        },
      },
    };
  }

  /**
   * Create a sampler instrument for a chain.
   * @param state - The current engine state.
   * @param trackId - The parent track ID.
   * @param chainId - Chain ID to create the instrument for.
   * @returns The updated engine state.
   * @throws If track is not found, or if track does not have
   * a sound chain when chainId is given.
   * */
  createSamplerInstrumentForChain(
    state: EngineState,
    trackId: string,
    chainId: string,
  ): EngineState {
    const track = state.mix.mixer.tracks[trackId];

    if (!track) {
      throw new Error("Track not found.");
    } else if (!track.soundChain) {
      throw new Error("Track does not have a sound chain.");
    } else if (!track.soundChain.chains[chainId]) {
      throw new Error("Chain not found.");
    }

    const id = crypto.randomUUID();
    const instrument = new SamplerInstrumentService(
      this.audioContext,
      this.transport,
      this.loader,
    );
    const instrumentNode = instrument.getOutputNode();
    // todo: chain routing

    return {
      ...state,
      mix: {
        ...state.mix,
        mixer: {
          ...state.mix.mixer,
          tracks: {
            ...state.mix.mixer.tracks,
            [trackId]: {
              ...track,
              soundChain: {
                ...track.soundChain,
                chains: {
                  ...track.soundChain.chains,
                  [chainId]: {
                    ...track.soundChain.chains[chainId],
                    instrumentNode,
                  },
                },
              },
            },
          },
        },
      },
      sampler: {
        ...state.sampler,
        samplers: {
          ...state.sampler.samplers,
          [id]: {
            id,
            trackId,
            chainId,
            instrument,
          },
        },
      },
    };
  }

  async dispose(state: SamplerState): Promise<SamplerState> {
    Object.values(state.samplers).forEach((sampler) => {
      sampler.instrument.getOutputNode().disconnect();
    });
    return Promise.resolve({ samplers: {} });
  }
}
