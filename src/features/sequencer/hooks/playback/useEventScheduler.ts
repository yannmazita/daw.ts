// src/features/sequencer/hooks/playback/useEventScheduler.ts

import { useCallback, useRef } from "react";
import * as Tone from "tone";
import {
  PlaybackContext,
  SchedulerConfig,
  TrackScheduleContext,
} from "./types";
import { PlaybackMode } from "@/core/interfaces/sequencer";
import { Pattern } from "@/core/interfaces/pattern";
import { useTrackScheduler } from "./useTrackScheduler";
import { useAutomationScheduler } from "./useAutomationScheduler";
import { usePatternStore } from "@/features/patterns/slices/usePatternStore";
import { usePlaylistStore } from "@/features/playlists/slices/usePlaylistStore";

export interface EventSchedulerResult {
  scheduleNextEvents: (context: PlaybackContext) => void;
  clearScheduledEvents: () => void;
  getScheduledEventCount: () => number;
  isTimeScheduled: (time: number) => boolean;
}

export const useEventScheduler = (
  config: SchedulerConfig,
): EventSchedulerResult => {
  // Refs for tracking scheduled events and positions
  const scheduledEvents = useRef<Set<number>>(new Set());
  const scheduledTimeRanges = useRef<Array<[number, number]>>([]);
  const nextScheduleTime = useRef<number>(0);

  // Get sub-schedulers
  const { scheduleTrack } = useTrackScheduler();
  const { scheduleAutomation } = useAutomationScheduler();

  // Utility function to check if a time range is already scheduled
  const isTimeRangeScheduled = useCallback((start: number, end: number) => {
    return scheduledTimeRanges.current.some(
      ([rangeStart, rangeEnd]) => start >= rangeStart && end <= rangeEnd,
    );
  }, []);

  // Add a scheduled time range
  const addScheduledTimeRange = useCallback((start: number, end: number) => {
    scheduledTimeRanges.current.push([start, end]);
    // Clean up old ranges
    const currentTime = Tone.getTransport().seconds;
    scheduledTimeRanges.current = scheduledTimeRanges.current.filter(
      ([rangeStart]) => rangeStart >= currentTime - 1,
    );
  }, []);

  // Clear all scheduled events
  const clearScheduledEvents = useCallback(() => {
    const transport = Tone.getTransport();
    scheduledEvents.current.forEach((id) => {
      transport.clear(id);
    });
    scheduledEvents.current.clear();
    scheduledTimeRanges.current = [];
    nextScheduleTime.current = 0;
  }, []);

  // Schedule pattern events
  const schedulePatternEvents = useCallback(
    (
      pattern: Pattern,
      context: PlaybackContext,
      startTime: number,
      endTime: number,
    ) => {
      if (isTimeRangeScheduled(startTime, endTime)) {
        return;
      }

      // Calculate pattern duration in seconds
      const patternDuration = pattern.length * (240 / context.bpm);

      pattern.tracks.forEach((track) => {
        // Create track schedule context with proper trackId
        const trackContext: TrackScheduleContext = {
          startTime,
          endTime,
          trackId: track.id, // Include trackId
          pattern,
          scheduledEvents: scheduledEvents.current,
        };

        // Calculate relative position within pattern considering loop points
        let schedulePosition = startTime;
        while (schedulePosition < endTime) {
          if (
            context.loopEnabled &&
            schedulePosition >= context.loopEnd * (240 / context.bpm)
          ) {
            schedulePosition = context.loopStart * (240 / context.bpm);
            continue;
          }

          const relativePosition = schedulePosition % patternDuration;

          // Schedule track events with proper context
          scheduleTrack(track, {
            ...trackContext,
            startTime: schedulePosition,
            relativePosition,
          });

          // Schedule automation with proper context
          if (track.automationData.length > 0) {
            scheduleAutomation(track.automationData, {
              ...trackContext,
              startTime: schedulePosition,
              relativePosition,
            });
          }

          schedulePosition += Tone.Time("16n").toSeconds();
        }
      });

      addScheduledTimeRange(startTime, endTime);
    },
    [
      scheduleTrack,
      scheduleAutomation,
      isTimeRangeScheduled,
      addScheduledTimeRange,
    ],
  );

  // Schedule playlist events
  const schedulePlaylistEvents = useCallback(
    (context: PlaybackContext, startTime: number, endTime: number) => {
      if (isTimeRangeScheduled(startTime, endTime)) {
        return;
      }

      const playlist = usePlaylistStore.getState();
      const patterns = usePatternStore.getState().patterns;

      // Get all patterns that overlap with the schedule window
      const patternInstances = playlist.getPatternInstancesInTimeRange(
        startTime,
        endTime,
      );

      patternInstances.forEach((instance) => {
        const pattern = patterns.find((p) => p.id === instance.patternId);
        if (!pattern) return;

        const instanceStart = instance.startTime;
        const instanceEnd = instanceStart + instance.duration;

        // Calculate overlap with schedule window
        const overlapStart = Math.max(startTime, instanceStart);
        const overlapEnd = Math.min(endTime, instanceEnd);

        if (overlapStart < overlapEnd) {
          pattern.tracks.forEach((track) => {
            // Create track schedule context with proper trackId
            const trackContext: TrackScheduleContext = {
              startTime: overlapStart,
              endTime: overlapEnd,
              trackId: track.id, // Include trackId
              pattern,
              scheduledEvents: scheduledEvents.current,
            };

            const relativeStart = overlapStart - instanceStart;

            scheduleTrack(track, {
              ...trackContext,
              relativePosition: relativeStart,
            });

            if (track.automationData.length > 0) {
              scheduleAutomation(track.automationData, {
                ...trackContext,
                relativePosition: relativeStart,
              });
            }
          });
        }
      });

      addScheduledTimeRange(startTime, endTime);
    },
    [
      scheduleTrack,
      scheduleAutomation,
      isTimeRangeScheduled,
      addScheduledTimeRange,
    ],
  );

  // Main scheduling function
  const scheduleNextEvents = useCallback(
    (context: PlaybackContext) => {
      const currentTime = Tone.getTransport().seconds;

      // Check if we need to schedule more events
      if (currentTime < nextScheduleTime.current) {
        return;
      }

      const scheduleAheadEnd = currentTime + config.scheduleAheadTime;

      // Schedule based on playback mode
      if (context.mode === PlaybackMode.PATTERN && context.pattern) {
        schedulePatternEvents(
          context.pattern,
          context,
          currentTime,
          scheduleAheadEnd,
        );
      } else {
        schedulePlaylistEvents(context, currentTime, scheduleAheadEnd);
      }

      nextScheduleTime.current = scheduleAheadEnd;
    },
    [schedulePatternEvents, schedulePlaylistEvents, config.scheduleAheadTime],
  );

  // Utility functions
  const getScheduledEventCount = useCallback(() => {
    return scheduledEvents.current.size;
  }, []);

  const isTimeScheduled = useCallback((time: number) => {
    return scheduledTimeRanges.current.some(
      ([start, end]) => time >= start && time <= end,
    );
  }, []);

  return {
    scheduleNextEvents,
    clearScheduledEvents,
    getScheduledEventCount,
    isTimeScheduled,
  };
};
