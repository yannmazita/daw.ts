// src/features/patterns/services/PatternManager.ts

import * as Tone from "tone";
import {
  Pattern,
  PatternData,
  PatternState,
  PatternTrack,
  PatternTrackState,
  PatternActions,
  SequenceEvent,
  NoteSequenceEvent,
  AudioSequenceEvent,
} from "@/core/interfaces/pattern";
import { transportManager } from "@/common/services/transportManagerInstance";
import { mixerManager } from "@/features/mixer/services/mixerManagerInstance";
import { PlaybackMode } from "@/core/types/common";
import {
  InstrumentName,
  InstrumentOptions,
  InstrumentType,
} from "@/core/types/instrument";
import { BaseManager } from "@/common/services/BaseManager";
import { Time } from "tone/build/esm/core/type/Units";

export class PatternManager extends BaseManager<PatternState> {
  public readonly patterns: Map<string, Pattern>;
  private currentPattern: Pattern | null;
  private activeEvents: Set<number>;

  constructor() {
    super({
      patterns: [],
      currentPatternId: null,
    });
    this.patterns = new Map();
    this.currentPattern = null;
    this.activeEvents = new Set();

    // Register pattern mode handler with transport
    transportManager.registerModeHandler(
      PlaybackMode.PATTERN,
      () => this.startPatternPlayback(),
      () => this.stopPatternPlayback(),
    );
  }

