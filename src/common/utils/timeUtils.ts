// src/common/utils/timeUtils.ts
/**
 * Converts time in seconds to bars, beats, and sub-beats.
 * @param seconds The time in seconds.
 * @param tempo The tempo in BPM.
 * @param timeSignature The time signature as [numerator, denominator].
 * @returns An object containing the bar, beat, and sub-beat.
 */
export function secondsToBarsBeats(
  seconds: number,
  tempo: number,
  timeSignature: number[],
): { bar: number; beat: number; subBeat: number } {
  const [numerator, denominator] = timeSignature;
  const secondsPerBeat = 60 / tempo;
  const beatsPerBar = numerator;

  const totalBeats = seconds / secondsPerBeat;
  const bar = Math.floor(totalBeats / beatsPerBar);
  const beat = Math.floor(totalBeats % beatsPerBar);
  const subBeat = totalBeats % 1;

  return { bar, beat, subBeat };
}

/**
 * Converts bars, beats, and sub-beats to time in seconds.
 * @param bar The bar number.
 * @param beat The beat number.
 * @param subBeat The sub-beat number.
 * @param tempo The tempo in BPM.
 * @param timeSignature The time signature as [numerator, denominator].
 * @returns The time in seconds.
 */
export function barsBeatsToSeconds(
  bar: number,
  beat: number,
  subBeat: number,
  tempo: number,
  timeSignature: number[],
): number {
  const [numerator, denominator] = timeSignature;
  const secondsPerBeat = 60 / tempo;
  const beatsPerBar = numerator;

  const totalBeats = bar * beatsPerBar + beat + subBeat;
  return totalBeats * secondsPerBeat;
}
