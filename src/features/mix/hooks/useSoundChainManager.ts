// src/features/mix/hooks/useSoundChainManagerCreationBar.tsx

import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { SoundChain } from "../types";

export const useSoundChainManager = () => {
  const compositionEngine = useCompositionEngine();
  const soundChains = useEngineStore((state) => state.mix.soundChains);

  const createSoundChain = useCallback(
    (name?: string) => {
      return compositionEngine.createSoundChain(name);
    },
    [compositionEngine],
  );

  const deleteSoundChain = useCallback(
    (soundChainId: string) => {
      //compositionEngine.deleteSoundChain(soundChainId);
      console.log("todo: implement deleteSoundChain", soundChainId);
    },
    [compositionEngine],
  );

  const updateSoundChain = useCallback(
    (soundChainId: string, updates: Partial<SoundChain>) => {
      //compositionEngine.updateSoundChain(soundChainId, updates);
      console.log("todo: implement updateSoundChain", soundChainId, updates);
    },
    [compositionEngine],
  );

  return {
    soundChains,
    createSoundChain,
    deleteSoundChain,
    updateSoundChain,
  };
};
