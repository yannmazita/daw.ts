// src/features/sampler/hooks/useSampleManagement.ts
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useMemo } from "react";

export const useSampleManagement = () => {
  const sfzFilesFound = useEngineStore((state) => state.sampler.sfzFilesFound);
  const sfzFilesFoundOrder = useEngineStore(
    (state) => state.sampler.sfzFilesFoundOrder,
  );
  const sfzFiles = useMemo(() => {
    return sfzFilesFoundOrder.map((sfzFileId) => sfzFilesFound[sfzFileId]);
  }, [sfzFilesFound, sfzFilesFoundOrder]);

  return {
    sfzFilesFound,
    sfzFilesFoundOrder,
    sfzFiles,
  };
};
