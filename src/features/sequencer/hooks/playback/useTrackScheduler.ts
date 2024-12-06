// src/features/sequencer/hooks/playback/useTrackScheduler.ts

import { useCallback } from "react";
import * as Tone from "tone";
import {
  PatternTrack,
  StepSequenceData,
  PianoRollData,
  AudioData,
  NoteEvent,
  Pattern,
} from "@/core/interfaces/pattern";
import { PatternTrackType } from "@/core/enums/PatternTrackType";
import { instrumentManager } from "@/common/services/instrumentManagerInstance";
import { Note } from "@/core/enums/note";

interface TrackScheduleOptions {
  startTime: number;
  endTime: number;
  relativePosition: number;
  scheduledEvents: Set<number>;
  pattern: Pattern;
}

interface NoteScheduleEvent {
  note: Note;
  time: number;
  duration: number;
  velocity: number;
}

export const useTrackScheduler = () => {
  // Utility function to check if track should be played (mute/solo state)
  const shouldPlayTrack = useCallback(
    (track: PatternTrack, pattern: Pattern): boolean => {
      const hasSoloTracks = pattern.tracks.some((t) => t.solo);
      return !track.muted && (!hasSoloTracks || track.solo);
    },
    [],
  );

  // Schedule step sequencer events
  const scheduleStepSequence = useCallback(
    (
      track: PatternTrack,
      data: StepSequenceData,
      options: TrackScheduleOptions,
    ) => {
      const instrument = instrumentManager.getInstrument(track.instrumentId);
      if (!instrument || !shouldPlayTrack(track, options.pattern)) return;

      const { startTime, endTime, relativePosition, scheduledEvents } = options;

      // Calculate timing parameters
      const stepDuration = Tone.Time(data.gridResolution).toSeconds();
      const startStep = Math.floor(relativePosition / stepDuration);
      const endStep =
        Math.ceil((endTime - startTime) / stepDuration) + startStep;

      // Schedule each step within the time window
      for (let stepIndex = startStep; stepIndex < endStep; stepIndex++) {
        const step = data.steps[stepIndex % data.steps.length];
        if (!step?.active) continue;

        const stepTime = startTime + (stepIndex - startStep) * stepDuration;
        if (stepTime >= endTime) break;

        // Apply swing if enabled
        const swingAmount = data.swing || 0;
        const isSwingStep = stepIndex % 2 === 1;
        const swingOffset = isSwingStep ? stepDuration * swingAmount : 0;

        const eventId = Tone.getTransport().schedule((time) => {
          instrument.triggerAttackRelease(
            step.note,
            stepDuration,
            time,
            step.velocity / 127,
          );
        }, stepTime + swingOffset);

        scheduledEvents.add(eventId);
      }
    },
    [shouldPlayTrack],
  );

  // Schedule piano roll events
  const schedulePianoRoll = useCallback(
    (
      track: PatternTrack,
      data: PianoRollData,
      options: TrackScheduleOptions,
    ) => {
      const instrument = instrumentManager.getInstrument(track.instrumentId);
      if (!instrument || !shouldPlayTrack(track, options.pattern)) return;

      const { startTime, endTime, relativePosition, scheduledEvents } = options;

      // Find notes that overlap with the scheduling window
      const relevantNotes = data.notes.filter((note) => {
        const noteStart = note.startTime + startTime - relativePosition;
        const noteEnd = noteStart + note.duration;
        return noteStart < endTime && noteEnd > startTime;
      });

      // Schedule each relevant note
      relevantNotes.forEach((note) => {
        const noteStart = note.startTime + startTime - relativePosition;

        // Skip if note is before start time
        if (noteStart < startTime) return;

        const eventId = Tone.getTransport().schedule((time) => {
          instrument.triggerAttackRelease(
            note.note,
            note.duration,
            time,
            note.velocity / 127,
            time + note.duration, // Release time
          );

          // Schedule note parameters if they exist
          if (note.parameters) {
            Object.entries(note.parameters).forEach(([param, value]) => {
              if (param in instrument) {
                (instrument as any)[param].setValueAtTime(value, time);
              }
            });
          }
        }, noteStart);

        scheduledEvents.add(eventId);
      });
    },
    [shouldPlayTrack],
  );

  // Schedule audio track events
  const scheduleAudio = useCallback(
    (track: PatternTrack, data: AudioData, options: TrackScheduleOptions) => {
      if (!shouldPlayTrack(track, options.pattern)) return;

      const { startTime, endTime, relativePosition, scheduledEvents } = options;

      // Get or create audio buffer player
      const player = instrumentManager.getAudioPlayer(track.instrumentId);
      if (!player) return;

      // Calculate timing for audio playback
      const audioStart = startTime - relativePosition;
      if (audioStart >= endTime) return;

      // Handle time stretching if enabled
      if (data.timeStretch) {
        player.playbackRate.value = data.pitch;
      }

      // Schedule audio playback
      const eventId = Tone.getTransport().schedule((time) => {
        player.start(
          time,
          data.startOffset,
          data.duration,
          data.fadeIn,
          data.fadeOut,
        );
      }, audioStart);

      scheduledEvents.add(eventId);
    },
    [shouldPlayTrack],
  );

  // Main track scheduling function
  const scheduleTrack = useCallback(
    (track: PatternTrack, options: TrackScheduleOptions) => {
      try {
        switch (track.data.type) {
          case PatternTrackType.STEP_SEQUENCE:
            scheduleStepSequence(
              track,
              track.data as StepSequenceData,
              options,
            );
            break;

          case PatternTrackType.PIANO_ROLL:
            schedulePianoRoll(track, track.data as PianoRollData, options);
            break;

          case PatternTrackType.AUDIO:
            scheduleAudio(track, track.data as AudioData, options);
            break;

          default:
            console.warn("Unsupported track type");
        }
      } catch (error) {
        console.error(`Error scheduling track ${track.id}:`, error);
      }
    },
    [scheduleStepSequence, schedulePianoRoll, scheduleAudio],
  );

  // Utility function to calculate note timing
  const calculateNoteTiming = useCallback(
    (
      notes: NoteEvent[],
      windowStart: number,
      windowEnd: number,
      offset: number = 0,
    ): NoteScheduleEvent[] => {
      return notes
        .filter((note) => {
          const noteStart = note.startTime + offset;
          const noteEnd = noteStart + note.duration;
          return noteStart < windowEnd && noteEnd > windowStart;
        })
        .map((note) => ({
          note: note.note,
          time: note.startTime + offset,
          duration: note.duration,
          velocity: note.velocity,
        }));
    },
    [],
  );

  return {
    scheduleTrack,
    calculateNoteTiming,
    // Exporting individual schedulers if needed for testing or specific use cases
    scheduleStepSequence,
    schedulePianoRoll,
    scheduleAudio,
  };
};
