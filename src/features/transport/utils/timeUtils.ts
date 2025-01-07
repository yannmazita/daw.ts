// src/features/transport/utils/timeUtils.ts
import * as Tone from "tone";
import { Time } from "tone/build/esm/core/type/Units";

const TIME_REGEX = /^(\d+):(\d+):(\d+)$/;

export const formatTime = (time: number): string => {
  try {
    const seconds = time;
    const transport = Tone.getTransport();
    const bpm = transport.bpm.value;

    const beatDuration = 60 / bpm;
    const barDuration = beatDuration * 4;

    const bars = Math.floor(seconds / barDuration);
    const remainingSeconds = seconds % barDuration;

    const beats = Math.floor(remainingSeconds / beatDuration);
    const sixteenths = Math.floor(
      (remainingSeconds % beatDuration) / (beatDuration / 4),
    );

    return `${bars}:${beats}:${sixteenths}`;
  } catch (error) {
    console.error("Time formatting error:", error);
    return "0:0:0";
  }
};

export const parseTime = (timeString: string): Time | null => {
  const match = TIME_REGEX.exec(timeString);
  if (!match) return null;

  try {
    const [_, bars, beats, sixteenths] = match.map(Number);
    if (
      bars < 0 ||
      beats < 0 ||
      beats >= 4 ||
      sixteenths < 0 ||
      sixteenths >= 4
    ) {
      return null;
    }

    const totalBeats = bars * 4 + beats + sixteenths / 4;
    return Tone.Time(totalBeats + "n").toSeconds();
  } catch (error) {
    console.error("Time parsing error:", error);
    return null;
  }
};

export const isValidTimeString = (timeString: string): boolean => {
  return TIME_REGEX.test(timeString);
};
