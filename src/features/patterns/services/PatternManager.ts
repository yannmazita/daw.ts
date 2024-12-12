// src/features/patterns/services/PatternManager.ts

import * as Tone from "tone";
import {
  Pattern,
  PatternTrack,
  PatternActions,
  SequenceEvent,
  NoteEvent,
  AudioEvent,
  InstrumentTrack,
  AudioTrack,
  SerializableTrack,
  PatternsState,
  PatternState,
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
  public readonly state: PatternsState;
  private readonly patterns: Map<string, Pattern>;
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

    transportManager.registerModeHandler(
      PlaybackMode.PATTERN,
      () => this.startPatternPlayback(),
      () => this.stopPatternPlayback(),
    );
  }

  public readonly actions: PatternActions = {
    createPattern: (name: string, timeSignature: [number, number]): string => {
      const pattern: Pattern = {
        id: `pattern_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name,
        tracks: [],
        startTime: 0,
        duration: "4m",
        timeSignature,
        dispose: () => this.disposePattern(pattern.id),
      };

      this.patterns.set(pattern.id, pattern);

      this.state.patterns.push({
        id: pattern.id,
        name: pattern.name,
        startTime: pattern.startTime,
        duration: pattern.duration,
        timeSignature: pattern.timeSignature,
        tracks: [],
      });

      return pattern.id;
    },

    createInstrumentTrack: (
      patternId: string,
      name: string,
      instrumentType: InstrumentName,
      options?: InstrumentOptions,
    ): string => {
      const pattern = this.patterns.get(patternId);
      if (!pattern) throw new Error("Pattern not found");

      const id = `track_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const mixerChannelId = mixerManager.actions.createChannel(name);
      const instrument = this.createInstrument(instrumentType, options);
      const channel = mixerManager.actions.getInputNode(
        mixerChannelId,
      ) as Tone.Channel;

      instrument.connect(channel);

      const track: InstrumentTrack = {
        id,
        name,
        type: "instrument",
        instrumentType,
        instrumentOptions: options,
        mixerChannelId,
        mute: false,
        solo: false,
        volume: 0,
        pan: 0,
        events: [],
        parameters: {},
        instrument,
        channel,
        signals: {},
      };

      pattern.tracks.push(track);

      const patternState = this.state.patterns.find((p) => p.id === patternId);
      if (patternState) {
        patternState.tracks.push(this.serializeTrack(track));
      }

      return track.id;
    },

    createAudioTrack: (patternId: string, name: string): string => {
      const pattern = this.patterns.get(patternId);
      if (!pattern) throw new Error("Pattern not found");

      const id = `track_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const mixerChannelId = mixerManager.actions.createChannel(name);
      const channel = mixerManager.actions.getInputNode(
        mixerChannelId,
      ) as Tone.Channel;

      const track: AudioTrack = {
        id,
        name,
        type: "audio",
        mixerChannelId,
        mute: false,
        solo: false,
        volume: 0,
        pan: 0,
        events: [],
        parameters: {},
        player: new Tone.Player(),
        channel,
        signals: {},
      };

      track.player.connect(channel);
      pattern.tracks.push(track);

      const patternState = this.state.patterns.find((p) => p.id === patternId);
      if (patternState) {
        patternState.tracks.push(this.serializeTrack(track));
      }

      return track.id;
    },
    removePatternTrack: (patternId: string, trackId: string): void => {
      const pattern = this.patterns.get(patternId);
      if (!pattern) return;

      const track = pattern.tracks.find((t) => t.id === trackId);
      if (!track) return;

      // Cleanup track resources
      if (this.isInstrumentTrack(track)) {
        track.instrument.dispose();
      } else {
        track.player.dispose();
      }
      Object.values(track.signals).forEach((signal) => signal.dispose());

      // Remove from mixer
      mixerManager.actions.removeChannel(track.mixerChannelId);

      // Update pattern
      pattern.tracks = pattern.tracks.filter((t) => t.id !== trackId);

      // Update state
      const patternState = this.state.patterns.find((p) => p.id === patternId);
      if (patternState) {
        patternState.tracks = patternState.tracks.filter(
          (t) => t.id !== trackId,
        );
      }
    },

    updatePatternTrack: <T extends PatternTrack>(
      patternId: string,
      trackId: string,
      updates: Partial<T>,
    ): void => {
      const pattern = this.patterns.get(patternId);
      if (!pattern) return;

      const track = pattern.tracks.find((t) => t.id === trackId) as T;
      if (!track) return;

      // Update runtime properties
      if ("volume" in updates) track.channel.volume.value = updates.volume!;
      if ("pan" in updates) track.channel.pan.value = updates.pan!;
      if ("mute" in updates) track.channel.mute = updates.mute!;

      // Update track state
      Object.assign(track, updates);

      // Update pattern state
      const patternState = this.state.patterns.find((p) => p.id === patternId);
      if (patternState) {
        const trackState = patternState.tracks.find((t) => t.id === trackId);
        if (trackState) {
          Object.assign(trackState, updates);
        }
      }
    },

    addNoteEvent: (
      patternId: string,
      trackId: string,
      event: Omit<NoteEvent, "id">,
    ): string => {
      const pattern = this.patterns.get(patternId);
      if (!pattern) throw new Error("Pattern not found");

      const track = pattern.tracks.find((t) => t.id === trackId);
      if (!track || !this.isInstrumentTrack(track)) {
        throw new Error("Instrument track not found");
      }

      const id = `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const noteEvent: NoteEvent = { ...event, id };

      track.events.push(noteEvent);

      // Update pattern state
      const patternState = this.state.patterns.find((p) => p.id === patternId);
      if (patternState) {
        const trackState = patternState.tracks.find((t) => t.id === trackId);
        if (trackState) {
          trackState.events.push(noteEvent);
        }
      }

      // Update part if playing
      if (pattern.part) {
        pattern.part.add(noteEvent.startTime, noteEvent);
      }

      return id;
    },

    addAudioEvent: (
      patternId: string,
      trackId: string,
      event: Omit<AudioEvent, "id">,
    ): string => {
      const pattern = this.patterns.get(patternId);
      if (!pattern) throw new Error("Pattern not found");

      const track = pattern.tracks.find((t) => t.id === trackId);
      if (!track || !this.isAudioTrack(track)) {
        throw new Error("Audio track not found");
      }

      const id = `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const audioEvent: AudioEvent = { ...event, id };

      track.events.push(audioEvent);

      // Update pattern state
      const patternState = this.state.patterns.find((p) => p.id === patternId);
      if (patternState) {
        const trackState = patternState.tracks.find((t) => t.id === trackId);
        if (trackState) {
          trackState.events.push(audioEvent);
        }
      }

      // Update part if playing
      if (pattern.part) {
        pattern.part.add(audioEvent.startTime, audioEvent);
      }

      return id;
    },

    removeEvent: (
      patternId: string,
      trackId: string,
      eventId: string,
    ): void => {
      const pattern = this.patterns.get(patternId);
      if (!pattern) return;

      const track = pattern.tracks.find((t) => t.id === trackId);
      if (!track) return;

      track.events = track.events.filter((e) => e.id !== eventId);

      // Update pattern state
      const patternState = this.state.patterns.find((p) => p.id === patternId);
      if (patternState) {
        const trackState = patternState.tracks.find((t) => t.id === trackId);
        if (trackState) {
          trackState.events = trackState.events.filter((e) => e.id !== eventId);
        }
      }

      // Update part if playing
      if (pattern.part) {
        pattern.part.remove(eventId);
      }
    },

    updateEvent: <T extends SequenceEvent>(
      patternId: string,
      trackId: string,
      eventId: string,
      updates: Partial<Omit<T, "id" | "type">>,
    ): void => {
      const pattern = this.patterns.get(patternId);
      if (!pattern) return;

      const track = pattern.tracks.find((t) => t.id === trackId);
      if (!track) return;

      const eventIndex = track.events.findIndex((e) => e.id === eventId);
      if (eventIndex === -1) return;

      const event = track.events[eventIndex] as T;
      const updatedEvent = { ...event, ...updates };
      track.events[eventIndex] = updatedEvent;

      // Update pattern state
      const patternState = this.state.patterns.find((p) => p.id === patternId);
      if (patternState) {
        const trackState = patternState.tracks.find((t) => t.id === trackId);
        if (trackState) {
          const stateEventIndex = trackState.events.findIndex(
            (e) => e.id === eventId,
          );
          if (stateEventIndex !== -1) {
            trackState.events[stateEventIndex] = updatedEvent;
          }
        }
      }

      // Update part if playing
      if (pattern.part) {
        pattern.part.remove(eventId);
        pattern.part.add(updatedEvent.startTime, updatedEvent);
      }
    },

    deletePattern: (id: string): void => {
      const pattern = this.patterns.get(id);
      if (!pattern) return;

      pattern.dispose();
      this.patterns.delete(id);

      this.state.patterns = this.state.patterns.filter((p) => p.id !== id);
      if (this.state.currentPatternId === id) {
        this.currentPattern = null;
        this.state.currentPatternId = null;
      }
    },

    duplicatePattern: (id: string): string => {
      const sourcePattern = this.patterns.get(id);
      if (!sourcePattern) throw new Error("Pattern not found");

      const newId = this.actions.createPattern(
        `${sourcePattern.name} (copy)`,
        sourcePattern.timeSignature,
      );

      // Duplicate tracks
      for (const sourceTrack of sourcePattern.tracks) {
        let trackId: string;

        if (this.isInstrumentTrack(sourceTrack)) {
          trackId = this.actions.createInstrumentTrack(
            newId,
            sourceTrack.name,
            sourceTrack.instrumentType,
            sourceTrack.instrumentOptions,
          );
        } else {
          trackId = this.actions.createAudioTrack(newId, sourceTrack.name);
        }

        // Copy events
        sourceTrack.events.forEach((event) => {
          if (event.type === "note") {
            this.actions.addNoteEvent(newId, trackId, event);
          } else {
            this.actions.addAudioEvent(newId, trackId, event);
          }
        });
      }

      return newId;
    },

    updatePattern: (
      id: string,
      updates: Partial<Omit<Pattern, "tracks" | "part">>,
    ): void => {
      const pattern = this.patterns.get(id);
      if (!pattern) return;

      Object.assign(pattern, updates);

      const patternState = this.state.patterns.find((p) => p.id === id);
      if (patternState) {
        Object.assign(patternState, updates);
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
  };
  private createInstrument(
    type: InstrumentName,
    options?: InstrumentOptions,
  ): InstrumentType {
    switch (type) {
      case InstrumentName.AMSynth:
        return new Tone.AMSynth(options);
      case InstrumentName.DuoSynth:
        return new Tone.DuoSynth(options);
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
      case InstrumentName.Sampler:
        return new Tone.Sampler(options);
      default:
        return new Tone.Synth(options);
    }
  }

  private isInstrumentTrack(track: PatternTrack): track is InstrumentTrack {
    return track.type === "instrument";
  }

  private isAudioTrack(track: PatternTrack): track is AudioTrack {
    return track.type === "audio";
  }

  private serializeTrack(track: PatternTrack): SerializableTrack {
    const baseTrack = {
      id: track.id,
      name: track.name,
      type: track.type,
      mixerChannelId: track.mixerChannelId,
      mute: track.mute,
      solo: track.solo,
      volume: track.volume,
      pan: track.pan,
      events: track.events,
      parameters: track.parameters,
    };

    if (this.isInstrumentTrack(track)) {
      return {
        ...baseTrack,
        type: "instrument" as const,
        instrumentType: track.instrumentType,
        instrumentOptions: track.instrumentOptions,
      };
    } else {
      return {
        ...baseTrack,
        type: "audio" as const,
      };
    }
  }

  private disposePattern(patternId: string): void {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return;

    // Cleanup tracks
    pattern.tracks.forEach((track) => {
      if (this.isInstrumentTrack(track)) {
        track.instrument.dispose();
      } else {
        track.player.dispose();
      }

      Object.values(track.signals).forEach((signal) => signal.dispose());
      track.channel.dispose();

      // Remove from mixer
      mixerManager.actions.removeChannel(track.mixerChannelId);
    });

    // Cleanup pattern part
    pattern.part?.dispose();
  }

  private startPatternPlayback(): void {
    if (!this.currentPattern) return;

    this.stopPatternPlayback();

    const pattern = this.currentPattern;
    pattern.part = new Tone.Part((time, event: SequenceEvent) => {
      const track = pattern.tracks.find((t) =>
        t.events.some((e) => e.id === event.id),
      );

      if (!track) return;
      if (track.mute || (!track.solo && this.hasSoloedTracks(pattern))) return;

      if (event.type === "note" && this.isInstrumentTrack(track)) {
        track.instrument.triggerAttackRelease(
          event.note,
          event.duration ?? "8n",
          time,
          event.velocity ?? 1,
        );
      } else if (event.type === "audio" && this.isAudioTrack(track)) {
        track.player.start(time, event.offset ?? 0, event.duration);
      }
    }, this.flattenPatternEvents(pattern));

    const transportState = transportManager.getState();
    pattern.part.loop = transportState.isLooping;
    pattern.part.loopStart = transportState.loopStart;
    pattern.part.loopEnd = transportState.loopEnd;
    pattern.part.start(0);
  }

  private stopPatternPlayback(): void {
    if (this.currentPattern?.part) {
      this.currentPattern.part.dispose();
      this.currentPattern.part = undefined;
    }
    this.activeEvents.clear();
  }

  private flattenPatternEvents(pattern: Pattern): SequenceEvent[] {
    return pattern.tracks.flatMap((track) => track.events);
  }

  private hasSoloedTracks(pattern: Pattern): boolean {
    return pattern.tracks.some((t) => t.solo);
  }

  public dispose(): void {
    this.stopPatternPlayback();

    // Cleanup all patterns
    this.patterns.forEach((pattern) => {
      this.disposePattern(pattern.id);
    });

    this.patterns.clear();
    this.currentPattern = null;
    this.state.patterns = [];
    this.state.currentPatternId = null;
  }

  // Serialization methods for persistence
  public toJSON(): PatternsState {
    return {
      patterns: this.state.patterns.map((pattern) => {
        const patternState: PatternState = {
          id: pattern.id,
          name: pattern.name,
          startTime: pattern.startTime,
          duration: pattern.duration,
          timeSignature: pattern.timeSignature,
          tracks: pattern.tracks, // already SerializableTrack[]
        };
        return patternState;
      }),
      currentPatternId: this.state.currentPatternId,
    };
  }

  public fromJSON(state: PatternsState): void {
    // Cleanup existing patterns
    this.dispose();

    // Recreate patterns from state
    state.patterns.forEach((patternState) => {
      const id = this.actions.createPattern(
        patternState.name,
        patternState.timeSignature,
      );

      const pattern = this.patterns.get(id)!;
      pattern.startTime = patternState.startTime;
      pattern.duration = patternState.duration;

      // Recreate tracks
      patternState.tracks.forEach((trackState) => {
        if (trackState.type === "instrument") {
          this.actions.createInstrumentTrack(
            id,
            trackState.name,
            trackState.instrumentType,
            trackState.instrumentOptions,
          );
        } else {
          this.actions.createAudioTrack(id, trackState.name);
        }

        // Restore track state
        this.actions.updatePatternTrack(id, trackState.id, trackState);

        // Restore events
        trackState.events.forEach((event) => {
          if (event.type === "note") {
            this.actions.addNoteEvent(id, trackState.id, event);
          } else {
            this.actions.addAudioEvent(id, trackState.id, event);
          }
        });
      });
    });

    // Restore current pattern
    if (state.currentPatternId) {
      this.actions.setCurrentPattern(state.currentPatternId);
    }
  }
}