  public readonly actions: PatternActions = {
    createPattern: (name: string, timeSignature: [number, number]): string => {
      const id = `pattern_${Date.now()}`;

      const patternData: PatternData = {
        id,
        name,
        tracks: [],
        length: "4m",
        timeSignature,
        color: undefined,
        defaultLoopLength: "4m",
        isLoop: true,
        loopStart: "0:0:0",
        loopEnd: "4:0:0",
      };

      const pattern: Pattern = {
        id,
        tracks: [],
        state: patternData,
      };

      this.patterns.set(id, pattern);
      this.updateState({
        patterns: [...this.state.patterns, patternData],
      });

      return id;
    },

    deletePattern: (id: string): void => {
      const pattern = this.patterns.get(id);
      if (!pattern) return;

      // Clean up tracks
      pattern.tracks.forEach((track) => {
        track.instrument?.dispose();
        track.player?.dispose();
        Object.values(track.parameters).forEach((param) => param.dispose());
      });

      this.patterns.delete(id);

      this.updateState({
        patterns: this.state.patterns.filter((p) => p.id !== id),
        currentPatternId:
          this.state.currentPatternId === id
            ? (this.state.patterns[0]?.id ?? null)
            : this.state.currentPatternId,
      });

      if (this.state.currentPatternId === id) {
        this.currentPattern = null;
      }
    },

    addTrack: (
      patternId: string,
      name: string,
      type: "instrument" | "audio",
      instrumentType?: InstrumentName,
      options?: InstrumentOptions,
    ): string => {
      const pattern = this.patterns.get(patternId);
      if (!pattern) throw new Error("Pattern not found");

      const trackId = `track_${Date.now()}`;
      const mixerChannelId = mixerManager.actions.createChannel(name);

      const trackState: PatternTrackState = {
        id: trackId,
        name,
        type,
        instrumentType,
        instrumentOptions: options,
        mixerChannelId,
        muted: false,
        soloed: false,
        volume: 0,
        pan: 0,
        events: [],
        parameters: {},
      };

      const track: PatternTrack = {
        ...trackState,
        channel: mixerManager.actions.getInputNode(
          mixerChannelId,
        ) as Tone.Channel,
        parameters: {},
        state: trackState,
      };

      if (type === "instrument" && instrumentType) {
        track.instrument = this.createTrackInstrument(instrumentType, options);
        track.instrument.connect(track.channel);
      }

      pattern.tracks.push(track);
      pattern.state.tracks.push(trackState);

      return trackId;
    },

    removeTrack: (patternId: string, trackId: string): void => {
      const pattern = this.patterns.get(patternId);
      if (!pattern) return;

      const track = pattern.tracks.find((t) => t.id === trackId);
      if (track) {
        track.instrument?.dispose();
        track.player?.dispose();
        Object.values(track.parameters).forEach((param) => param.dispose());
      }

      pattern.tracks = pattern.tracks.filter((t) => t.id !== trackId);
      pattern.state.tracks = pattern.state.tracks.filter(
        (t) => t.id !== trackId,
      );
    },

    updateTrack: (
      patternId: string,
      trackId: string,
      updates: Partial<PatternTrackState>,
    ): void => {
      const pattern = this.patterns.get(patternId);
      if (!pattern) return;

      const track = pattern.tracks.find((t) => t.id === trackId);
      const trackState = pattern.state.tracks.find((t) => t.id === trackId);

      if (track && trackState) {
        Object.assign(track, updates);
        Object.assign(trackState, updates);
      }
    },

    addEvent: (
      patternId: string,
      trackId: string,
      event: SequenceEvent,
    ): void => {
      const pattern = this.patterns.get(patternId);
      if (!pattern) return;

      const track = pattern.tracks.find((t) => t.id === trackId);
      const trackState = pattern.state.tracks.find((t) => t.id === trackId);

      if (track && trackState) {
        track.events.push(event);
        trackState.events.push(event);
      }
    },

    removeEvent: (
      patternId: string,
      trackId: string,
      eventId: string,
    ): void => {
      const pattern = this.patterns.get(patternId);
      if (!pattern) return;

      const track = pattern.tracks.find((t) => t.id === trackId);
      const trackState = pattern.state.tracks.find((t) => t.id === trackId);

      if (track && trackState) {
        // Assuming events have an id property
        track.events = track.events.filter((e) => (e as any).id !== eventId);
        trackState.events = trackState.events.filter(
          (e) => (e as any).id !== eventId,
        );
      }
    },

    updateEvent: (
      patternId: string,
      trackId: string,
      eventId: string,
      updates: Partial<SequenceEvent>,
    ): void => {
      const pattern = this.patterns.get(patternId);
      if (!pattern) return;

      const track = pattern.tracks.find((t) => t.id === trackId);
      const trackState = pattern.state.tracks.find((t) => t.id === trackId);

      if (track && trackState) {
        // Assuming events have an id property
        const eventIndex = track.events.findIndex(
          (e) => (e as any).id === eventId,
        );
        if (eventIndex !== -1) {
          track.events[eventIndex] = {
            ...track.events[eventIndex],
            ...updates,
          };
          trackState.events[eventIndex] = {
            ...trackState.events[eventIndex],
            ...updates,
          };
        }
      }
    },

    setCurrentPattern: (id: string | null): void => {
      if (id === null) {
        this.currentPattern = null;
        this.updateState({ currentPatternId: null });
        return;
      }

      const pattern = this.patterns.get(id);
      if (!pattern) return;

      this.currentPattern = pattern;
      this.updateState({ currentPatternId: id });
    },

    getPattern: (id: string): Pattern | undefined => {
      return this.patterns.get(id);
    },

    getCurrentPattern: (): Pattern | null => {
      return this.currentPattern;
    },

    getPatterns: (): Pattern[] => {
      return Array.from(this.patterns.values());
    },

    dispose: (): void => {
      this.stopPatternPlayback();
      this.patterns.forEach((pattern) => {
        pattern.tracks.forEach((track) => {
          track.instrument?.dispose();
          track.player?.dispose();
          Object.values(track.parameters).forEach((param) => param.dispose());
        });
      });
      this.patterns.clear();
      this.updateState({ patterns: [] });
      this.currentPattern = null;
      this.updateState({ currentPatternId: null });
    },

    duplicatePattern: (id: string): string => {
      const pattern = this.patterns.get(id);
      if (!pattern) throw new Error("Pattern not found");
      const newPatternId = `pattern_${Date.now()}`;
      const newPatternData: PatternData = {
        ...pattern.state,
        id: newPatternId,
        name: `${pattern.state.name} (Copy)`,
      };
      const newPattern: Pattern = {
        id: newPatternId,
        tracks: [],
        state: newPatternData,
      };
      // Duplicate tracks
      pattern.tracks.forEach((track) => {
        const newTrackId = this.actions.addTrack(
          newPatternId,
          track.state.name,
          track.state.type,
          track.state.instrumentType,
          track.state.instrumentOptions,
        );
        const newTrack = newPattern.tracks.find((t) => t.id === newTrackId);
        if (newTrack) {
          newTrack.muted = track.muted;
          newTrack.soloed = track.soloed;
          newTrack.volume = track.volume;
          newTrack.pan = track.pan;
          newTrack.events = [...track.events];
          newTrack.state.events = [...track.state.events];
        }
      });
      this.patterns.set(newPatternId, newPattern);
      this.updateState({
        patterns: [...this.state.patterns, newPatternData],
      });
      return newPatternId;
    },

    updatePattern: (id: string, updates: Partial<Pattern>): void => {
      const pattern = this.patterns.get(id);
      if (!pattern) return;

      // Update runtime pattern
      Object.assign(pattern, updates);

      // Update state
      const updatedState = {
        ...pattern.state,
        ...updates,
        tracks: pattern.state.tracks, // Preserve tracks
      };
      pattern.state = updatedState;

      this.updateState({
        patterns: this.state.patterns.map((p) =>
          p.id === id ? updatedState : p,
        ),
      });

      // Update part if it exists and relevant properties changed
      if (pattern.part) {
        if ("isLoop" in updates) {
          pattern.part.loop = updates.isLoop ?? pattern.part.loop;
        }
        if ("loopStart" in updates) {
          pattern.part.loopStart = updates.loopStart ?? pattern.part.loopStart;
        }
        if ("loopEnd" in updates) {
          pattern.part.loopEnd = updates.loopEnd ?? pattern.part.loopEnd;
        }
      }
    },

    setLoop: (id: string, isLoop: boolean, start?: Time, end?: Time): void => {
      const pattern = this.patterns.get(id);
      if (!pattern) return;

      // Update state
      pattern.state = {
        ...pattern.state,
        isLoop,
        loopStart: start,
        loopEnd: end,
      };

      // Update part if it exists
      if (pattern.part) {
        pattern.part.loop = isLoop;
        if (isLoop && start !== undefined) {
          pattern.part.loopStart = start;
        }
        if (isLoop && end !== undefined) {
          pattern.part.loopEnd = end;
        }
      }

      this.updateState({
        patterns: this.state.patterns.map((p) =>
          p.id === id ? pattern.state : p,
        ),
      });
    },

    setColor: (id: string, color: string): void => {
      const pattern = this.patterns.get(id);
      if (!pattern) return;

      // Update state
      pattern.state = {
        ...pattern.state,
        color,
      };

      this.updateState({
        patterns: this.state.patterns.map((p) =>
          p.id === id ? pattern.state : p,
        ),
      });
    },

    setDefaultLoopLength: (id: string, length: Time): void => {
      const pattern = this.patterns.get(id);
      if (!pattern) return;

      // Validate length
      const lengthInSeconds = Tone.Time(length).toSeconds();
      if (lengthInSeconds <= 0) {
        throw new Error("Loop length must be greater than 0");
      }

      // Update state
      pattern.state = {
        ...pattern.state,
        defaultLoopLength: length,
      };

      this.updateState({
        patterns: this.state.patterns.map((p) =>
          p.id === id ? pattern.state : p,
        ),
      });
    },
  };

