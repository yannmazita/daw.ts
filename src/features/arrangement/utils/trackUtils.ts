// src/features/arrangement/utils/trackUtils.ts

import * as Tone from "tone";
import { Track } from "../types";
import { initialTrackControlState } from "./initialState";

export const createTrackData = (
  id: string,
  type: Track["type"],
  name: string,
  index: number,
): Track => {
  // Create track processing nodes
  const input = new Tone.Gain();
  const panner = new Tone.Panner(0);
  const channel = new Tone.Channel();
  const meter = new Tone.Meter();

  // Connect track processing chain
  input.connect(panner).connect(channel);

  channel.connect(meter);

  return {
    id,
    type,
    name,
    index,
    controls: { ...initialTrackControlState },
    clipIds: [],
    automationIds: [],
    input,
    panner,
    channel,
    meter,
  };
};
