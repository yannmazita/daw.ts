// src/features/mix/hooks/useSoundChainManagerCreationBar.tsx

import { useCallback } from "react";
import { useMixEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { SoundChain } from "../types";

export const useSoundChainManager = () => {
  const mixEngine = useMixEngine();
  const soundChains = useEngineStore((state) => state.mix.soundChains);

  const createSoundChain = useCallback(
    (name?: string) => {
      return mixEngine.createSoundChain(name);
    },
    [mixEngine],
  );

  const deleteSoundChain = useCallback(
    (soundChainId: string) => {
      //mixEngine.deleteSoundChain(soundChainId);
      console.log("todo: implement deleteSoundChain", soundChainId);
    },
    [mixEngine],
  );

  const updateSoundChain = useCallback(
    (soundChainId: string, updates: Partial<SoundChain>) => {
      //mixEngine.updateSoundChain(soundChainId, updates);
      console.log("todo: implement updateSoundChain", soundChainId, updates);
    },
    [mixEngine],
  );

  return {
    soundChains,
    createSoundChain,
    deleteSoundChain,
    updateSoundChain,
  };
};
