import { useEngineStore } from "@/core/stores/useEngineStore";
import { Track } from "../types";
import { MixerTrack } from "@/features/mix/types";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";

export type TrackType = "arrangement" | "mixer";

export interface TrackState {
  type: TrackType;
  id: string;
  name: string;
  index: number;
  track: Track | MixerTrack;
  isMaster: boolean;
  isReturn: boolean;
}

export const useTrackState = (trackId: string): TrackState | null => {
  const arrangementTrack = useEngineStore(
    useShallow((state) => state.arrangement.tracks[trackId]),
  );

  const mixerTrack = useEngineStore(
    useShallow((state) => state.mix.mixerTracks[trackId]),
  );

  if (arrangementTrack) {
    const { name, index, ...track } = arrangementTrack;
    return useMemo(
      () => ({
        type: "arrangement",
        id: trackId,
        name,
        index,
        track,
        isMaster: false,
        isReturn: false,
      }),
      [trackId, name, index, track],
    );
  }

  if (mixerTrack) {
    const { name, type, ...track } = mixerTrack;
    return useMemo(
      () => ({
        type: "mixer",
        id: trackId,
        name,
        index: -1,
        track,
        isMaster: type === "master",
        isReturn: type === "return",
      }),
      [trackId, name, type, track],
    );
  }

  return null;
};
