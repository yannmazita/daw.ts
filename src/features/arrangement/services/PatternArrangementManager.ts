// src/features/arrangement/services/PatternArrangementManager.ts
import * as Tone from "tone";
import {
  PatternArrangementManager,
  PatternArrangementState,
  PatternArrangementActions,
  TimelinePattern,
} from "@/core/interfaces/arrangement/patterns";
import { BaseManager } from "@/common/services/BaseManager";
import { Time } from "tone/build/esm/core/type/Units";
import { patternManager } from "@/features/patterns/services/patternManagerInstance";

export class ArrangementPatternManager
  extends BaseManager<PatternArrangementState>
  implements PatternArrangementManager
{
  private readonly MIN_PATTERN_DURATION = "16n";
  private readonly MAX_PATTERNS_PER_TRACK = 1000;
  private readonly MIN_GAIN = 0;
  private readonly MAX_GAIN = 2;
  private readonly MAX_LOOP_COUNT = 100;

  constructor() {
    super({
      patterns: {},
      trackPatterns: {},
      selectedPatternIds: [],
    });
  }

  public readonly actions: PatternArrangementActions = {
    addPattern: (
      trackId: string,
      patternId: string,
      startTime: Time,
      options?: Partial<TimelinePattern>,
    ): string => {
      // Validate pattern exists
      const sourcePattern = patternManager.actions.getPattern(patternId);
      if (!sourcePattern) {
        throw new Error("Source pattern not found");
      }

      // Check track pattern limit
      const trackPatterns = this.state.trackPatterns[trackId] || [];
      if (trackPatterns.length >= this.MAX_PATTERNS_PER_TRACK) {
        throw new Error("Maximum patterns per track reached");
      }

      const id = `timeline_pattern_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const timelinePattern: TimelinePattern = {
        id,
        name: sourcePattern.name,
        patternId,
        trackId,
        startTime,
        duration: sourcePattern.duration,
        offset: 0,
        gain: 1,
        fadeIn: 0,
        fadeOut: 0,
        isLooped: false,
        loopCount: 1,
        muted: false,
        ...options,
      };

      // Validate placement
      if (
        !this.actions.validatePatternPlacement(
          trackId,
          startTime,
          timelinePattern.duration,
        )
      ) {
        throw new Error("Invalid pattern placement");
      }

      // Update state
      this.updateState({
        patterns: {
          ...this.state.patterns,
          [id]: timelinePattern,
        },
        trackPatterns: {
          ...this.state.trackPatterns,
          [trackId]: [
            ...(this.state.trackPatterns[trackId] || []),
            {
              id,
              startTime,
              duration: timelinePattern.duration,
            },
          ].sort(
            (a, b) =>
              Tone.Time(a.startTime).toSeconds() -
              Tone.Time(b.startTime).toSeconds(),
          ),
        },
      });

      return id;
    },

    removePattern: (id: string): void => {
      const pattern = this.state.patterns[id];
      if (!pattern) return;

      const { [id]: _, ...remainingPatterns } = this.state.patterns;
      const trackPatterns = this.state.trackPatterns[pattern.trackId].filter(
        (p) => p.id !== id,
      );

      this.updateState({
        patterns: remainingPatterns,
        trackPatterns: {
          ...this.state.trackPatterns,
          [pattern.trackId]: trackPatterns,
        },
        selectedPatternIds: this.state.selectedPatternIds.filter(
          (selectedId) => selectedId !== id,
        ),
      });
    },

    duplicatePattern: (id: string, newStartTime?: Time): string => {
      const pattern = this.state.patterns[id];
      if (!pattern) throw new Error("Pattern not found");

      return this.actions.addPattern(
        pattern.trackId,
        pattern.patternId,
        newStartTime ?? pattern.startTime,
        {
          ...pattern,
          id: undefined, // Will be generated
          startTime: undefined, // Will be set
        },
      );
    },

    movePattern: (id: string, newStartTime: Time): void => {
      const pattern = this.state.patterns[id];
      if (!pattern) return;

      if (
        !this.actions.validatePatternPlacement(
          pattern.trackId,
          newStartTime,
          pattern.duration,
          id,
        )
      ) {
        throw new Error("Invalid pattern placement");
      }

      const updatedPattern = {
        ...pattern,
        startTime: newStartTime,
      };

      this.updateTrackPattern(updatedPattern);
    },

    resizePattern: (id: string, newDuration: Time): void => {
      const pattern = this.state.patterns[id];
      if (!pattern) return;

      const minDuration = Tone.Time(this.MIN_PATTERN_DURATION).toSeconds();
      const newDurationSeconds = Tone.Time(newDuration).toSeconds();

      if (newDurationSeconds < minDuration) {
        throw new Error("Pattern duration too short");
      }

      if (
        !this.actions.validatePatternPlacement(
          pattern.trackId,
          pattern.startTime,
          newDuration,
          id,
        )
      ) {
        throw new Error("Invalid pattern size");
      }

      const updatedPattern = {
        ...pattern,
        duration: newDuration,
      };

      this.updateTrackPattern(updatedPattern);
    },

    setPatternOffset: (id: string, offset: Time): void => {
      const pattern = this.state.patterns[id];
      if (!pattern) return;

      const sourcePattern = patternManager.actions.getPattern(
        pattern.patternId,
      );
      if (!sourcePattern) return;

      const maxOffset = Tone.Time(sourcePattern.duration).toSeconds();
      const offsetSeconds = Tone.Time(offset).toSeconds();

      if (offsetSeconds < 0 || offsetSeconds >= maxOffset) {
        throw new Error("Invalid offset value");
      }

      this.updatePattern(id, { offset });
    },

    setPatternGain: (id: string, gain: number): void => {
      if (gain < this.MIN_GAIN || gain > this.MAX_GAIN) {
        throw new Error("Invalid gain value");
      }

      this.updatePattern(id, { gain });
    },

    setPatternFades: (id: string, fadeIn: Time, fadeOut: Time): void => {
      const pattern = this.state.patterns[id];
      if (!pattern) return;

      const duration = Tone.Time(pattern.duration).toSeconds();
      const fadeInSeconds = Tone.Time(fadeIn).toSeconds();
      const fadeOutSeconds = Tone.Time(fadeOut).toSeconds();

      if (fadeInSeconds + fadeOutSeconds > duration) {
        throw new Error("Fade times exceed pattern duration");
      }

      this.updatePattern(id, { fadeIn, fadeOut });
    },

    setPatternLoop: (id: string, isLooped: boolean, count = 2): void => {
      if (count < 1 || count > this.MAX_LOOP_COUNT) {
        throw new Error("Invalid loop count");
      }

      this.updatePattern(id, { isLooped, loopCount: count });
    },

    splitPattern: (id: string, splitTime: Time): [string, string] => {
      const pattern = this.state.patterns[id];
      if (!pattern) throw new Error("Pattern not found");

      const splitSeconds = Tone.Time(splitTime).toSeconds();
      const startSeconds = Tone.Time(pattern.startTime).toSeconds();
      const endSeconds = startSeconds + Tone.Time(pattern.duration).toSeconds();

      if (splitSeconds <= startSeconds || splitSeconds >= endSeconds) {
        throw new Error("Invalid split time");
      }

      // Create first half
      const firstHalfDuration = Tone.Time(
        splitSeconds - startSeconds,
      ).toBarsBeatsSixteenths();

      // Create second half
      const secondHalfDuration = Tone.Time(
        endSeconds - splitSeconds,
      ).toBarsBeatsSixteenths();
      const secondHalfOffset =
        Tone.Time(pattern.offset).toSeconds() +
        Tone.Time(firstHalfDuration).toSeconds();

      // Remove original pattern
      this.actions.removePattern(id);

      // Create new patterns
      const firstHalfId = this.actions.addPattern(
        pattern.trackId,
        pattern.patternId,
        pattern.startTime,
        {
          ...pattern,
          duration: firstHalfDuration,
          fadeOut: 0,
        },
      );

      const secondHalfId = this.actions.addPattern(
        pattern.trackId,
        pattern.patternId,
        splitTime,
        {
          ...pattern,
          offset: Tone.Time(secondHalfOffset).toBarsBeatsSixteenths(),
          duration: secondHalfDuration,
          fadeIn: 0,
        },
      );

      return [firstHalfId, secondHalfId];
    },

    trimPattern: (id: string, startTrim: Time, endTrim: Time): void => {
      const pattern = this.state.patterns[id];
      if (!pattern) return;

      const startTrimSeconds = Tone.Time(startTrim).toSeconds();
      const endTrimSeconds = Tone.Time(endTrim).toSeconds();
      const durationSeconds = Tone.Time(pattern.duration).toSeconds();

      if (startTrimSeconds < 0 || endTrimSeconds > durationSeconds) {
        throw new Error("Invalid trim values");
      }

      const newOffset =
        Tone.Time(pattern.offset).toSeconds() + startTrimSeconds;
      const newDuration = Tone.Time(
        endTrimSeconds - startTrimSeconds,
      ).toBarsBeatsSixteenths();
      const newStartTime =
        Tone.Time(pattern.startTime).toSeconds() + startTrimSeconds;

      this.updatePattern(id, {
        offset: Tone.Time(newOffset).toBarsBeatsSixteenths(),
        duration: newDuration,
        startTime: Tone.Time(newStartTime).toBarsBeatsSixteenths(),
      });
    },

    mergePatterns: (patternIds: string[]): string => {
      if (patternIds.length < 2) {
        throw new Error("At least two patterns required for merging");
      }

      const patterns = patternIds
        .map((id) => this.state.patterns[id])
        .filter((p): p is TimelinePattern => p !== undefined)
        .sort(
          (a, b) =>
            Tone.Time(a.startTime).toSeconds() -
            Tone.Time(b.startTime).toSeconds(),
        );

      if (patterns.length !== patternIds.length) {
        throw new Error("Some patterns not found");
      }

      // Validate patterns are adjacent and from same source
      const sourcePatternId = patterns[0].patternId;
      const trackId = patterns[0].trackId;

      for (let i = 1; i < patterns.length; i++) {
        if (patterns[i].patternId !== sourcePatternId) {
          throw new Error("Can only merge patterns from same source");
        }
        if (patterns[i].trackId !== trackId) {
          throw new Error("Can only merge patterns from same track");
        }

        const prevEnd =
          Tone.Time(patterns[i - 1].startTime).toSeconds() +
          Tone.Time(patterns[i - 1].duration).toSeconds();
        const currentStart = Tone.Time(patterns[i].startTime).toSeconds();

        if (Math.abs(prevEnd - currentStart) > 0.001) {
          // Small tolerance for floating point
          throw new Error("Patterns must be adjacent for merging");
        }
      }

      // Create merged pattern
      const firstPattern = patterns[0];
      const lastPattern = patterns[patterns.length - 1];
      const totalDuration = Tone.Time(
        Tone.Time(lastPattern.startTime).toSeconds() +
          Tone.Time(lastPattern.duration).toSeconds() -
          Tone.Time(firstPattern.startTime).toSeconds(),
      ).toBarsBeatsSixteenths();

      // Remove original patterns
      patternIds.forEach((id) => this.actions.removePattern(id));

      // Create new merged pattern
      return this.actions.addPattern(
        trackId,
        sourcePatternId,
        firstPattern.startTime,
        {
          duration: totalDuration,
          offset: firstPattern.offset,
          gain: firstPattern.gain,
          fadeIn: firstPattern.fadeIn,
          fadeOut: lastPattern.fadeOut,
        },
      );
    },

    movePatternToTrack: (id: string, newTrackId: string): void => {
      const pattern = this.state.patterns[id];
      if (!pattern) return;

      if (
        !this.actions.validatePatternPlacement(
          newTrackId,
          pattern.startTime,
          pattern.duration,
        )
      ) {
        throw new Error("Invalid pattern placement on new track");
      }

      // Remove from old track
      const oldTrackPatterns = this.state.trackPatterns[pattern.trackId].filter(
        (p) => p.id !== id,
      );

      // Add to new track
      const newTrackPatterns = [
        ...(this.state.trackPatterns[newTrackId] || []),
        {
          id,
          startTime: pattern.startTime,
          duration: pattern.duration,
        },
      ].sort(
        (a, b) =>
          Tone.Time(a.startTime).toSeconds() -
          Tone.Time(b.startTime).toSeconds(),
      );

      this.updateState({
        patterns: {
          ...this.state.patterns,
          [id]: {
            ...pattern,
            trackId: newTrackId,
          },
        },
        trackPatterns: {
          ...this.state.trackPatterns,
          [pattern.trackId]: oldTrackPatterns,
          [newTrackId]: newTrackPatterns,
        },
      });
    },

    getTrackPatterns: (trackId: string): TimelinePattern[] => {
      const trackPatternRefs = this.state.trackPatterns[trackId] || [];
      return trackPatternRefs
        .map((ref) => this.state.patterns[ref.id])
        .filter((p): p is TimelinePattern => p !== undefined);
    },

    getPatternsInRange: (startTime: Time, endTime: Time): TimelinePattern[] => {
      const start = Tone.Time(startTime).toSeconds();
      const end = Tone.Time(endTime).toSeconds();

      return Object.values(this.state.patterns).filter((pattern) => {
        const patternStart = Tone.Time(pattern.startTime).toSeconds();
        const patternEnd =
          patternStart + Tone.Time(pattern.duration).toSeconds();
        return patternStart < end && patternEnd > start;
      });
    },

    getPatternsAtTime: (time: Time): TimelinePattern[] => {
      const timeSeconds = Tone.Time(time).toSeconds();
      return Object.values(this.state.patterns).filter((pattern) => {
        const start = Tone.Time(pattern.startTime).toSeconds();
        const end = start + Tone.Time(pattern.duration).toSeconds();
        return timeSeconds >= start && timeSeconds < end;
      });
    },

    getPattern: (id: string): TimelinePattern | undefined => {
      return this.state.patterns[id];
    },

    selectPatterns: (ids: string[]): void => {
      this.updateState({
        selectedPatternIds: ids.filter((id) => this.state.patterns[id]),
      });
    },

    clearSelection: (): void => {
      this.updateState({ selectedPatternIds: [] });
    },

    validatePatternPlacement: (
      trackId: string,
      startTime: Time,
      duration: Time,
      excludeId?: string,
    ): boolean => {
      const start = Tone.Time(startTime).toSeconds();
      const end = start + Tone.Time(duration).toSeconds();

      const trackPatterns = this.state.trackPatterns[trackId] || [];

      return !trackPatterns.some((ref) => {
        if (excludeId && ref.id === excludeId) return false;

        const patternStart = Tone.Time(ref.startTime).toSeconds();
        const patternEnd = patternStart + Tone.Time(ref.duration).toSeconds();

        return start < patternEnd && end > patternStart;
      });
    },
  };

  private updatePattern(id: string, updates: Partial<TimelinePattern>): void {
    const pattern = this.state.patterns[id];
    if (!pattern) return;

    const updatedPattern = {
      ...pattern,
      ...updates,
    };

    this.updateTrackPattern(updatedPattern);
  }

  private updateTrackPattern(pattern: TimelinePattern): void {
    // Update patterns state
    const patterns = {
      ...this.state.patterns,
      [pattern.id]: pattern,
    };

    // Update track patterns reference
    const trackPatterns = {
      ...this.state.trackPatterns,
      [pattern.trackId]: [
        ...this.state.trackPatterns[pattern.trackId].filter(
          (p) => p.id !== pattern.id,
        ),
        {
          id: pattern.id,
          startTime: pattern.startTime,
          duration: pattern.duration,
        },
      ].sort(
        (a, b) =>
          Tone.Time(a.startTime).toSeconds() -
          Tone.Time(b.startTime).toSeconds(),
      ),
    };

    this.updateState({ patterns, trackPatterns });
  }

  public dispose(): void {
    this.updateState({
      patterns: {},
      trackPatterns: {},
      selectedPatternIds: [],
    });
  }
}
