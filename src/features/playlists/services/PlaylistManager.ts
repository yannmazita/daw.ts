// src/features/playlists/services/PlaylistManager.ts

import * as Tone from "tone";
import {
  PlaylistState,
  PlaylistActions,
  PlaylistTrackState,
  PatternPlacement,
} from "@/core/interfaces/playlist";
import { Pattern } from "@/core/interfaces/pattern";
import { transportManager } from "@/common/services/transportManagerInstance";
import { patternManager } from "@/features/patterns/services/patternManagerInstance";
import { PlaybackMode } from "@/core/types/common";
import { Time } from "tone/build/esm/core/type/Units";
import { BaseManager } from "@/common/services/BaseManager";

export class PlaylistManager extends BaseManager<PlaylistState> {
  private scheduledEvents: Set<number>;
  private patternParts: Map<string, Tone.Part>;

  constructor() {
    super({
      tracks: [],
      length: "0",
    });

    this.scheduledEvents = new Set();
    this.patternParts = new Map();

    // Register playlist mode handler
    transportManager.registerModeHandler(
      PlaybackMode.PLAYLIST,
      () => this.startPlaylistPlayback(),
      () => this.stopPlaylistPlayback(),
    );
  }

  public readonly actions: PlaylistActions = {
    // Track Management
    createTrack: (name: string): string => {
      const id = `track_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const track: PlaylistTrackState = {
        id,
        name,
        patterns: [],
        muted: false,
        soloed: false,
      };

      this.updateState({
        tracks: [...this.state.tracks, track],
      });

      return id;
    },

    deleteTrack: (trackId: string): void => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) return;

      // Clean up all patterns in the track
      track.patterns.forEach((pattern) => {
        this.actions.removePattern(trackId, pattern.id);
      });

      this.updateState({
        tracks: this.state.tracks.filter((t) => t.id !== trackId),
      });

      this.updateLength();
    },

    updateTrack: (
      trackId: string,
      updates: Partial<PlaylistTrackState>,
    ): void => {
      this.updateState({
        tracks: this.state.tracks.map((track) =>
          track.id === trackId ? { ...track, ...updates } : track,
        ),
      });
    },

    reorderTracks: (trackIds: string[]): void => {
      const orderedTracks = trackIds
        .map((id) => this.state.tracks.find((t) => t.id === id))
        .filter((track): track is PlaylistTrackState => track !== undefined);

      this.updateState({
        tracks: orderedTracks,
      });
    },

    // Pattern Management
    addPattern: (
      trackId: string,
      pattern: Pattern,
      startTime: Time,
    ): string => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) throw new Error(`Track ${trackId} not found`);

      // Validate pattern placement
      if (!this.validatePatternPlacement(track, startTime, pattern.length)) {
        throw new Error("Pattern placement overlaps with existing patterns");
      }

      const placement: PatternPlacement = {
        id: `placement_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        patternId: pattern.id,
        startTime,
        duration: pattern.length,
        offset: "0",
      };

      this.updateState({
        tracks: this.state.tracks.map((t) =>
          t.id === trackId ? { ...t, patterns: [...t.patterns, placement] } : t,
        ),
      });

      this.updateLength();
      return placement.id;
    },

