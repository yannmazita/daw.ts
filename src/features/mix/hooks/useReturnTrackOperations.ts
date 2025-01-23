// src/features/mix/hooks/useReturnTrackOperations.ts
import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useReturnTrackOperations = () => {
  const compositionEngine = useCompositionEngine();
  const returnTracks = useEngineStore((state) => state.mix.mixer.returnTracks);
  const returnTracksOrder = useEngineStore(
    (state) => state.mix.mixer.returnTracksOrder,
  );

  const createMixerTrack = useCallback(
    (name?: string) => {
      return compositionEngine.createReturnTrack(name);
    },
    [compositionEngine],
  );

  const deleteMixerTrack = useCallback(
    (trackId: string) => {
      console.log("todo: implement deleteMixerTrack", trackId);
    },
    [compositionEngine],
  );

  const moveMixerTrack = useCallback(
    (trackId: string, newIndex: number) => {
      console.log("todo: implement moveMixerTrack", trackId, newIndex);
    },
    [compositionEngine],
  );

  return {
    returnTracks,
    returnTracksOrder,
    createMixerTrack,
    deleteMixerTrack,
    moveMixerTrack,
  };
};