  private startPatternPlayback(): void {
    if (!this.currentPattern) return;

    this.currentPattern.tracks.forEach((track) => {
      if (track.type === "instrument" && track.instrument) {
        // Create Tone.Part for instrument track
        const part = new Tone.Part((time, event: SequenceEvent) => {
          if (track.muted || (!track.soloed && this.hasSoloedTracks())) return;

          if (this.isNoteSequenceEvent(event)) {
            track.instrument?.triggerAttackRelease(
              event.note,
              event.duration ?? "8n",
              time,
              event.velocity ?? 1,
            );
          }
        }, track.events);

        part.loop = transportManager.getState().isLooping;
        part.loopStart = transportManager.getState().loopStart;
        part.loopEnd = transportManager.getState().loopEnd;
        part.start(0);
      } else if (track.type === "audio" && track.player) {
        // Create Tone.Part for audio track
        const part = new Tone.Part<SequenceEvent>((time, event) => {
          if (track.muted || (!track.soloed && this.hasSoloedTracks())) return;

          if (this.isAudioSequenceEvent(event)) {
            track.player?.start(time, event.offset ?? 0, event.duration);
          }
        }, track.events);

        part.loop = transportManager.getState().isLooping;
        part.loopStart = transportManager.getState().loopStart;
        part.loopEnd = transportManager.getState().loopEnd;
        part.start(0);
      }
    });
  }

