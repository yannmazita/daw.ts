// src/features/mix/hooks/useTrack.ts
import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useTrack = (trackId: string) => {
  const compositionEngine = useCompositionEngine();
  const track = useEngineStore((state) => state.mix.mixer.tracks[trackId]);

  const armed = false;
  const toggleArmed = useCallback(() => {
    console.log("todo: implement toggleArmed");
  }, [compositionEngine, trackId, track]);

  const volume = useEngineStore(
    (state) => state.mix.mixer.tracks[trackId]?.outputNode.gain.value,
  );

  const pan = useEngineStore(
    (state) => state.mix.mixer.tracks[trackId]?.outputNode.gain.value,
  );

  const muted = useEngineStore(
    (state) => state.mix.mixer.tracks[trackId]?.isMuted,
  );

  const soloed = useEngineStore(
    (state) => state.mix.mixer.tracks[trackId]?.isSoloed,
  );

  const setVolume = useCallback(
    (volume: number) => {
      if (!track) return;
      console.log("todo: implement setVolume", volume);
    },
    [compositionEngine, trackId, track],
  );

  const setPan = useCallback(
    (pan: number) => {
      if (!track) return;
      console.log("todo: implement setPan", pan);
    },
    [compositionEngine, trackId, track],
  );

  const toggleMute = useCallback(() => {
    if (!track) return;
    console.log("todo: implement toggleMute");
  }, [compositionEngine, track, trackId, muted]);

  const toggleSolo = useCallback(() => {
    if (!track) return;
    console.log("todo: implement toggleSolo");
  }, [compositionEngine, track, trackId, soloed]);

  const getMeterValues = useCallback((): number | number[] => {
    if (!track) return 0;
    console.log("todo: implement getMeterValues");
    return 0;
  }, [compositionEngine, track, trackId]);

  return {
    armed,
    pan,
    volume,
    muted,
    soloed,
    track,
    setPan,
    setVolume,
    toggleArmed,
    toggleMute,
    toggleSolo,
    getMeterValues,
  };
};
