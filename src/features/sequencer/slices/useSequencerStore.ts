// src/features/sequencer/slices/useSequencerStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {} from "@redux-devtools/extension";
import * as Tone from "tone";
import { SequencerState, PlaybackMode } from "@/core/interfaces/sequencer";
import { PatternTrack } from "@/core/interfaces/pattern";
import { AutomationCurve } from "@/core/interfaces/automation";
import { SequenceStatus } from "@/core/enums";
import { usePatternStore } from "@/features/patterns/slices/usePatternStore";
import { usePlaylistStore } from "@/features/playlists/slices/usePlaylistStore";
import { instrumentManager } from "@/common/services/instrumentManagerInstance";
import { PatternTrackType } from "@/core/enums/PatternTrackType";

interface InternalState extends SequencerState {
  scheduledEvents: Set<number>;
  lastTickTime: number;
  scheduleAheadTime: number;
  nextScheduleTime: number;
  currentSchedulePosition: number;
  updateInterval: number;
  scheduleNextEvents: () => void;
  clearScheduledEvents: () => void;
  resetPlaybackPosition: () => void;
  updatePlaybackPosition: () => void;
}

export const useSequencerStore = create<InternalState>()(
  devtools(
    (set, get) => ({
      // Initial State
      playback: {
        mode: PlaybackMode.PATTERN,
        status: SequenceStatus.Stopped,
        currentTime: 0,
        currentBar: 0,
        currentBeat: 0,
        currentStep: 0,
        loopStart: 0,
        loopEnd: 4,
        loopEnabled: true,
      },

      transport: {
        bpm: 120,
        swing: 0,
        swingSubdivision: "8n",
        timeSignature: [4, 4],
      },

      currentPatternId: null,

      // Internal scheduling state
      scheduledEvents: new Set(),
      lastTickTime: 0,
      scheduleAheadTime: 0.1, // 100ms ahead
      nextScheduleTime: 0,
      currentSchedulePosition: 0,
      updateInterval: 1000 / 60, // 60fps for timing updates

      // Transport Controls
      setPlaybackMode: (mode: PlaybackMode) => {
        const transport = Tone.getTransport();
        set((state) => {
          // Stop current playback if mode is changing
          if (
            state.playback.mode !== mode &&
            state.playback.status !== SequenceStatus.Stopped
          ) {
            transport.stop();
            get().clearScheduledEvents();
          }

          return {
            playback: {
              ...state.playback,
              mode,
              status: SequenceStatus.Stopped,
              currentTime: 0,
              currentBar: 0,
              currentBeat: 0,
              currentStep: 0,
            },
          };
        });
      },

      setStatus: (status: SequenceStatus) => {
        const transport = Tone.getTransport();
        const current = get();

        switch (status) {
          case SequenceStatus.Playing:
            if (current.playback.status !== SequenceStatus.Playing) {
              transport.start();
              get().scheduleNextEvents();
            }
            break;

          case SequenceStatus.Paused:
            transport.pause();
            break;

          case SequenceStatus.Stopped:
            transport.stop();
            get().clearScheduledEvents();
            get().resetPlaybackPosition();
            break;
        }

        set((state) => ({
          playback: { ...state.playback, status },
        }));
      },

      setBpm: (bpm: number) => {
        Tone.getTransport().bpm.value = bpm;
        set((state) => ({
          transport: { ...state.transport, bpm },
        }));
      },

      setSwing: (swing: number) => {
        Tone.getTransport().swing = swing;
        set((state) => ({
          transport: { ...state.transport, swing },
        }));
      },

      setTimeSignature: (numerator: number, denominator: number) => {
        Tone.getTransport().timeSignature = [numerator, denominator];
        set((state) => ({
          transport: {
            ...state.transport,
            timeSignature: [numerator, denominator],
          },
        }));
      },

      // Pattern Management
      setCurrentPattern: (patternId: string | null) => {
        const wasPlaying = get().playback.status === SequenceStatus.Playing;

        if (wasPlaying) {
          get().setStatus(SequenceStatus.Stopped);
        }

        set((state) => ({
          currentPatternId: patternId,
          playback: {
            ...state.playback,
            currentTime: 0,
            currentBar: 0,
            currentBeat: 0,
            currentStep: 0,
          },
        }));

        if (wasPlaying) {
          get().setStatus(SequenceStatus.Playing);
        }
      },

      // Loop Controls
      setLoopPoints: (start: number, end: number) => {
        set((state) => ({
          playback: {
            ...state.playback,
            loopStart: Math.max(0, start),
            loopEnd: Math.max(start + 1, end),
          },
        }));
      },

      setLoopEnabled: (enabled: boolean) => {
        set((state) => ({
          playback: { ...state.playback, loopEnabled: enabled },
        }));
      },

      // Position Control
      seekToPosition: (time: number) => {
        const transport = Tone.getTransport();
        transport.seconds = time;
        get().updatePlaybackPosition();
      },

      seekToBar: (bar: number) => {
        const transport = Tone.getTransport();
        const timeInSeconds = (bar * 4 * 60) / get().transport.bpm;
        transport.seconds = timeInSeconds;
        get().updatePlaybackPosition();
      },

      // Timing Info
      getCurrentTime: () => {
        return Tone.getTransport().seconds;
      },

      getCurrentBar: () => {
        const position = Tone.getTransport().position as string;
        return parseInt(position.split(":")[0]);
      },

      getPositionInfo: () => {
        const position = Tone.getTransport().position as string;
        const [bars, beats, sixteenths] = position.split(":").map(Number);
        return {
          bar: bars,
          beat: beats,
          step: Math.floor(sixteenths * 4),
        };
      },

      // Internal Methods
      clearScheduledEvents: () => {
        const transport = Tone.getTransport();
        get().scheduledEvents.forEach((id) => {
          transport.clear(id);
        });
        set({
          scheduledEvents: new Set(),
          currentSchedulePosition: 0,
        });
      },

      resetPlaybackPosition: () => {
        set((state) => ({
          playback: {
            ...state.playback,
            currentTime: 0,
            currentBar: 0,
            currentBeat: 0,
            currentStep: 0,
          },
        }));
      },

      updatePlaybackPosition: () => {
        const transport = Tone.getTransport();
        const currentTime = transport.seconds;
        const position = transport.position as string;
        const [bars, beats, sixteenths] = position.split(":").map(Number);

        set((state) => {
          // Handle loop points
          if (state.playback.loopEnabled && bars >= state.playback.loopEnd) {
            transport.seconds =
              state.playback.loopStart * (240 / state.transport.bpm);
            return state;
          }

          return {
            playback: {
              ...state.playback,
              currentTime,
              currentBar: bars,
              currentBeat: beats,
              currentStep: Math.floor(sixteenths * 4),
            },
            lastTickTime: currentTime,
          };
        });
      },

      scheduleNextEvents: () => {
        const state = get();
        if (state.playback.status !== SequenceStatus.Playing) return;

        const currentTime = state.getCurrentTime();
        if (currentTime < state.nextScheduleTime) return;

        const scheduleAheadEnd = currentTime + state.scheduleAheadTime;

        if (state.playback.mode === PlaybackMode.PATTERN) {
          schedulePatternEvents(state, currentTime, scheduleAheadEnd);
        } else {
          schedulePlaylistEvents(state, currentTime, scheduleAheadEnd);
        }

        set({
          nextScheduleTime: currentTime + state.scheduleAheadTime,
          currentSchedulePosition: scheduleAheadEnd,
        });
      },
    }),
    { name: "sequencer-storage" },
  ),
);

