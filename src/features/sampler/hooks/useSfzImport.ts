// src/features/sampler/hooks/useSfzImport.ts
import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { directoryOpen } from "browser-fs-access";

export const useSfzImport = () => {
  const compositionEngine = useCompositionEngine();

  const loadDirectory = useCallback(async () => {
    try {
      const blobsInDirectory = await directoryOpen({
        recursive: true,
      });
      compositionEngine.loadDirectory(blobsInDirectory);
    } catch (error) {
      console.warn(error);
    }
  }, [compositionEngine]);

  return {
    loadDirectory,
  };
};
