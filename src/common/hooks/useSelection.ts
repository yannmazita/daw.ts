// src/common/hooks/useSelection.ts
import { useUIStore } from "@/core/stores/useUIStore";
import { useCallback } from "react";

export const useSelection = () => {
  const { setClickedComponentId, clickedComponentId } = useUIStore();

  const handleClickedTrack = useCallback(
    (trackId: string) => {
      setClickedComponentId(trackId);
      console.log("clicked track", trackId);
    },
    [setClickedComponentId, clickedComponentId],
  );

  return {
    setClickedComponentId,
    clickedComponentId,
    handleClickedTrack,
  };
};
