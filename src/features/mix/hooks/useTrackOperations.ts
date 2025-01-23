// src/features/mix/hooks/useTrackOperations.ts
import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useTrackOperations = () => {
  const compositionEngine = useCompositionEngine();
  const tracks = useEngineStore((state) => state.mix.mixer.tracks);
  const tracksOrder = useEngineStore((state) => state.mix.mixer.tracksOrder);
  const createTrack = useCallback(
    (name?: string) => {
      return compositionEngine.createTrack(name);
    },
    [compositionEngine],
  );
  const deleteTrack = useCallback(
    (trackId: string) => {
      console.log("todo: implement deleteTrack", trackId);
    },
    [compositionEngine],
  );
  const moveTrack = useCallback(
    (trackId: string, newIndex: number) => {
      console.log("todo: implement moveTrack", trackId, newIndex);
    },
    [compositionEngine],
  );
  return {
    tracks,
    tracksOrder,
    createTrack,
    deleteTrack,
    moveTrack,
  };
};
