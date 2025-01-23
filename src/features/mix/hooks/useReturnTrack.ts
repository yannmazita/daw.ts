// src/features/mix/hooks/useReturnTrack.ts
import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useReturnTrack = (trackId: string) => {
  const compositionEngine = useCompositionEngine();
  const returnTrack = useEngineStore(
    (state) => state.mix.mixer.returnTracks[trackId],
  );

  const volume = useEngineStore(
    (state) => state.mix.mixer.returnTracks[trackId].outputNode.gain.value,
  );

  const pan = useEngineStore(
    (state) => state.mix.mixer.returnTracks[trackId].outputNode.gain.value,
  );

  const muted = useEngineStore(
    (state) => state.mix.mixer.returnTracks[trackId].isMuted,
  );

  const soloed = useEngineStore(
    (state) => state.mix.mixer.returnTracks[trackId].isSoloed,
  );

  const setVolume = useCallback(
    (volume: number) => {
      if (!returnTrack) return;
      console.log("todo: implement setVolume", volume);
    },
    [compositionEngine, trackId, returnTrack],
  );

  const setPan = useCallback(
    (pan: number) => {
      if (!returnTrack) return;
      console.log("todo: implement setPan", pan);
    },
    [compositionEngine, trackId, returnTrack],
  );

  const toggleMute = useCallback(() => {
    if (!returnTrack) return;
    console.log("todo: implement toggleMute");
  }, [compositionEngine, returnTrack, trackId, muted]);

  const toggleSolo = useCallback(() => {
    if (!returnTrack) return;
    console.log("todo: implement toggleSolo");
  }, [compositionEngine, returnTrack, trackId, soloed]);

  const getMeterValues = useCallback((): number | number[] => {
    if (!returnTrack) return 0;
    console.log("todo: implement getMeterValues");
    return 0;
  }, [compositionEngine, returnTrack, trackId]);

  return {
    pan,
    volume,
    muted,
    soloed,
    returnTrack,
    setPan,
    setVolume,
    toggleMute,
    toggleSolo,
    getMeterValues,
  };
};
