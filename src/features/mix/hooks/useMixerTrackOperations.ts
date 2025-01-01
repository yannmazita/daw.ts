// src/features/mix/hooks/useTrackOperations.ts
import { useCallback } from "react";
import { useMixEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useMixerTrackOperations = () => {
  const mixEngine = useMixEngine();
  const mixerTracks = useEngineStore((state) => state.mix.mixerTracks);
  const mixerTrackOrder = useEngineStore((state) => state.mix.mixerTrackOrder);

  const createMixerTrack = useCallback(
    (name?: string) => {
      return mixEngine.createMixerTrack("return", name);
    },
    [mixEngine],
  );

  const deleteMixerTrack = useCallback(
    (trackId: string) => {
      mixEngine.deleteMixerTrack(trackId);
    },
    [mixEngine],
  );

  const moveMixerTrack = useCallback(
    (trackId: string, newIndex: number) => {
      mixEngine.moveMixerTrack(trackId, newIndex);
    },
    [mixEngine],
  );

  return {
    mixerTracks,
    mixerTrackOrder,
    createMixerTrack,
    deleteMixerTrack,
    moveMixerTrack,
  };
};
