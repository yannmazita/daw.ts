// src/features/mix/hooks/useMixerTrackControls.ts
import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useMixerTrackControls = (trackId: string) => {
  const compositionEngine = useCompositionEngine();
  const mixerTrack = useEngineStore((state) => state.mix.mixerTracks[trackId]);

  const volume = useEngineStore(
    (state) => state.mix.mixerTracks[trackId]?.controls.volume ?? 0,
  );

  const pan = useEngineStore(
    (state) => state.mix.mixerTracks[trackId]?.controls.pan ?? 0,
  );

  const muted = useEngineStore(
    (state) => state.mix.mixerTracks[trackId]?.controls.mute ?? false,
  );

  const soloed = useEngineStore(
    (state) => state.mix.mixerTracks[trackId]?.controls.solo ?? false,
  );

  const setVolume = useCallback(
    (volume: number) => {
      if (!mixerTrack) return;
      compositionEngine.setMixerTrackVolume(trackId, volume);
    },
    [compositionEngine, trackId, mixerTrack],
  );

  const setPan = useCallback(
    (pan: number) => {
      if (!mixerTrack) return;
      compositionEngine.setMixerTrackPan(trackId, pan);
    },
    [compositionEngine, mixerTrack, trackId],
  );

  const toggleMute = useCallback(() => {
    if (!mixerTrack) return;
    compositionEngine.setMixerTrackMute(trackId, !muted);
  }, [compositionEngine, mixerTrack, trackId, muted]);

  const toggleSolo = useCallback(() => {
    if (!mixerTrack) return;
    compositionEngine.setMixerTrackSolo(trackId, !soloed);
  }, [compositionEngine, mixerTrack, trackId, soloed]);

  const getMeterValues = useCallback(() => {
    if (!mixerTrack) return;
    return compositionEngine.getMixerTrackMeterValues(trackId);
  }, [compositionEngine, mixerTrack, trackId]);

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
    getMeterValues,
  };
};
