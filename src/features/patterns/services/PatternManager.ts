// src/features/patterns/services/PatternManager.ts

import * as Tone from "tone";
import {
  Pattern,
  Track,
  TrackEvent,
  NoteEvent,
  AudioEvent,
} from "@/core/interfaces/pattern";
import { transportManager } from "@/common/services/transportManagerInstance";
import { mixerManager } from "@/features/mixer/services/mixerManagerInstance";
import {
  InstrumentName,
  InstrumentOptions,
  InstrumentType,
} from "@/core/types/instrument";
import { PlaybackMode } from "@/core/types/common";

export class PatternManager {
  private patterns: Map<string, Pattern>;
  private currentPattern: Pattern | null;
  private activeEvents: Set<number>;

  constructor() {
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
      case InstrumentName.Synth:
        return new Tone.Synth(options as Tone.SynthOptions);
      case InstrumentName.AMSynth:
        return new Tone.AMSynth(options as Tone.AMSynthOptions);
      case InstrumentName.DuoSynth:
        return new Tone.DuoSynth(options as Tone.DuoSynthOptions);
      case InstrumentName.FMSynth:
        return new Tone.FMSynth(options as Tone.FMSynthOptions);
      case InstrumentName.MembraneSynth:
        return new Tone.MembraneSynth(options as Tone.MembraneSynthOptions);
      case InstrumentName.MetalSynth:
        return new Tone.MetalSynth(options as Tone.MetalSynthOptions);
      case InstrumentName.MonoSynth:
        return new Tone.MonoSynth(options as Tone.MonoSynthOptions);
      case InstrumentName.NoiseSynth:
        return new Tone.NoiseSynth(options as Tone.NoiseSynthOptions);
      case InstrumentName.PluckSynth:
        return new Tone.PluckSynth(options as Tone.PluckSynthOptions);
      case InstrumentName.Sampler:
        return new Tone.Sampler(options as Tone.SamplerOptions);
      default:
        return new Tone.Synth(options as Tone.SynthOptions);
    }
  }

  private scheduleTrack(track: Track): void {
    if (track.type === "instrument" && track.instrument) {
      // Create Tone.Part for instrument track
      const part = new Tone.Part<TrackEvent>((time, event) => {
        if (track.muted || (!track.soloed && this.hasSoloedTracks())) return;

        if (this.isNoteEvent(event)) {
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
      const part = new Tone.Part<TrackEvent>((time, event) => {
        if (track.muted || (!track.soloed && this.hasSoloedTracks())) return;

        if (this.isAudioEvent(event)) {
          track.player?.start(time, event.offset ?? 0, event.duration);
        }
      }, track.events);

      part.loop = transportManager.getState().isLooping;
      part.loopStart = transportManager.getState().loopStart;
      part.loopEnd = transportManager.getState().loopEnd;
      part.start(0);
    }
  }

  private isNoteEvent(event: TrackEvent): event is NoteEvent {
    return "note" in event;
  }

  private isAudioEvent(event: TrackEvent): event is AudioEvent {
    return "bufferIndex" in event;
  }

  private hasSoloedTracks(): boolean {
    return this.currentPattern?.tracks.some((t) => t.soloed) ?? false;
  }

  private startPatternPlayback(): void {
    if (!this.currentPattern) return;

    // Schedule all tracks
    this.currentPattern.tracks.forEach((track) => {
      this.scheduleTrack(track);
    });
  }

  private stopPatternPlayback(): void {
    // Clear all scheduled events
    Tone.getTransport().cancel();
    this.activeEvents.clear();
  }

  // Public API
  public createPattern(name: string, timeSignature: [number, number]): string {
    const id = `pattern_${Date.now()}`;
    const pattern: Pattern = {
      id,
      name,
      tracks: [],
      length: 4,
      timeSignature,
    };

    this.patterns.set(id, pattern);
    return id;
  }

  public addTrack(
    patternId: string,
    name: string,
    type: "instrument" | "audio",
    instrumentType?: InstrumentName,
    options?: InstrumentOptions,
  ): string {
    const pattern = this.patterns.get(patternId);
    if (!pattern) throw new Error("Pattern not found");

    const trackId = `track_${Date.now()}`;
    const mixerChannelId = mixerManager.actions.createChannel(name);

    const track: Track = {
      id: trackId,
      name,
      type,
      events: [],
      muted: false,
      soloed: false,
      volume: 0,
      pan: 0,
      channel: mixerManager.getInputNode(mixerChannelId) as Tone.Channel,
      parameters: {},
    };

    if (type === "instrument" && instrumentType) {
      track.instrument = this.createTrackInstrument(instrumentType, options);
      track.instrument.connect(track.channel);
    }

    pattern.tracks.push(track);
    return trackId;
  }

  public addEvent(patternId: string, trackId: string, event: TrackEvent): void {
    const pattern = this.patterns.get(patternId);
    if (!pattern) throw new Error("Pattern not found");

    const track = pattern.tracks.find((t) => t.id === trackId);
    if (!track) throw new Error("Track not found");

    track.events.push(event);
    track.events.sort(
      (a, b) => Tone.Time(a.time).toSeconds() - Tone.Time(b.time).toSeconds(),
    );
  }

  public setCurrentPattern(patternId: string): void {
    const pattern = this.patterns.get(patternId);
    if (!pattern) throw new Error("Pattern not found");

    this.stopPatternPlayback();
    this.currentPattern = pattern;

    if (transportManager.getState().isPlaying) {
      this.startPatternPlayback();
    }
  }

  public dispose(): void {
    this.stopPatternPlayback();
    this.patterns.forEach((pattern) => {
      pattern.tracks.forEach((track) => {
        track.instrument?.dispose();
        track.player?.dispose();
        Object.values(track.parameters).forEach((param) => param.dispose());
      });
    });
    this.patterns.clear();
    this.currentPattern = null;
  }
}
