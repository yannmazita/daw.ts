// src/features/composition/hooks/useTrackControls.ts
import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useTrackControls = (trackId: string) => {
  const compositionEngine = useCompositionEngine();
  const track = useEngineStore((state) => state.tracks.tracks[trackId]);

  const armed = useEngineStore(
    (state) => state.tracks.tracks[trackId]?.controls.armed ?? false,
  );

  const pan = useEngineStore(
    (state) => state.tracks.tracks[trackId]?.controls.pan ?? 0,
  );

  const volume = useEngineStore(
    (state) => state.tracks.tracks[trackId]?.controls.volume ?? 0,
  );

  const muted = useEngineStore(
    (state) => state.tracks.tracks[trackId]?.controls.mute ?? false,
  );

  const soloed = useEngineStore(
    (state) => state.tracks.tracks[trackId]?.controls.solo ?? false,
  );

  const setVolume = useCallback(
    (value: number) => {
      if (!track) return;
      compositionEngine.setTrackVolume(trackId, value);
    },
    [compositionEngine, trackId, track],
  );

  const setPan = useCallback(
    (Value: number) => {
      if (!track) return;
      compositionEngine.setTrackPan(trackId, Value);
    },
    [compositionEngine, trackId, track],
  );

  const toggleArmed = useCallback(() => {
    if (!track) return;
    compositionEngine.setArmed(trackId, !armed);
  }, [compositionEngine, trackId, armed, track]);

  const toggleMute = useCallback(() => {
    if (!track) return;
    compositionEngine.setTrackMute(trackId, !muted);
    console.log(muted);
  }, [compositionEngine, trackId, muted, track]);

  const toggleSolo = useCallback(() => {
    if (!track) return;
    compositionEngine.setTrackSolo(trackId, !soloed);
  }, [compositionEngine, trackId, soloed, track]);

  const getMeterValues = useCallback(() => {
    if (!track) return 0;
    return compositionEngine.getTrackMeterValues(trackId);
  }, [compositionEngine, trackId, track]);

  return {
    armed,
    pan,
    volume,
    muted,
    soloed,
    setPan,
    setVolume,
    toggleArmed,
    toggleMute,
    toggleSolo,
    getMeterValues,
  };
};
