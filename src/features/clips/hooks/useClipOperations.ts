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
    async (file: File, clipId?: string, trackId?: string) => {
      await compositionEngine.importMidi(file, clipId, trackId);
    },
    [compositionEngine],
  );
  const createClip = useCallback(
    (
      type: CompositionClip["type"],
      startTime: number,
      parentId: string,
      name?: string,
    ) => {
      compositionEngine.createClip(type, startTime, parentId, name);
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
  const playClip = useCallback(
    (clipId: string) => {
      compositionEngine.playClip(clipId);
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
    playClip,
    pauseClip,
    stopClip,
    getClipPlaybackPosition,
  };
};