// Set up the timing update loop
if (typeof window !== "undefined") {
  let lastUpdateTime = 0;

  const updateTiming = (timestamp: number) => {
    const store = useSequencerStore.getState();
    const elapsed = timestamp - lastUpdateTime;

    if (
      store.playback.status === SequenceStatus.Playing &&
      elapsed >= store.updateInterval
    ) {
      store.updatePlaybackPosition();
      store.scheduleNextEvents();
      lastUpdateTime = timestamp;
    }

    requestAnimationFrame(updateTiming);
  };

  requestAnimationFrame(updateTiming);
}

// Helper function to schedule pattern events
const schedulePatternEvents = (
  state: InternalState,
  startTime: number,
  endTime: number,
) => {
  const pattern = usePatternStore
    .getState()
    .patterns.find((p) => p.id === state.currentPatternId);

  if (!pattern) return;

  // Calculate pattern duration in seconds
  const patternDuration = pattern.length * (240 / state.globalBpm); // length in bars to seconds

  // Calculate current position within pattern
  let schedulePosition = state.currentSchedulePosition;

  while (schedulePosition < endTime) {
    // Handle loop points
    if (
      state.playback.loopEnabled &&
      schedulePosition >= state.playback.loopEnd * (240 / state.globalBpm)
    ) {
      schedulePosition = state.playback.loopStart * (240 / state.globalBpm);
      continue;
    }

    // Schedule events for each track
    pattern.tracks.forEach((track) => {
      const relativePosition = schedulePosition % patternDuration;
      scheduleTrackEvents(track, schedulePosition, relativePosition, state);
    });

    // Move to next step
    schedulePosition += Tone.Time("16n").toSeconds();
  }
};

