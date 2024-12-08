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

export class PatternManager {
  public readonly state: PatternState;
  public readonly patterns: Map<string, Pattern>;
  private currentPattern: Pattern | null;
  private activeEvents: Set<number>;

  constructor() {
    this.state = {
      patterns: [],
      currentPatternId: null,
    };
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

  public readonly actions: PatternActions = {
    createPattern: (name: string, timeSignature: [number, number]): string => {
      const id = `pattern_${Date.now()}`;

      const patternData: PatternData = {
        id,
        name,
        tracks: [],
        length: "4m",
        timeSignature,
      };

      const pattern: Pattern = {
        ...patternData,
        tracks: [],
        state: patternData,
      };

      this.patterns.set(id, pattern);
      this.state.patterns.push(patternData);

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
      this.state.patterns = this.state.patterns.filter((p) => p.id !== id);

      if (this.state.currentPatternId === id) {
        this.state.currentPatternId = null;
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
        this.state.currentPatternId = null;
        return;
      }

      const pattern = this.patterns.get(id);
      if (!pattern) return;

      this.currentPattern = pattern;
      this.state.currentPatternId = id;
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
      this.state.patterns = [];
      this.currentPattern = null;
      this.state.currentPatternId = null;
    },
    duplicatePattern: (id: string): string => {
      const pattern = this.patterns.get(id);
      if (!pattern) throw new Error("Pattern not found");
      const newPatternId = this.actions.createPattern(
        `${pattern.state.name} (copy)`,
        pattern.state.timeSignature,
      );
      pattern.state.tracks.forEach((track) => {
        const newTrackId = this.actions.addTrack(
          newPatternId,
          track.name,
          track.type,
          track.instrumentType,
          track.instrumentOptions,
        );
        track.events.forEach((event) => {
          this.actions.addEvent(newPatternId, newTrackId, event);
        });
      });
      return newPatternId;
    },
    updatePattern: (id: string, updates: Partial<Pattern>): void => {
      const pattern = this.patterns.get(id);
      if (!pattern) return;
      Object.assign(pattern, updates);
      Object.assign(pattern.state, updates);
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

  public toJSON(): PatternState {
    return { ...this.state };
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
