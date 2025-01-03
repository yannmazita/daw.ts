// src/features/composition/hooks/useTrackState.ts
import { useEngineStore } from "@/core/stores/useEngineStore";
import { Track } from "../types";
import { MixerTrack } from "@/features/mix/types";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";

export type TrackType = "composition" | "mixer";

export interface TrackState {
  type: TrackType;
  id: string;
  name: string;
  track: Track | MixerTrack;
  isMaster: boolean;
  isReturn: boolean;
  isMixer: boolean;
}

export const useTrackState = (trackId: string): TrackState | null => {
  const compositionTrack = useEngineStore(
    useShallow((state) => state.composition.tracks[trackId]),
  );

  const mixerTrack = useEngineStore(
    useShallow((state) => state.mix.mixerTracks[trackId]),
  );

  if (compositionTrack) {
    const { name, ...track } = compositionTrack;
    return useMemo(
      () => ({
        type: "composition",
        id: trackId,
        name,
        track,
        isMaster: false,
        isReturn: false,
        isMixer: false,
      }),
      [trackId, name, track],
    );
  }

  if (mixerTrack) {
    const { name, type, ...track } = mixerTrack;
    return useMemo(
      () => ({
        type: "mixer",
        id: trackId,
        name,
        track,
        isMaster: type === "master",
        isReturn: type === "return",
        isMixer: true,
      }),
      [trackId, name, type, track],
    );
  }

  return null;
};
