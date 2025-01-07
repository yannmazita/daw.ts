// src/features/mix/hooks/useTrackOperations.ts
import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useMixerTrackOperations = () => {
  const compositionEngine = useCompositionEngine();
  const mixerTracks = useEngineStore((state) => state.mix.mixerTracks);
  const mixerTrackOrder = useEngineStore((state) => state.mix.mixerTrackOrder);

  const createMixerTrack = useCallback(
    (name?: string) => {
      return compositionEngine.createMixerTrack("return", name);
    },
    [compositionEngine],
  );

  const deleteMixerTrack = useCallback(
    (trackId: string) => {
      compositionEngine.deleteMixerTrack(trackId);
    },
    [compositionEngine],
  );

  const moveMixerTrack = useCallback(
    (trackId: string, newIndex: number) => {
      compositionEngine.moveMixerTrack(trackId, newIndex);
    },
    [compositionEngine],
  );

  return {
    mixerTracks,
    mixerTrackOrder,
    createMixerTrack,
    deleteMixerTrack,
    moveMixerTrack,
  };
};
