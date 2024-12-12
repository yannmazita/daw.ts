// src/features/playlists/services/PlaylistManager.ts

import * as Tone from "tone";
import {
  Playlist,
  PlaylistState,
  PlaylistActions,
  PlaylistTrack,
  PatternPlacement,
} from "@/core/interfaces/playlist";
import { Pattern } from "@/core/interfaces/pattern";
import { transportManager } from "@/common/services/transportManagerInstance";
import { patternManager } from "@/features/patterns/services/patternManagerInstance";
import { PlaybackMode } from "@/core/types/common";
import { Time } from "tone/build/esm/core/type/Units";

export class PlaylistManager implements Playlist {
  public readonly state: PlaylistState;
  private readonly scheduledEvents: Set<number>;
  private readonly patternParts: Map<string, Tone.Part>;

  constructor() {
    this.state = {
      tracks: [],
      length: "0",
    };

    this.scheduledEvents = new Set();
    this.patternParts = new Map();

    // Register playlist mode handler
    transportManager.registerModeHandler(
      PlaybackMode.PLAYLIST,
      () => this.startPlaylistPlayback(),
      () => this.stopPlaylistPlayback(),
    );
  }

  private createTrack(name: string): PlaylistTrack {
    return {
      id: `playlist_track_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      patterns: [],
      volume: 0,
      pan: 0,
      mute: false,
      solo: false,
    };
  }

  private validatePatternPlacement(
    track: PlaylistTrack,
    startTime: Time,
    duration: Time,
    excludePatternId?: string,
  ): boolean {
    const start = Tone.Time(startTime).toSeconds();
    const end = start + Tone.Time(duration).toSeconds();

    return !track.patterns.some((placement) => {
      if (excludePatternId && placement.patternId === excludePatternId)
        return false;

      const placementStart = Tone.Time(placement.startTime).toSeconds();
      const placementEnd =
        placementStart + Tone.Time(placement.duration).toSeconds();

      return start < placementEnd && end > placementStart;
    });
  }

  private updateLength(): void {
    if (this.state.tracks.length === 0) {
      this.state.length = "0";
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

    this.state.length = Tone.Time(lastEnd).toBarsBeatsSixteenths();
  }

  public readonly actions: PlaylistActions = {
    createPlaylistTrack: (name: string): string => {
      const track = this.createTrack(name);
      this.state.tracks.push(track);
      return track.id;
    },

    deletePlaylistTrack: (trackId: string): void => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) return;

      // Cleanup pattern parts for this track
      track.patterns.forEach((placement) => {
        const part = this.patternParts.get(placement.patternId);
        if (part) {
          part.dispose();
          this.patternParts.delete(placement.patternId);
        }
      });

      this.state.tracks = this.state.tracks.filter((t) => t.id !== trackId);
      this.updateLength();
    },

    updatePlaylistTrack: (
      trackId: string,
      updates: Partial<PlaylistTrack>,
    ): void => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) return;

      Object.assign(track, updates);

      // Update playback state if needed
      if ("mute" in updates || "solo" in updates) {
        this.updatePlaybackState();
      }
    },

    reorderPlaylistTracks: (trackIds: string[]): void => {
      const orderedTracks = trackIds
        .map((id) => this.state.tracks.find((t) => t.id === id))
        .filter((track): track is PlaylistTrack => track !== undefined);

      this.state.tracks = orderedTracks;
    },

    addPlaylistPattern: (
      trackId: string,
      patternId: string,
      startTime: Time,
    ): string => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) throw new Error("Track not found");

      const pattern = patternManager.actions.getPattern(patternId);
      if (!pattern) throw new Error("Pattern not found");

      if (!this.validatePatternPlacement(track, startTime, pattern.duration)) {
        throw new Error("Pattern placement overlaps with existing patterns");
      }

      const placement: PatternPlacement = {
        patternId,
        startTime,
        duration: pattern.duration,
      };

      track.patterns.push(placement);
      this.updateLength();

      // Schedule if playing
      if (transportManager.getState().isPlaying) {
        this.schedulePattern(track, placement);
      }

      return patternId;
    },

    removePlaylistPattern: (trackId: string, patternId: string): void => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) return;

      // Cleanup pattern part
      const part = this.patternParts.get(patternId);
      if (part) {
        part.dispose();
        this.patternParts.delete(patternId);
      }

      track.patterns = track.patterns.filter((p) => p.patternId !== patternId);
      this.updateLength();
    },

    movePattern: (
      trackId: string,
      patternId: string,
      startTime: Time,
    ): void => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) return;

      const placement = track.patterns.find((p) => p.patternId === patternId);
      if (!placement) return;

      if (
        !this.validatePatternPlacement(
          track,
          startTime,
          placement.duration,
          patternId,
        )
      ) {
        throw new Error("Pattern placement overlaps with existing patterns");
      }

      placement.startTime = startTime;
      this.updateLength();

      // Reschedule if playing
      if (transportManager.getState().isPlaying) {
        const part = this.patternParts.get(patternId);
        if (part) {
          part.dispose();
          this.patternParts.delete(patternId);
        }
        this.schedulePattern(track, placement);
      }
    },

    setTrackMute: (trackId: string, muted: boolean): void => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) return;

      track.mute = muted;
      this.updatePlaybackState();
    },

    setTrackSolo: (trackId: string, soloed: boolean): void => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) return;

      track.solo = soloed;
      this.updatePlaybackState();
    },

    getPatternAt: (time: Time): Pattern[] => {
      return this.actions.getPatternsBetween(time, time);
    },

    getPatternsBetween: (startTime: Time, endTime: Time): Pattern[] => {
      const start = Tone.Time(startTime).toSeconds();
      const end = Tone.Time(endTime).toSeconds();

      const placements = this.state.tracks.flatMap((track) =>
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

      return placements
        .map((placement) =>
          patternManager.actions.getPattern(placement.patternId),
        )
        .filter((pattern): pattern is Pattern => pattern !== undefined);
    },

    getLength: (): Time => {
      return this.state.length;
    },
  };

  private startPlaylistPlayback(): void {
    this.stopPlaylistPlayback();

    this.state.tracks.forEach((track) => {
      track.patterns.forEach((placement) => {
        this.schedulePattern(track, placement);
      });
    });
  }

  private stopPlaylistPlayback(): void {
    this.scheduledEvents.forEach((id) => {
      Tone.getTransport().clear(id);
    });
    this.scheduledEvents.clear();

    this.patternParts.forEach((part) => {
      part.dispose();
    });
    this.patternParts.clear();
  }

  private schedulePattern(
    track: PlaylistTrack,
    placement: PatternPlacement,
  ): void {
    const pattern = patternManager.actions.getPattern(placement.patternId);
    if (!pattern) return;

    const part = new Tone.Part(
      (time, event) => {
        if (track.mute || (!track.solo && this.hasSoloedTracks())) return;

        // Delegate event handling to pattern manager
        pattern.part?.callback(time, event);
      },
      pattern.tracks.flatMap((t) => t.events),
    );

    part.start(placement.startTime);
    part.stop(
      Tone.Time(placement.startTime).toSeconds() +
        Tone.Time(placement.duration).toSeconds(),
    );

    this.patternParts.set(placement.patternId, part);
  }

  private updatePlaybackState(): void {
    if (!transportManager.getState().isPlaying) return;

    this.patternParts.forEach((part, patternId) => {
      const track = this.state.tracks.find((t) =>
        t.patterns.some((p) => p.patternId === patternId),
      );
      if (track) {
        part.mute = track.mute || (!track.solo && this.hasSoloedTracks());
      }
    });
  }

  private hasSoloedTracks(): boolean {
    return this.state.tracks.some((t) => t.solo);
  }

  public dispose(): void {
    this.stopPlaylistPlayback();
    this.state.tracks = [];
    this.state.length = "0";
  }
}
