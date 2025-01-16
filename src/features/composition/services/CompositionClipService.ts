// src/features/composition/services/CompositionClipService.ts
import { useEngineStore } from "@/core/stores/useEngineStore";
import { ClipEngine, CompositionClip } from "@/features/clips/types";

export class CompositionClipService {
  constructor(private readonly clipEngine: ClipEngine) {}

  async importMidi(
    file: File,
    clipId?: string,
    trackId?: string,
    instrumentId?: string,
  ): Promise<void> {
    const state = useEngineStore.getState().clips;
    const newState = await this.clipEngine.importMidi(
      state,
      file,
      clipId,
      trackId,
      instrumentId,
    );
    useEngineStore.setState({ clips: newState });
  }

  async exportMidi(clipId: string): Promise<void> {
    const state = useEngineStore.getState().clips;
    // todo
    return new Promise(() => {});
  }

  createClip(
    type: CompositionClip["type"],
    startTime: number,
    parentId: string,
    name?: string,
    instrumentId?: string,
  ): void {
    const state = useEngineStore.getState().clips;
    const newState = this.clipEngine.createClip(
      state,
      type,
      startTime,
      parentId,
      name,
      instrumentId,
    );
    useEngineStore.setState({ clips: newState });
  }

  deleteClip(clipId: string): void {
    const state = useEngineStore.getState().clips;
    const newState = this.clipEngine.deleteClip(state, clipId);
    useEngineStore.setState({ clips: newState });
  }

  moveClip(clipId: string, startTime: number): void {
    const state = useEngineStore.getState().clips;
    const newState = this.clipEngine.moveClip(state, clipId, startTime);
    useEngineStore.setState({ clips: newState });
  }

  setClipFades(clickId: string, fadeIn: number, fadeOut: number): void {
    const state = useEngineStore.getState().clips;
    const newState = this.clipEngine.setClipFades(
      state,
      clickId,
      fadeIn,
      fadeOut,
    );
    useEngineStore.setState({ clips: newState });
  }

  playClip(clipId: string, startTime?: number): void {
    const state = useEngineStore.getState();
    const newState = this.clipEngine.playClip(state, clipId, startTime);
    useEngineStore.setState({
      clips: newState.clips,
      sampler: newState.sampler,
    });
  }

  pauseClip(clipId: string): void {
    const state = useEngineStore.getState().clips;
    const newState = this.clipEngine.pauseClip(state, clipId);
    useEngineStore.setState({ clips: newState });
  }

  stopClip(clipId: string): void {
    const state = useEngineStore.getState().clips;
    const newState = this.clipEngine.stopClip(state, clipId);
    useEngineStore.setState({ clips: newState });
  }

  getClipPlaybackPosition(clipId: string): number {
    const state = useEngineStore.getState().clips;
    return this.clipEngine.getClipPlaybackPosition(state, clipId);
  }

  dispose(): void {
    const state = useEngineStore.getState().clips;
    this.clipEngine.dispose(state);
  }
}
