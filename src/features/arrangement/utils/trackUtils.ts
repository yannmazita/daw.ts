// src/features/arrangement/utils/trackUtils.ts
import { createMixerTrackNodes } from "@/features/mix/utils/audioNodes";
import { Track } from "../types";

export const createTrackData = (
  id: string,
  type: Track["type"],
  name: string,
  index: number,
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
    index,
    clipIds: [],
    automationIds: [],
    ...nodes,
  };
};
