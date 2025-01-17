// src/features/sampler/hooks/useInstrumentBrowser.ts
import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useInstrumentBrowser = () => {
  const compositionEngine = useCompositionEngine();
  const instruments = useEngineStore((state) => state.sampler.instruments);

  const loadInstrument = useCallback(async () => {
    try {
      await compositionEngine.loadLocalInstrument();
    } catch (error) {
      console.error("Error loading SFZ:", error);
    }
  }, [compositionEngine]);

  return {
    instruments,
    loadInstrument,
  };
};
