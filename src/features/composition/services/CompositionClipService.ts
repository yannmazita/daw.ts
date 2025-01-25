// src/features/composition/services/CompositionClipService.ts
import { useEngineStore } from "@/core/stores/useEngineStore";
import { ClipEngine } from "@/features/clips/types";
import { MidiFile } from "midifile-ts";

export class CompositionClipService {
  constructor(private readonly clipEngine: ClipEngine) {}

  importMidiFile(trackId: string, file: File, name?: string): void {
    const state = useEngineStore.getState();
    const newClipsState = this.clipEngine.importMidiFile(
      state,
      trackId,
      file,
      name,
    );
    useEngineStore.setState({ clips: newClipsState });
  }

  createMidiClip(trackId: string, midiData: MidiFile, name?: string): void {
    const state = useEngineStore.getState();
    const newClipsState = this.clipEngine.createMidiClip(
      state,
      trackId,
      midiData,
      name,
    );
    useEngineStore.setState({ clips: newClipsState });
  }

  dispose(): void {
    const state = useEngineStore.getState().clips;
    this.clipEngine.dispose(state);
  }
}
