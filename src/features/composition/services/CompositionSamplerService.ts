// src/features/composition/services/CompositionSamplerService.ts
import { useEngineStore } from "@/core/stores/useEngineStore";
import { FileLoaderService } from "@/features/sampler/services/FileLoaderService";
import { SamplerEngine } from "@/features/sampler/types";

export class CompositionSamplerService {
  constructor(private readonly samplerEngine: SamplerEngine) {}

  async loadLocalInstrument(): Promise<void> {
    await this.samplerEngine.loadLocalInstrument();
  }

  getFileLoader(): FileLoaderService {
    return this.samplerEngine.getFileLoader();
  }

  async dispose(): Promise<void> {
    const state = useEngineStore.getState().sampler;
    const newState = await this.samplerEngine.dispose(state);
    useEngineStore.setState({ sampler: newState });
  }
}
