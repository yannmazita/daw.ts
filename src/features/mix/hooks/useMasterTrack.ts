// src/features/mix/hooks/useMasterTrack.ts
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useCallback } from "react";

export const useMasterTrack = () => {
  const compositionEngine = useCompositionEngine();
  const masterTrack = useEngineStore((state) => state.mix.mixer.masterTrack);

  const volume = useEngineStore(
    (state) => state.mix.mixer.masterTrack.gainNode.gain.value,
  );

  const pan = useEngineStore(
    (state) => state.mix.mixer.masterTrack.panNode.pan.value,
  );

  const muted = useEngineStore((state) => state.mix.mixer.masterTrack.isMuted);

  const setVolume = useCallback(
    (volume: number) => {
      if (!masterTrack) return;
      console.log("todo: implement setVolume", volume);
    },
    [compositionEngine, masterTrack],
  );

  const setPan = useCallback(
    (pan: number) => {
      if (!masterTrack) return;
      console.log("todo: implement setPan", pan);
    },
    [compositionEngine, masterTrack],
  );

  const toggleMute = useCallback(() => {
    if (!masterTrack) return;
    console.log("todo: implement toggleMute");
  }, [compositionEngine, masterTrack, muted]);

  const getMeterValues = useCallback((): number | number[] => {
    console.log("todo: implement getMeterValues");
    return 0;
  }, [compositionEngine, masterTrack]);

  return {
    masterTrack,
    volume,
    pan,
    muted,
    setVolume,
    setPan,
    toggleMute,
    getMeterValues,
  };
};
