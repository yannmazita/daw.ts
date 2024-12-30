// src/features/clips/utils/validation.ts
import * as Tone from "tone";
import { ClipContent, ClipLoop, MidiClipContent } from "../types";
import { Time } from "tone/build/esm/core/type/Units";

export const validateMidiContent = (midiData: MidiClipContent): void => {
  if (!midiData) {
    throw new Error("MIDI data is required");
  }

  // Validate required fields
  if (midiData.duration <= 0) {
    throw new Error("MIDI clip must have positive duration");
  }

  // Validate tracks
  /*
  if (!Array.isArray(midiData.tracks) || midiData.tracks.length === 0) {
    throw new Error("MIDI clip must have at least one track");
  }
  */

  // Validate each track
  midiData.tracks.forEach((track, index) => {
    if (!Array.isArray(track.notes)) {
      throw new Error(`Invalid notes array in track ${index}`);
    }

    // Validate notes
    track.notes.forEach((note, noteIndex) => {
      if (typeof note.midi !== "number" || note.midi < 0 || note.midi > 127) {
        throw new Error(
          `Invalid MIDI note number at track ${index}, note ${noteIndex}`,
        );
      }

      if (note.time < 0 || note.duration <= 0) {
        throw new Error(
          `Invalid time/duration at track ${index}, note ${noteIndex}`,
        );
      }
    });

    // Validate control changes
    if (track.controlChanges) {
      Object.entries(track.controlChanges).forEach(([ccNum, changes]) => {
        if (!Array.isArray(changes)) {
          throw new Error(
            `Invalid control changes for CC ${ccNum} in track ${index}`,
          );
        }

        changes.forEach((cc, ccIndex) => {
          if (typeof cc.value !== "number" || cc.value < 0 || cc.value > 1) {
            throw new Error(
              `Invalid CC value at track ${index}, CC ${ccNum}, index ${ccIndex}`,
            );
          }
        });
      });
    }
  });
};

export const validateAudioBuffer = (
  buffer: Tone.ToneAudioBuffer,
): {
  isValid: boolean;
  error?: string;
} => {
  try {
    // Check buffer properties
    if (!buffer.length) {
      return { isValid: false, error: "Buffer is empty" };
    }

    if (!buffer.numberOfChannels || buffer.numberOfChannels > 2) {
      return {
        isValid: false,
        error: `Unsupported channel count: ${buffer.numberOfChannels}`,
      };
    }

    if (!isFinite(buffer.duration) || buffer.duration <= 0) {
      return {
        isValid: false,
        error: `Invalid duration: ${buffer.duration}`,
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: "Buffer validation failed",
    };
  }
};

export const isValidClipContent = (content: ClipContent): boolean => {
  if (content.type === "midi") {
    return content.midiData !== undefined;
  } else if (content.type === "audio") {
    return content.buffer !== undefined;
  }
  return false;
};

export const validateLoopState = (
  part: Tone.Part | Tone.Player,
  loop: ClipLoop,
): boolean => {
  const currentState = {
    enabled: part.loop,
    start: part.loopStart,
    end: part.loopEnd,
  };

  const expectedEnd =
    Tone.Time(loop.start).toSeconds() + Tone.Time(loop.duration).toSeconds();

  return (
    currentState.enabled === loop.enabled &&
    Tone.Time(currentState.start).toSeconds() ===
      Tone.Time(loop.start).toSeconds() &&
    currentState.end === expectedEnd
  );
};

export const validateFadeTimes = (
  fadeIn: Time,
  fadeOut: Time,
  clipDuration: Time,
): void => {
  const fadeInSeconds = Tone.Time(fadeIn).toSeconds();
  const fadeOutSeconds = Tone.Time(fadeOut).toSeconds();
  const durationSeconds = Tone.Time(clipDuration).toSeconds();

  if (fadeInSeconds < 0) {
    throw new Error("Fade in time cannot be negative");
  }

  if (fadeOutSeconds < 0) {
    throw new Error("Fade out time cannot be negative");
  }

  if (fadeInSeconds + fadeOutSeconds > durationSeconds) {
    throw new Error("Combined fade times cannot exceed clip duration");
  }
};