    removePattern: (trackId: string, placementId: string): void => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) return;

      // Clean up any scheduled parts
      this.cleanupPatternPart(placementId);

      this.updateState({
        tracks: this.state.tracks.map((t) =>
          t.id === trackId
            ? { ...t, patterns: t.patterns.filter((p) => p.id !== placementId) }
            : t,
        ),
      });

      this.updateLength();
    },

    movePattern: (
      placementId: string,
      trackId: string,
      startTime: Time,
    ): void => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) return;

      const placementIndex = track.patterns.findIndex(
        (p) => p.id === placementId,
      );
      if (placementIndex === -1) return;

      const placement = track.patterns[placementIndex];

      // Validate new position
      if (
        !this.validatePatternPlacement(
          track,
          startTime,
          placement.duration,
          placementId,
        )
      ) {
        throw new Error("Pattern placement overlaps with existing patterns");
      }

      this.updateState({
        tracks: this.state.tracks.map((t) =>
          t.id === trackId
            ? {
                ...t,
                patterns: t.patterns.map((p) =>
                  p.id === placementId ? { ...p, startTime } : p,
                ),
              }
            : t,
        ),
      });

      // Reschedule if playing
      if (transportManager.getState().isPlaying) {
        this.cleanupPatternPart(placementId);
        this.schedulePattern(track, { ...placement, startTime });
      }

      this.updateLength();
    },

    duplicatePattern: (placementId: string): string => {
      const sourceTrack = this.state.tracks.find((t) =>
        t.patterns.some((p) => p.id === placementId),
      );
      if (!sourceTrack) throw new Error("Pattern placement not found");

      const sourcePlacement = sourceTrack.patterns.find(
        (p) => p.id === placementId,
      );
      if (!sourcePlacement) throw new Error("Pattern placement not found");

      const pattern = patternManager.actions.getPattern(
        sourcePlacement.patternId,
      );
      if (!pattern) throw new Error("Pattern not found");

      // Create new placement after the source
      const newStartTime =
        Tone.Time(sourcePlacement.startTime).toSeconds() +
        Tone.Time(sourcePlacement.duration).toSeconds();

      return this.actions.addPattern(sourceTrack.id, pattern, newStartTime);
    },

    // Playback Control
    setTrackMute: (trackId: string, muted: boolean): void => {
      this.updateState({
        tracks: this.state.tracks.map((track) =>
          track.id === trackId ? { ...track, muted } : track,
        ),
      });

      // Update scheduled parts if playing
      if (transportManager.getState().isPlaying) {
        const track = this.state.tracks.find((t) => t.id === trackId);
        if (track) {
          track.patterns.forEach((placement) => {
            const part = this.patternParts.get(placement.id);
            if (part) {
              part.mute = muted;
            }
          });
        }
      }
    },

    setTrackSolo: (trackId: string, soloed: boolean): void => {
      this.updateState({
        tracks: this.state.tracks.map((track) =>
          track.id === trackId ? { ...track, soloed } : track,
        ),
      });

      this.updateSoloStates();
    },

    // Query Methods
    getPatternAt: (time: Time): Pattern[] => {
      const placements = this.getPatternsBetween(time, time);
      return placements
        .map((placement) =>
          patternManager.actions.getPattern(placement.patternId),
        )
        .filter((pattern): pattern is Pattern => pattern !== undefined);
    },

    getPatternsBetween: (
      startTime: Time,
      endTime: Time,
    ): PatternPlacement[] => {
      return this.getPatternsBetween(startTime, endTime);
    },

    getLength: (): Time => {
      return this.state.length;
    },

    // Cleanup
    dispose: (): void => {
      this.stopPlaylistPlayback();
      this.updateState({
        tracks: [],
        length: "0",
      });
      this.patternParts.clear();
    },
  };

  private updateLength(): void {
    if (this.state.tracks.length === 0) {
      this.updateState({ length: "0" });
      return;
    }

    const lastEnd = Math.max(
      ...this.state.tracks.flatMap((track) =>
        track.patterns.map(
          (placement) =>
            Tone.Time(placement.startTime).toSeconds() +
            Tone.Time(placement.duration).toSeconds(),
        ),
      ),
    );

    this.updateState({
      length: Tone.Time(lastEnd).toBarsBeatsSixteenths(),
    });
  }

  private updateSoloStates(): void {
    const hasSoloedTracks = this.state.tracks.some((t) => t.soloed);

    if (transportManager.getState().isPlaying) {
      this.state.tracks.forEach((track) => {
        track.patterns.forEach((placement) => {
          const part = this.patternParts.get(placement.id);
          if (part) {
            part.mute = track.muted || (hasSoloedTracks && !track.soloed);
          }
        });
      });
    }
  }

  private getPatternsBetween(
    startTime: Time,
    endTime: Time,
  ): PatternPlacement[] {
    const start = Tone.Time(startTime).toSeconds();
    const end = Tone.Time(endTime).toSeconds();

    return this.state.tracks.flatMap((track) =>
      track.patterns.filter((placement) => {
        const placementStart = Tone.Time(placement.startTime).toSeconds();
        const placementEnd =
          placementStart + Tone.Time(placement.duration).toSeconds();
        return (
          (placementStart >= start && placementStart < end) ||
          (placementEnd > start && placementEnd <= end) ||
          (placementStart <= start && placementEnd >= end)
        );
      }),
    );
  }

  private validatePatternPlacement(
    track: PlaylistTrackState,
    startTime: Time,
    duration: Time,
    excludePlacementId?: string,
  ): boolean {
    const start = Tone.Time(startTime).toSeconds();
    const end = start + Tone.Time(duration).toSeconds();

    return !track.patterns.some((placement) => {
      if (excludePlacementId && placement.id === excludePlacementId)
        return false;

      const placementStart = Tone.Time(placement.startTime).toSeconds();
      const placementEnd =
        placementStart + Tone.Time(placement.duration).toSeconds();

      return start < placementEnd && end > placementStart;
    });
  }

  private startPlaylistPlayback(): void {
    this.stopPlaylistPlayback(); // Clean up any existing playback

    // Schedule initial segment
    const currentTime = Tone.getTransport().seconds;
    this.schedulePatternSegment(
      currentTime,
      currentTime + Tone.Time("2m").toSeconds(),
    );

    // Set up lookahead scheduler
    const scheduleId = Tone.getTransport().scheduleRepeat((time) => {
      this.schedulePatternSegment(time, time + Tone.Time("2m").toSeconds());
    }, "1m");

    this.scheduledEvents.add(scheduleId);
  }

  private stopPlaylistPlayback(): void {
    // Clear scheduled events
    this.scheduledEvents.forEach((id) => {
      Tone.getTransport().clear(id);
    });
    this.scheduledEvents.clear();

    // Dispose of pattern parts
    this.patternParts.forEach((part) => {
      part.dispose();
    });
    this.patternParts.clear();
  }

  private schedulePatternSegment(startTime: number, endTime: number): void {
    const patternsInRange = this.getPatternsBetween(
      Tone.Time(startTime).toBarsBeatsSixteenths(),
      Tone.Time(endTime).toBarsBeatsSixteenths(),
    );

    patternsInRange.forEach((placement) => {
      const track = this.state.tracks.find((t) =>
        t.patterns.some((p) => p.id === placement.id),
      );
      if (!track) return;

      this.schedulePattern(track, placement);
    });
  }

  private schedulePattern(
    track: PlaylistTrackState,
    placement: PatternPlacement,
  ): void {
    const pattern = patternManager.actions.getPattern(placement.patternId);
    if (!pattern) return;

    // Create and configure pattern part
    const part = new Tone.Part((time, event) => {
      const patternTrack = pattern.tracks.find((t) => t.id === event.trackId);
      if (!patternTrack) return;

      if (patternTrack.instrument) {
        patternTrack.instrument.triggerAttackRelease(
          event.note,
          event.duration ?? "8n",
          time,
          event.velocity ?? 1,
        );
      }
    }, this.flattenPatternEvents(pattern));

    part.start(placement.startTime);
    part.stop(
      Tone.Time(placement.startTime).toSeconds() +
        Tone.Time(placement.duration).toSeconds(),
    );
    part.mute = track.muted || (this.hasSoloedTracks() && !track.soloed);

    // Store for cleanup
    this.patternParts.set(placement.id, part);
  }

  private flattenPatternEvents(pattern: Pattern): Array<any> {
    return pattern.tracks.flatMap((track) =>
      track.events.map((event) => ({
        ...event,
        trackId: track.id,
      })),
    );
  }

  private cleanupPatternPart(placementId: string): void {
    const part = this.patternParts.get(placementId);
    if (part) {
      part.dispose();
      this.patternParts.delete(placementId);
    }
  }

  private hasSoloedTracks(): boolean {
    return this.state.tracks.some((t) => t.soloed);
  }

  public toJSON(): PlaylistState {
    return { ...this.state };
  }

  public fromJSON(state: PlaylistState): void {
    this.actions.dispose();
    this.updateState(state);
  }
}