// Helper function to schedule playlist events
const schedulePlaylistEvents = (
  state: InternalState,
  startTime: number,
  endTime: number,
) => {
  const playlist = usePlaylistStore.getState();

  // Get all patterns that overlap with the schedule window
  const relevantPatternInstances = playlist.getPatternInstancesInTimeRange(
    startTime,
    endTime,
  );

  relevantPatternInstances.forEach((instance) => {
    const pattern = usePatternStore
      .getState()
      .patterns.find((p) => p.id === instance.patternId);

    if (!pattern) return;

    // Schedule events for each track in the pattern
    pattern.tracks.forEach((track) => {
      const relativeStart = Math.max(startTime - instance.startTime, 0);
      const relativeEnd = Math.min(
        endTime - instance.startTime,
        instance.duration,
      );

      scheduleTrackEvents(
        track,
        instance.startTime + relativeStart,
        relativeStart,
        state,
        relativeEnd - relativeStart,
      );
    });
  });
};

// Helper function to get the appropriate parameter for automation
const getAutomationTarget = (
  targetId: string,
  parameter: string,
): Tone.Param<any> | null => {
  // Get the target object (instrument, effect, or mixer channel)
  const target =
    instrumentManager.getInstrument(targetId) ??
    // todo: add other target types (effects, mixer channels)
    null;

  if (!target) return null;

  // Return the appropriate parameter based on the target type
  switch (parameter) {
    case "volume":
      return target.volume;
    case "pan":
      return (target as any).pan;
    case "frequency":
      return (target as any).frequency;
    // Add other parameter types as needed
    default:
      return null;
  }
};

const scheduleTrackEvents = (
  track: PatternTrack,
  absoluteTime: number,
  relativePosition: number,
  state: InternalState,
  duration?: number,
) => {
  const transport = Tone.getTransport();

  switch (track.data.type) {
    case PatternTrackType.STEP_SEQUENCE: {
      const stepData = track.data;
      const stepDuration = Tone.Time("16n").toSeconds();
      const currentStep = Math.floor(relativePosition / stepDuration);

      if (
        currentStep < stepData.steps.length &&
        stepData.steps[currentStep].active
      ) {
        const instrument = instrumentManager.getInstrument(track.instrumentId);
        if (!instrument) return;

        const eventId = transport.schedule((time) => {
          const step = stepData.steps[currentStep];
          instrument.triggerAttackRelease(
            step.note,
            stepDuration,
            time,
            step.velocity / 127,
          );
        }, absoluteTime);

        state.scheduledEvents.add(eventId);
      }
      break;
    }

    case PatternTrackType.PIANO_ROLL: {
      const pianoRollData = track.data;
      const instrument = instrumentManager.getInstrument(track.instrumentId);
      if (!instrument) return;

      // Schedule all notes that start within the current window
      pianoRollData.notes.forEach((note) => {
        if (
          note.startTime >= relativePosition &&
          (!duration || note.startTime < relativePosition + duration)
        ) {
          const eventId = transport.schedule(
            (time) => {
              instrument.triggerAttackRelease(
                note.note,
                note.duration,
                time,
                note.velocity / 127,
              );
            },
            absoluteTime + (note.startTime - relativePosition),
          );

          state.scheduledEvents.add(eventId);
        }
      });
      break;
    }

    case PatternTrackType.AUDIO: {
      const audioData = track.data;
      // Schedule audio playback
      // to be implemented
      break;
    }
  }

  // Schedule automation events
  track.automationData.forEach((automation) => {
    const target = getAutomationTarget(
      track.instrumentId,
      automation.parameter,
    );
    if (!target) return;

    // Find automation points within the schedule window
    const relevantPoints = automation.points.filter(
      (point) =>
        point.time >= relativePosition &&
        (!duration || point.time < relativePosition + duration),
    );

    relevantPoints.forEach((point, index) => {
      const nextPoint = automation.points[index + 1];
      const eventId = transport.schedule(
        (time) => {
          switch (point.curve) {
            case AutomationCurve.INSTANT:
              target.setValueAtTime(point.value, time);
              break;
            case AutomationCurve.LINEAR:
              if (nextPoint) {
                target.linearRampToValueAtTime(
                  nextPoint.value,
                  time + (nextPoint.time - point.time),
                );
              }
              break;
            case AutomationCurve.EXPONENTIAL:
              if (nextPoint && nextPoint.value > 0 && point.value > 0) {
                target.exponentialRampToValueAtTime(
                  nextPoint.value,
                  time + (nextPoint.time - point.time),
                );
              }
              break;
          }
        },
        absoluteTime + (point.time - relativePosition),
      );

      state.scheduledEvents.add(eventId);
    });
  });
};
