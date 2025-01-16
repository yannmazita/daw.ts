// src/features/composition/services/CompositionSamplerService.ts
import { useEngineStore } from "@/core/stores/useEngineStore";
import { SamplerEngine } from "@/features/sampler/types";

export class CompositionSamplerService {
  constructor(private readonly samplerEngine: SamplerEngine) {}

  startSamplerPlayback(clipId: string, startTime?: number): void {
    const state = useEngineStore.getState();
    const newState = this.samplerEngine.startSamplerPlayback(
      state,
      clipId,
      startTime,
    );
    useEngineStore.setState({
      clips: newState.clips,
      sampler: newState.sampler,
    });
  }

  async loadInstrument(sfzFile: File): Promise<void> {
    const state = useEngineStore.getState().sampler;
    const newState = await this.samplerEngine.loadInstrument(state, sfzFile);
    useEngineStore.setState({ sampler: newState });
  }

  createSampler(instrumentId: string): void {
    const state = useEngineStore.getState().sampler;
    const newState = this.samplerEngine.createSampler(state, instrumentId);
    useEngineStore.setState({ sampler: newState });
  }

  dispose(): void {
    const state = useEngineStore.getState().sampler;
    const newState = this.samplerEngine.dispose(state);
    useEngineStore.setState({ sampler: newState });
  }
}
