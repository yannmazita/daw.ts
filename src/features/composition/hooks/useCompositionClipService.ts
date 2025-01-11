// src/features/composition/hooks/useCompositionClipService.ts
import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { MidiClipContent } from "@/features/clips/types";
import { ToneAudioBuffer } from "tone";

export const useCompositionClipService = () => {
  const compositionEngine = useCompositionEngine();

  const createMidiClip = useCallback(
    (midiData: MidiClipContent) => {
      compositionEngine.createMidiClip(midiData);
    },
    [compositionEngine],
  );

  const createAudioClip = useCallback(
    (buffer: ToneAudioBuffer) => {
      compositionEngine.createAudioClip(buffer);
    },
    [compositionEngine],
  );

  const addClip = useCallback(
    (contentId: string, startTime: number) => {
      compositionEngine.addClip(contentId, startTime);
    },
    [compositionEngine],
  );

  const removeClip = useCallback(
    (clipId: string) => {
      compositionEngine.removeClip(clipId);
    },
    [compositionEngine],
  );

  const moveClip = useCallback(
    (clipId: string, newTime: number) => {
      compositionEngine.moveClip(clipId, newTime);
    },
    [compositionEngine],
  );

  return {
    createMidiClip,
    createAudioClip,
    addClip,
    removeClip,
    moveClip,
  };
};
