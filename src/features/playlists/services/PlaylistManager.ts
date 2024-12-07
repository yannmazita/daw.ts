// src/features/playlists/services/PlaylistManager.ts

import * as Tone from "tone";
import {
  Playlist,
  PlaylistTrack,
  PatternPlacement,
} from "@/core/interfaces/playlist";
import {
  AudioSequenceEvent,
  NoteSequenceEvent,
  Pattern,
  SequenceEvent,
} from "@/core/interfaces/pattern";
import { transportManager } from "@/common/services/transportManagerInstance";
import { patternManager } from "@/features/patterns/services/patternManagerInstance";
import { PlaybackMode } from "@/core/types/common";
import { Time } from "tone/build/esm/core/type/Units";

export class PlaylistManager implements Playlist {
  public tracks: PlaylistTrack[];
  private patterns: Map<string, PatternPlacement>;
  private scheduledEvents: Set<number>;
  private _length: Time;

  constructor() {
    this.tracks = [];
    this.patterns = new Map();
    this.scheduledEvents = new Set();
    this._length = "0";

    // Register playlist mode handler
    transportManager.registerModeHandler(
      PlaybackMode.PLAYLIST,
      () => this.startPlaylistPlayback(),
      () => this.stopPlaylistPlayback(),
    );
  }

  // Getter for length property
  get length(): Time {
    return this._length;
  }

  private startPlaylistPlayback(): void {
    const transport = Tone.getTransport();
    const currentPosition = transport.position;

    // Schedule patterns around current position
    this.schedulePatternSegment(
      currentPosition,
      Tone.Time(currentPosition).toSeconds() + Tone.Time("2m").toSeconds(),
    );

    // Set up lookahead scheduler
    const scheduleId = transport.scheduleRepeat((time) => {
      this.schedulePatternSegment(
        time,
        Tone.Time(time).toSeconds() + Tone.Time("2m").toSeconds(),
      );
    }, "1m");

    this.scheduledEvents.add(scheduleId);
  }

  private stopPlaylistPlayback(): void {
    this.scheduledEvents.forEach((id) => {
      Tone.getTransport().clear(id);
    });
    this.scheduledEvents.clear();
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

  private schedulePatternSegment(startTime: Time, endTime: Time): void {
    const patternsInRange = this.getPatternsBetween(startTime, endTime);

    patternsInRange.forEach((placement) => {
      const pattern = patternManager.getPattern(placement.patternId);
      if (!pattern) return;

      // Find the corresponding playlist track
      const playlistTrack = this.tracks.find((track) =>
        track.patterns.some((p) => p.id === placement.id),
      );

      if (!playlistTrack || playlistTrack.muted) return;

      // Schedule each track in the pattern
      pattern.tracks.forEach((track) => {
        if (track.type === "instrument" && track.instrument) {
          const part = new Tone.Part((time, event: SequenceEvent) => {
            if (this.isNoteSequenceEvent(event)) {
              track.instrument?.triggerAttackRelease(
                event.note,
                event.duration ?? "8n",
                time,
                event.velocity ?? 1,
              );
            }
          }, track.events);

          // Configure part timing
          part.start(placement.startTime);
          part.stop(
            Tone.Time(placement.startTime).toSeconds() +
              Tone.Time(placement.duration).toSeconds(),
          );

          // Store scheduled event for cleanup
          const eventId = Tone.getTransport().schedule(
            () => {
              part.dispose();
            },
            Tone.Time(placement.startTime).toSeconds() +
              Tone.Time(placement.duration).toSeconds(),
          );

          this.scheduledEvents.add(eventId);
        } else if (track.type === "audio" && track.player) {
          const eventId = Tone.getTransport().schedule((time) => {
            track.events.forEach((event) => {
              if (this.isAudioSequenceEvent(event)) {
                track.player?.start(time, event.offset ?? 0, event.duration);
              }
            });
          }, placement.startTime);

          this.scheduledEvents.add(eventId);
        }
      });
    });
  }

  private getPatternsBetween(
    startTime: Time,
    endTime: Time,
  ): PatternPlacement[] {
    return this.tracks
      .flatMap((track) => track.patterns)
      .filter((placement) => {
        const placementStart = Tone.Time(placement.startTime).toSeconds();
        const placementEnd =
          Tone.Time(placement.startTime).toSeconds() +
          Tone.Time(placement.duration).toSeconds();
        const timeStart = Tone.Time(startTime).toSeconds();
        const timeEnd = Tone.Time(endTime).toSeconds();
        return (
          (placementStart >= timeStart && placementStart < timeEnd) ||
          (placementEnd > timeStart && placementEnd <= timeEnd) ||
          (placementStart <= timeStart && placementEnd >= timeEnd)
        );
      });
  }

  public addPattern(
    trackId: string,
    pattern: Pattern,
    startTime: Time,
  ): string {
    const track = this.tracks.find((t) => t.id === trackId);
    if (!track) throw new Error("Track not found");

    const placement: PatternPlacement = {
      id: `placement_${Date.now()}`,
      patternId: pattern.id,
      startTime,
      duration: pattern.length,
      offset: "0",
    };

    track.patterns.push(placement);
    this.updateLength();

    return placement.id;
  }

  public removePattern(trackId: string, placementId: string): void {
    const track = this.tracks.find((t) => t.id === trackId);
    if (!track) return;

    track.patterns = track.patterns.filter((p) => p.id !== placementId);
    this.updateLength();
  }

  public movePattern(
    placementId: string,
    trackId: string,
    startTime: Time,
  ): void {
    const track = this.tracks.find((t) => t.id === trackId);
    if (!track) return;

    const placement = track.patterns.find((p) => p.id === placementId);
    if (!placement) return;

    placement.startTime = startTime;
    this.updateLength();
  }

  public getPatternAt(time: Time): Pattern[] {
    const placements = this.getPatternsBetween(time, time);
    return placements
      .map((placement) => patternManager.getPattern(placement.patternId))
      .filter((pattern): pattern is Pattern => pattern !== undefined);
  }

  private updateLength(): void {
    if (this.tracks.length === 0) {
      this._length = "0";
      return;
    }

    const lastEnd = Math.max(
      ...this.tracks.flatMap((track) =>
        track.patterns.map(
          (placement) =>
            Tone.Time(placement.startTime).toSeconds() +
            Tone.Time(placement.duration).toSeconds(),
        ),
      ),
    );

    this._length = Tone.Time(lastEnd).toBarsBeatsSixteenths();
  }

  public dispose(): void {
    this.stopPlaylistPlayback();
    this.tracks = [];
    this.patterns.clear();
    this._length = "0";
  }
}
