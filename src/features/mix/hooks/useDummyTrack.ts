// src/features/composition/hooks/useDummyTrack.ts
import { useMemo } from "react";

export const useDummyTrack = (realTrackCount: number, maxDummyTracks = 8) => {
  return useMemo(() => {
    const dummyCount = Math.max(0, maxDummyTracks - realTrackCount);
    return Array.from({ length: dummyCount }, (_, index) => `dummy-${index}`);
  }, [maxDummyTracks, realTrackCount]);
};
