// src/features/arrangement/hooks/useTrackControls.ts
import { useCallback } from "react";
import { useArrangementEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { Decibels } from "tone/build/esm/core/type/Units";

export const useTrackControls = (trackId: string) => {
  const arrangementEngine = useArrangementEngine();
  const track = useEngineStore((state) => state.arrangement.tracks[trackId]);

  const volume = useEngineStore(
    (state) => state.arrangement.tracks[trackId]?.channel.volume.value ?? 0,
  );

  const muted = useEngineStore(
    (state) => state.arrangement.tracks[trackId]?.controls.mute ?? false,
  );

  const soloed = useEngineStore(
    (state) => state.arrangement.tracks[trackId]?.controls.solo ?? false,
  );

  const setVolume = useCallback(
    (value: Decibels) => {
      if (!track) return;
      // todo: Implement volume control
      // arrangementEngine.setTrackVolume(trackId, value);
    },
    [arrangementEngine, trackId, track],
  );

  const toggleMute = useCallback(() => {
    if (!track) return;
    arrangementEngine.setMute(trackId, !muted);
  }, [arrangementEngine, trackId, muted, track]);

  const toggleSolo = useCallback(() => {
    if (!track) return;
    arrangementEngine.setSolo(trackId, !soloed);
  }, [arrangementEngine, trackId, soloed, track]);

  return {
    volume,
    muted,
    soloed,
    setVolume,
    toggleMute,
    toggleSolo,
  };
};
