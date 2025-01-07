// src/features/composition/hooks/useTrackOperations.ts
import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { Track } from "@/features/tracks/types";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useTrackOperations = () => {
  const compositionEngine = useCompositionEngine();
  const tracks = useEngineStore((state) => state.tracks.tracks);
  const trackOrder = useEngineStore((state) => state.tracks.trackOrder);

  const createTrack = useCallback(
    (type: Track["type"], name: string) => {
      return compositionEngine.createTrack(type, name);
    },
    [compositionEngine],
  );

  const deleteTrack = useCallback(
    (trackId: string) => {
      compositionEngine.deleteTrack(trackId);
    },
    [compositionEngine],
  );

  const moveTrack = useCallback(
    (trackId: string, newIndex: number) => {
      compositionEngine.moveTrack(trackId, newIndex);
    },
    [compositionEngine],
  );

  const renameTrack = useCallback(
    (trackId: string, newName: string) => {
      const track = tracks[trackId];
      if (!track) return;

      // Update track through engine
      compositionEngine.updateTrack(trackId, { name: newName });
    },
    [compositionEngine, tracks],
  );

  return {
    tracks,
    trackOrder,
    createTrack,
    deleteTrack,
    moveTrack,
    renameTrack,
  };
};
