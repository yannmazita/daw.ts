// src/features/composition/services/CompositionMixService.ts
import { MixEngine, TrackType } from "@/features/mix/types";
import { useEngineStore } from "@/core/stores/useEngineStore";

export class CompositionMixService {
  constructor(private readonly mixEngine: MixEngine) {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.initializeMixer(state);
    useEngineStore.setState({ mix: newState });
  }

  createTrack(type: TrackType, name?: string): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.createTrack(state, type, name);
    useEngineStore.setState({ mix: newState });
  }

  createSend(trackId: string, returnTrackId: string, name?: string): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.createSend(
      state,
      trackId,
      returnTrackId,
      name,
    );
    useEngineStore.setState({ mix: newState });
  }

  createReturnTrack(name?: string): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.createReturnTrack(state, name);
    useEngineStore.setState({ mix: newState });
  }

  createSoundChain(trackId: string, name?: string): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.createSoundChain(state, trackId, name);
    useEngineStore.setState({ mix: newState });
  }

  createChain(
    trackId: string,
    name?: string,
    instrument?: AudioNode | null,
  ): void {
    const state = useEngineStore.getState().mix;
    const newState = this.mixEngine.createChain(
      state,
      trackId,
      name,
      instrument,
    );
    useEngineStore.setState({ mix: newState });
  }

  async dispose(): Promise<void> {
    const state = useEngineStore.getState().mix;
    await this.mixEngine.dispose(state);
  }
}
