// src/features/arrangement/hooks/useMixerTrackControls.ts
import { useCallback } from "react";
import { useMixEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { Decibels } from "tone/build/esm/core/type/Units";

export const useMixerTrackControls = (trackId: string) => {
  const mixEngine = useMixEngine();
  const mixerTrack = useEngineStore((state) => state.mix.mixerTracks[trackId]);

  const volume = useEngineStore(
    (state) => state.mix.mixerTracks[trackId]?.channel.volume.value ?? 0,
  );

  const muted = useEngineStore(
    (state) => state.mix.mixerTracks[trackId]?.channel.mute ?? false,
  );

  const soloed = useEngineStore(
    (state) => state.mix.mixerTracks[trackId]?.channel.solo ?? false,
  );

  const setVolume = useCallback(
    (value: Decibels) => {
      if (!mixerTrack) return;
      //mixEngine.setTrackVolume(trackId, value);
      //todo
    },
    [mixEngine, trackId, mixerTrack],
  );

  const toggleMute = useCallback(() => {
    if (!mixerTrack) return;
    //mixEngine.setTrackMute(trackId, !muted);
    //todo
  }, [mixEngine, trackId, mixerTrack, muted]);

  const toggleSolo = useCallback(() => {
    if (!mixerTrack) return;
    //mixEngine.setTrackSolo(trackId, !soloed);
    //todo
  }, [mixEngine, trackId, mixerTrack, soloed]);

  return {
    volume,
    muted,
    soloed,
    setVolume,
    toggleMute,
    toggleSolo,
  };
};
