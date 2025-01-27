// src/features/composition/services/CompositionSamplerService.ts
import { useEngineStore } from "@/core/stores/useEngineStore";
import { SamplerEngine } from "@/features/sampler/types";

export class CompositionSamplerService {
  constructor(private readonly samplerEngine: SamplerEngine) {}

  async dispose(): Promise<void> {
    const state = useEngineStore.getState().sampler;
    const newState = await this.samplerEngine.dispose(state);
    useEngineStore.setState({ sampler: newState });
  }
}
