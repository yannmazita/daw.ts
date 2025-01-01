// src/features/mix/hooks/useMixerTrackControls.ts
import { useCallback } from "react";
import { useMixEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useMixerTrackControls = (trackId: string) => {
  const mixEngine = useMixEngine();
  const mixerTracks = useEngineStore((state) => state.mix.mixerTracks);
  const mixerTrack = mixerTracks[trackId];

  const volume = useEngineStore(
    (state) => state.mix.mixerTracks[trackId]?.controls.volume ?? 0,
  );

  const pan = useEngineStore(
    (state) => state.mix.mixerTracks[trackId]?.channel.pan.value ?? 0,
  );

  const muted = useEngineStore(
    (state) => state.mix.mixerTracks[trackId]?.channel.muted ?? false,
  );

  const soloed = useEngineStore(
    (state) => state.mix.mixerTracks[trackId]?.controls.solo ?? false,
  );

  const setVolume = useCallback(
    (volume: number) => {
      mixEngine.setVolume(trackId, volume);
    },
    [mixEngine, trackId, mixerTrack],
  );

  const setPan = useCallback(
    (pan: number) => {
      if (!mixerTrack) return;
      mixEngine.setPan(trackId, pan);
    },
    [mixEngine, mixerTrack, trackId],
  );

  const toggleMute = useCallback(() => {
    if (!mixerTrack) return;
    mixEngine.setMute(trackId, !muted);
  }, [mixEngine, mixerTrack, trackId]);

  const toggleSolo = useCallback(() => {
    if (!mixerTrack) return;
    mixEngine.setSolo(trackId, !soloed);
  }, [mixEngine, mixerTrack, trackId]);

  return {
    pan,
    volume,
    muted,
    soloed,
    mixerTrack,
    setPan,
    setVolume,
    toggleMute,
    toggleSolo,
  };
};
