import { useCallback, useState } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useInstrumentBrowser = () => {
  const compositionEngine = useCompositionEngine();
  const instruments = useEngineStore((state) => state.sampler.instruments);

  const [filesTree, setFilesTree] = useState<Record<string, any>>({});
  const [filesMap, setFilesMap] = useState<Record<string, any>>({});

  const loadInstrument = useCallback(async () => {
    try {
      await compositionEngine.loadLocalInstrument();
      const tree = compositionEngine.getFileLoader().filesTree;
      const map = compositionEngine.getFileLoader().files;

      setFilesTree(tree);
      setFilesMap(map);
    } catch (error) {
      console.error("Error loading SFZ:", error);
    }
  }, [compositionEngine]);

  return {
    instruments,
    filesTree,
    filesMap,
    loadInstrument,
  };
};
