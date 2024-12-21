// src/features/arrangement/utils/trackUtils.ts
import { Track, ArrangementState } from "../types";

export const createTrackData = (
  id: string,
  type: Track["type"],
  name: string,
  index: number,
  viewSettings: ArrangementState["viewSettings"],
): Track => ({
  id,
  type,
  name,
  index,
  color: generateTrackColor(),
  height: viewSettings.defaultHeight,
  isVisible: true,
  isFolded: false,
  mixerChannelId: "", // Will be set by engine
  clipIds: [],
  automationIds: [],
});

export const generateTrackColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
};

export const isTrackFoldable = (
  track: Track,
  state: ArrangementState,
): boolean => {
  const nextTrackId = state.trackOrder[track.index + 1];
  return nextTrackId && state.tracks[nextTrackId].type !== "master";
};

export const getTrackChildren = (
  trackId: string,
  state: ArrangementState,
): string[] => {
  const track = state.tracks[trackId];
  if (!track) return [];

  const children: string[] = [];
  let currentIndex = track.index + 1;

  while (currentIndex < state.trackOrder.length) {
    const currentId = state.trackOrder[currentIndex];
    const currentTrack = state.tracks[currentId];

    if (currentTrack.type === "master") break;
    children.push(currentId);
    currentIndex++;
  }

  return children;
};
