// src/features/arrangement/utils/trackUtils.ts
import { createMixerTrackNodes } from "@/features/mix/utils/audioNodes";
import { Track, ArrangementState } from "../types";

export const createTrackData = (
  id: string,
  type: Track["type"],
  name: string,
  index: number,
  viewSettings: ArrangementState["viewSettings"],
): Track => {
  const nodes = createMixerTrackNodes();

  // Validate nodes
  if (!nodes.input || !nodes.channel || !nodes.meter) {
    console.error("Failed to create audio nodes:", nodes);
    throw new Error("Failed to create audio nodes for track");
  }

  // Connect nodes internally
  nodes.input.connect(nodes.channel);
  nodes.channel.connect(nodes.meter);

  return {
    id,
    type,
    name,
    color: generateTrackColor(),
    index,
    height: viewSettings.defaultHeight,
    isVisible: true,
    isFolded: false,
    clipIds: [],
    automationIds: [],
    ...nodes,
  };
};

export const generateTrackColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
};

export const isTrackFoldable = (
  track: Track,
  state: ArrangementState,
): boolean => {
  const nextTrackId = state.trackOrder[track.index + 1];
  if (!nextTrackId) return false;
  return true;
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
    children.push(currentId);
    currentIndex++;
  }

  return children;
};
