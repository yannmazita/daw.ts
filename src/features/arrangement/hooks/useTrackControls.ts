// src/features/arrangement/hooks/useTrackControls.ts
import { useCallback } from "react";
import { useArrangementEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useTrackControls = (trackId: string) => {
  const arrangementEngine = useArrangementEngine();
  const track = useEngineStore((state) => state.arrangement.tracks[trackId]);

  const armed = useEngineStore(
    (state) => state.arrangement.tracks[trackId].controls.armed ?? false,
  );

  const pan = useEngineStore(
    (state) => state.arrangement.tracks[trackId].controls.pan ?? 0,
  );

  const volume = useEngineStore(
    (state) => state.arrangement.tracks[trackId]?.controls.volume ?? 0,
  );

  const muted = useEngineStore(
    (state) => state.arrangement.tracks[trackId]?.controls.mute ?? false,
  );

  const soloed = useEngineStore(
    (state) => state.arrangement.tracks[trackId]?.controls.solo ?? false,
  );

  const setVolume = useCallback(
    (value: number) => {
      if (!track) return;
      arrangementEngine.setVolume(trackId, value);
    },
    [arrangementEngine, trackId, track],
  );

  const setPan = useCallback(
    (Value: number) => {
      if (!track) return;
      arrangementEngine.setPan(trackId, Value);
    },
    [arrangementEngine, trackId, track],
  );

  const toggleArmed = useCallback(() => {
    if (!track) return;
    arrangementEngine.setArmed(trackId, !armed);
  }, [arrangementEngine, trackId, armed, track]);

  const toggleMute = useCallback(() => {
    if (!track) return;
    arrangementEngine.setMute(trackId, !muted);
  }, [arrangementEngine, trackId, muted, track]);

  const toggleSolo = useCallback(() => {
    if (!track) return;
    arrangementEngine.setSolo(trackId, !soloed);
  }, [arrangementEngine, trackId, soloed, track]);

  const getMeterValues = useCallback(() => {
    if (!track) return;
    return arrangementEngine.getMeterValues(trackId);
  }, [arrangementEngine, trackId, track]);

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
