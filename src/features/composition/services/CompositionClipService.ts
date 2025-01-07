// src/features/composition/services/CompositionClipService.ts
import { useEngineStore } from "@/core/stores/useEngineStore";
import {
  ClipContent,
  ClipEngine,
  ClipLoop,
  MidiClipContent,
} from "@/features/clips/types";
import { ToneAudioBuffer } from "tone";

export class CompositionClipService {
  constructor(private readonly clipEngine: ClipEngine) {}

  createMidiClip(midiData: MidiClipContent): void {
    const state = useEngineStore.getState().clips;
    const newState = this.clipEngine.createMidiClip(state, midiData);
    useEngineStore.setState({ clips: newState });
  }

  createAudioClip(buffer: ToneAudioBuffer): void {
    const state = useEngineStore.getState().clips;
    const newState = this.clipEngine.createAudioClip(state, buffer);
    useEngineStore.setState({ clips: newState });
  }

  getClipContent(clipId: string): ClipContent {
    const state = useEngineStore.getState().clips;
    return this.clipEngine.getClipContent(state, clipId);
  }

  addClip(contentId: string, startTime: number): void {
    const state = useEngineStore.getState();
    const newState = this.clipEngine.addClip(state, contentId, startTime);
    useEngineStore.setState(newState);
  }

  removeClip(clipId: string): void {
    const state = useEngineStore.getState();
    const newState = this.clipEngine.removeClip(state, clipId);
    useEngineStore.setState(newState);
  }

  moveClip(clipId: string, newTime: number): void {
    const state = useEngineStore.getState();
    const newState = this.clipEngine.moveClip(state, clipId, newTime);
    useEngineStore.setState(newState);
  }

  setClipLoop(clipId: string, enabled: boolean, settings?: ClipLoop): void {
    const state = useEngineStore.getState().clips;
    const newState = this.clipEngine.setClipLoop(
      state,
      clipId,
      enabled,
      settings,
    );
    useEngineStore.setState({ clips: newState });
  }

  setClipGain(clipId: string, gain: number): void {
    const state = useEngineStore.getState().clips;
    const newState = this.clipEngine.setClipGain(state, clipId, gain);
    useEngineStore.setState({ clips: newState });
  }

  setClipFades(clipId: string, fadeIn: number, fadeOut: number): void {
    const state = useEngineStore.getState().clips;
    const newState = this.clipEngine.setClipFades(
      state,
      clipId,
      fadeIn,
      fadeOut,
    );
    useEngineStore.setState({ clips: newState });
  }

  playClip(clipId: string, startTime?: number): void {
    const state = useEngineStore.getState().clips;
    this.clipEngine.playClip(state, clipId, startTime);
  }

  stopClip(clipId: string): void {
    const state = useEngineStore.getState().clips;
    this.clipEngine.stopClip(state, clipId);
  }

  isClipPlaying(clipId: string): boolean {
    const state = useEngineStore.getState().clips;
    return this.clipEngine.isClipPlaying(state, clipId);
  }

  getPlaybackState(clipId: string): boolean {
    const state = useEngineStore.getState().clips;
    return this.clipEngine.isClipPlaying(state, clipId);
  }

  dispose(): void {
    const state = useEngineStore.getState();
    this.clipEngine.dispose(state);
  }
}
