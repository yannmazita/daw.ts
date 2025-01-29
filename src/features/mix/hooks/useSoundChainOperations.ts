// src/features/mix/hooks/useSoundChainOperations.ts
import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { SoundChain } from "../types";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useShallow } from "zustand/shallow";

export const useSoundChainOperations = () => {
  const compositionEngine = useCompositionEngine();
  const tracksWithSoundChains = useEngineStore(
    useShallow((state) =>
      Object.values(state.mix.mixer.tracks).filter(
        (track) => track.soundChain != null,
      ),
    ),
  );

  const createSoundChain = useCallback(
    (trackId: string, name?: string) => {
      console.log("Creating sound chain", trackId, name);
      return compositionEngine.createSoundChain(trackId, name);
    },
    [compositionEngine],
  );

  const deleteSoundChain = useCallback(
    (trackId: string) => {
      console.log("todo: implement deleteSoundChain", trackId);
    },
    [compositionEngine],
  );

  const updateSoundChain = useCallback(
    (trackId: string, updates: Partial<SoundChain>) => {
      console.log("todo: implement updateSoundChain", trackId, updates);
    },
    [compositionEngine],
  );

  return {
    createSoundChain,
    deleteSoundChain,
    updateSoundChain,
    tracksWithSoundChains,
  };
};
