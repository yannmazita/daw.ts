// src/features/clips/hooks/useClipsOperations.ts
import { useCallback, useMemo } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { CompositionClip } from "../types";

export const useClipOperations = () => {
  const compositionEngine = useCompositionEngine();
  const clips = useEngineStore((state) => state.clips.clips);
  const clipIds = useMemo(() => Object.keys(clips), [clips]);

  const importMidi = useCallback(
    async (
      file: File,
      clipId?: string,
      trackId?: string,
      instrumentId?: string,
    ) => {
      await compositionEngine.importMidi(file, clipId, trackId, instrumentId);
    },
    [compositionEngine],
  );
  const createClip = useCallback(
    (
      type: CompositionClip["type"],
      startTime: number,
      parentId: string,
      name?: string,
      instrumentId?: string,
    ) => {
      compositionEngine.createClip(
        type,
        startTime,
        parentId,
        name,
        instrumentId,
      );
    },
    [compositionEngine],
  );
  const deleteClip = useCallback(
    (clipId: string) => {
      compositionEngine.deleteClip(clipId);
    },
    [compositionEngine],
  );
  const moveClip = useCallback(
    (clipId: string, startTime: number) => {
      compositionEngine.moveClip(clipId, startTime);
    },
    [compositionEngine],
  );
  const setClipFades = useCallback(
    (clipId: string, fadeIn: number, fadeOut: number) => {
      compositionEngine.setClipFades(clipId, fadeIn, fadeOut);
    },
    [compositionEngine],
  );
  const setClipInstrument = useCallback(
    (clipId: string, instrumentId: string) => {
      compositionEngine.setClipInstrument(clipId, instrumentId);
    },
    [compositionEngine],
  );
  const playClip = useCallback(
    async (clipId: string, startTime?: number) => {
      await compositionEngine.playClip(clipId, startTime);
    },
    [compositionEngine],
  );
  const pauseClip = useCallback(
    (clipId: string) => {
      compositionEngine.pauseClip(clipId);
    },
    [compositionEngine],
  );
  const stopClip = useCallback(
    (clipId: string) => {
      compositionEngine.stopClip(clipId);
    },
    [compositionEngine],
  );
  const getClipPlaybackPosition = useCallback(
    (clipId: string) => {
      return compositionEngine.getClipPlaybackPosition(clipId);
    },
    [compositionEngine],
  );

  return {
    clips,
    clipIds,
    importMidi,
    createClip,
    deleteClip,
    moveClip,
    setClipFades,
    setClipInstrument,
    playClip,
    pauseClip,
    stopClip,
    getClipPlaybackPosition,
  };
};
