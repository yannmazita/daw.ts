// src/common/hooks/useSelection.ts
import { useUIStore } from "@/core/stores/useUIStore";
import { useCallback } from "react";

export const useSelection = () => {
  const { setClickedComponentId } = useUIStore();

  const handleClickedTrack = useCallback(
    (trackId: string) => {
      setClickedComponentId(trackId);
    },
    [setClickedComponentId],
  );

  return {
    handleClickedTrack,
  };
};
