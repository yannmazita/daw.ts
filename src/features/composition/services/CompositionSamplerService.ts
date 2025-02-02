// src/features/composition/services/CompositionSamplerService.ts
import { useEngineStore } from "@/core/stores/useEngineStore";
import { SamplerEngine } from "@/features/sampler/types";
import { FileWithDirectoryAndFileHandle } from "browser-fs-access";

export class CompositionSamplerService {
  constructor(private readonly samplerEngine: SamplerEngine) {}

  createSamplerInstrumentForTrack(trackId: string, name?: string): void {
    const state = useEngineStore.getState();
    const newState = this.samplerEngine.createSamplerInstrumentForTrack(
      state,
      trackId,
      name,
    );
    useEngineStore.setState({ ...newState });
  }

  createSamplerInstrumentForChain(
    trackId: string,
    chainId: string,
    name?: string,
  ): void {
    const state = useEngineStore.getState();
    const newState = this.samplerEngine.createSamplerInstrumentForChain(
      state,
      trackId,
      chainId,
      name,
    );
    useEngineStore.setState({ ...newState });
  }

  loadDirectory(
    blobs: FileWithDirectoryAndFileHandle[] | FileSystemDirectoryHandle[],
  ): void {
    this.samplerEngine.loadDirectory(blobs);
  }

  async dispose(): Promise<void> {
    const state = useEngineStore.getState().sampler;
    const newState = await this.samplerEngine.dispose(state);
    useEngineStore.setState({ sampler: newState });
  }
}
