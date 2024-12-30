// src/features/arrangement/hooks/useTrackOperations.ts
import { useCallback } from "react";
import { useArrangementEngine } from "@/core/engines/EngineManager";
import { Track } from "../types";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useTrackOperations = () => {
  const arrangementEngine = useArrangementEngine();
  const tracks = useEngineStore((state) => state.arrangement.tracks);
  const trackOrder = useEngineStore((state) => state.arrangement.trackOrder);

  const createTrack = useCallback(
    (type: Track["type"], name: string) => {
      return arrangementEngine.createTrack(type, name);
    },
    [arrangementEngine],
  );

  const deleteTrack = useCallback(
    (trackId: string) => {
      arrangementEngine.deleteTrack(trackId);
    },
    [arrangementEngine],
  );

  const moveTrack = useCallback(
    (trackId: string, newIndex: number) => {
      arrangementEngine.moveTrack(trackId, newIndex);
    },
    [arrangementEngine],
  );

  const renameTrack = useCallback(
    (trackId: string, newName: string) => {
      const track = tracks[trackId];
      if (!track) return;

      // Update track through engine
      arrangementEngine.updateTrack(trackId, { name: newName });
    },
    [arrangementEngine, tracks],
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