  private stopPatternPlayback(): void {
    Tone.getTransport().cancel();
    this.activeEvents.clear();
  }

  private hasSoloedTracks(): boolean {
    return this.currentPattern?.tracks.some((t) => t.soloed) ?? false;
  }

  private isNoteSequenceEvent(
    event: SequenceEvent,
  ): event is NoteSequenceEvent {
    return event.type === "note";
  }

  private isAudioSequenceEvent(
    event: SequenceEvent,
  ): event is AudioSequenceEvent {
    return event.type === "audio";
  }

  private createTrackInstrument(
    type: InstrumentName,
    options?: InstrumentOptions,
  ): InstrumentType {
    switch (type) {
      case InstrumentName.AMSynth:
        return new Tone.AMSynth(options);
      case InstrumentName.FMSynth:
        return new Tone.FMSynth(options);
      case InstrumentName.MembraneSynth:
        return new Tone.MembraneSynth(options);
      case InstrumentName.MetalSynth:
        return new Tone.MetalSynth(options);
      case InstrumentName.MonoSynth:
        return new Tone.MonoSynth(options);
      case InstrumentName.NoiseSynth:
        return new Tone.NoiseSynth(options);
      default:
        return new Tone.Synth(options);
    }
  }

  private createRuntimePattern(patternData: PatternData): Pattern {
    return {
      id: patternData.id,
      tracks: [],
      state: patternData,
    };
  }

  public toJSON(): PatternState {
    return {
      ...this.state,
      patterns: this.state.patterns.map((pattern) => ({
        ...pattern,
        color: pattern.color,
        defaultLoopLength: pattern.defaultLoopLength,
        isLoop: pattern.isLoop,
        loopStart: pattern.loopStart,
        loopEnd: pattern.loopEnd,
      })),
    };
  }

  public fromJSON(state: PatternState): void {
    // Clean up existing patterns
    this.actions.dispose();

    // Recreate patterns from state
    state.patterns.forEach((patternData) => {
      const pattern: Pattern = {
        ...patternData,
        tracks: [],
        state: patternData,
      };

      // Recreate tracks
      patternData.tracks.forEach((trackState) => {
        const track: PatternTrack = {
          ...trackState,
          channel: mixerManager.actions.getInputNode(
            trackState.mixerChannelId,
          ) as Tone.Channel,
          parameters: {},
          state: trackState,
        };

        if (track.type === "instrument" && trackState.instrumentType) {
          track.instrument = this.createTrackInstrument(
            trackState.instrumentType,
            trackState.instrumentOptions,
          );
          track.instrument.connect(track.channel);
        }

        pattern.tracks.push(track);
      });

      this.patterns.set(pattern.id, pattern);
    });

    this.state = state;
    this.currentPattern = state.currentPatternId
      ? (this.patterns.get(state.currentPatternId) ?? null)
      : null;
  }
}
