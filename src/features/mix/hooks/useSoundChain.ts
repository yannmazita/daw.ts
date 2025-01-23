// src/features/mix/hooks/useSoundChain.ts
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useCallback } from "react";

export const useSoundChain = (trackId: string | null) => {
  const compositionEngine = useCompositionEngine();
  let soundChain = null;
  if (trackId) {
    soundChain = useEngineStore(
      (state) => state.mix.mixer.tracks[trackId]?.soundChain,
    );
  }

  const getMeterValues = useCallback((): number | number[] => {
    if (!soundChain) return 0;
    console.log("todo: implement getMeterValues");
    return 0;
  }, [compositionEngine, soundChain, trackId]);

  return {
    soundChain,
    getMeterValues,
  };
};
