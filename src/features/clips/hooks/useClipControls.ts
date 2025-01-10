// src/features/clips/hooks/useClipControls.ts
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useCallback } from "react";

export const useClipControls = (clipId: string) => {
  const compositionEngine = useCompositionEngine();
  const clip = useEngineStore((state) => state.clips.clips[clipId]);

  const startTime = clip.startTime;
  const duration = clip.duration;
  const fadeIn = clip.fadeIn;
  const fadeOut = clip.fadeOut;

  const setStartTime = useCallback(
    (value: number) => {
      if (!clip) return;
      compositionEngine.moveClip(clipId, value);
    },
    [compositionEngine, clipId, clip],
  );

  const setDuration = useCallback(
    (value: number) => {
      if (!clip) return;
      // todo: implement duration change
      console.log("todo: implement duration change", value);
    },
    [compositionEngine, clipId, clip],
  );

  const setFadeIn = useCallback(
    (value: number) => {
      if (!clip) return;
      compositionEngine.setClipFades(clipId, value, clip.fadeOut);
    },
    [compositionEngine, clipId, clip],
  );

  const setFadeOut = useCallback(
    (value: number) => {
      if (!clip) return;
      compositionEngine.setClipFades(clipId, clip.fadeIn, value);
    },
    [compositionEngine, clipId, clip],
  );

  return {
    clip,
    startTime,
    duration,
    fadeIn,
    fadeOut,
    setStartTime,
    setDuration,
    setFadeIn,
    setFadeOut,
  };
};
