// src/features/playlists/services/PlaylistManager.ts

import * as Tone from "tone";
import {
  Playlist,
  PlaylistState,
  PlaylistActions,
  PlaylistTrack,
  PatternPlacement,
} from "@/core/interfaces/playlist";
import { Pattern } from "@/core/interfaces/pattern/index";
import { transportManager } from "@/common/services/transportManagerInstance";
import { patternManager } from "@/features/patterns/services/patternManagerInstance";
import { ClipState, PlaybackMode } from "@/core/types/common";
import { Time } from "tone/build/esm/core/type/Units";
import { BaseManager } from "@/common/services/BaseManager";

export class PlaylistManager
  extends BaseManager<PlaylistState>
  implements Playlist
{
  private readonly scheduledEvents: Set<number>;
  private readonly patternParts: Map<string, Tone.Part>;
  private readonly clipStateChangeCallbacks: Set<() => void>;

  constructor() {
    super({
      tracks: [],
      length: "0",
      clipStates: {},
    });

    this.scheduledEvents = new Set();
    this.patternParts = new Map();
    this.clipStateChangeCallbacks = new Set();

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

    this.updateState({ length: Tone.Time(lastEnd).toBarsBeatsSixteenths() });
  }

  private handleTransportStop(): void {
    // Reset playing clips to stopped state
    Object.entries(this.state.clipStates).forEach(([trackId, trackStates]) => {
      Object.entries(trackStates).forEach(([slotIndex, state]) => {
        if (state === ClipState.PLAYING || state === ClipState.QUEUED) {
          this.actions.setClipState(
            trackId,
            parseInt(slotIndex),
            ClipState.STOPPED,
          );
        }
      });
    });
  }

  private getInitialClipState(trackId: string, slotIndex: number): ClipState {
    const pattern = this.actions.getPatternAtSlot(trackId, slotIndex);
    return pattern ? ClipState.STOPPED : ClipState.EMPTY;
  }

  public readonly actions: PlaylistActions = {
    createPlaylistTrack: (name: string): string => {
      const track = this.createTrack(name);
      this.updateState({ tracks: [...this.state.tracks, track] });
      return track.id;
    },

    deletePlaylistTrack: (trackId: string): void => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) return;

      track.patterns.forEach((placement) => {
        const part = this.patternParts.get(placement.patternId);
        if (part) {
          part.dispose();
          this.patternParts.delete(placement.patternId);
        }
      });

      this.updateState({
        tracks: this.state.tracks.filter((t) => t.id !== trackId),
      });
      this.updateLength();
    },

    updatePlaylistTrack: (
      trackId: string,
      updates: Partial<PlaylistTrack>,
    ): void => {
      const updatedTracks = this.state.tracks.map((t) =>
        t.id === trackId ? { ...t, ...updates } : t,
      );

      this.updateState({ tracks: updatedTracks });

      if ("mute" in updates || "solo" in updates) {
        this.updatePlaybackState();
      }
    },

    reorderPlaylistTracks: (trackIds: string[]): void => {
      const orderedTracks = trackIds
        .map((id) => this.state.tracks.find((t) => t.id === id))
        .filter((track): track is PlaylistTrack => track !== undefined);

      this.updateState({ tracks: orderedTracks });
    },

    addPlaylistPattern: (
      trackId: string,
      patternId: string,
      slotIndex: string,
    ): string => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) throw new Error("Track not found");

      const pattern = patternManager.actions.getPattern(patternId);
      if (!pattern) throw new Error("Pattern not found");

      // Convert slotIndex to number
      const index = parseInt(slotIndex, 10);
      if (isNaN(index)) throw new Error("Invalid slot index");

      // Check if slot is already occupied
      const existingPattern = track.patterns.find((p) => p.slotIndex === index);
      if (existingPattern) {
        throw new Error("Slot is already occupied");
      }

      // Create pattern placement
      const placement: PatternPlacement = {
        patternId,
        startTime: index.toString(), // Convert index to Time format
        duration: pattern.duration,
        slotIndex: index,
      };

      // Update track patterns
      const updatedTracks = this.state.tracks.map((t) =>
        t.id === trackId ? { ...t, patterns: [...t.patterns, placement] } : t,
      );

      this.updateState({ tracks: updatedTracks });
      this.updateLength();

      if (transportManager.getState().isPlaying) {
        this.schedulePattern(track, placement);
      }

      return patternId;
    },

    removePlaylistPattern: (trackId: string, patternId: string): void => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) return;

      // Find the placement to get the slot index
      const placement = track.patterns.find((p) => p.patternId === patternId);
      if (!placement) return;

      // Clean up clip state
      this.actions.clearClipState(trackId, placement.slotIndex);

      // Remove pattern
      const updatedTracks = this.state.tracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              patterns: t.patterns.filter((p) => p.patternId !== patternId),
            }
          : t,
      );

      this.updateState({ tracks: updatedTracks });
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

      const updatedTracks = this.state.tracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              patterns: t.patterns.map((p) =>
                p.patternId === patternId ? { ...p, startTime } : p,
              ),
            }
          : t,
      );

      this.updateState({ tracks: updatedTracks });
      this.updateLength();

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
      const updatedTracks = this.state.tracks.map((t) =>
        t.id === trackId ? { ...t, mute: muted } : t,
      );

      this.updateState({ tracks: updatedTracks });
      this.updatePlaybackState();
    },

    setTrackSolo: (trackId: string, soloed: boolean): void => {
      const updatedTracks = this.state.tracks.map((t) =>
        t.id === trackId ? { ...t, solo: soloed } : t,
      );

      this.updateState({ tracks: updatedTracks });
      this.updatePlaybackState();
    },

    getClipState: (trackId: string, slotIndex: number): ClipState => {
      return (
        this.state.clipStates[trackId]?.[slotIndex] ??
        this.getInitialClipState(trackId, slotIndex)
      );
    },

    setClipState: (
      trackId: string,
      slotIndex: number,
      state: ClipState,
    ): void => {
      const newClipStates = {
        ...this.state.clipStates,
        [trackId]: {
          ...this.state.clipStates[trackId],
          [slotIndex]: state,
        },
      };

      this.updateState({ clipStates: newClipStates });
    },

    clearClipState: (trackId: string, slotIndex: number): void => {
      if (!this.state.clipStates[trackId]) return;

      const trackStates = { ...this.state.clipStates[trackId] };
      delete trackStates[slotIndex];

      const newClipStates = {
        ...this.state.clipStates,
        [trackId]: trackStates,
      };

      this.updateState({ clipStates: newClipStates });
    },

    getPatternAtSlot: (
      trackId: string,
      slotIndex: number,
    ): Pattern | undefined => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) return undefined;

      const placement = track.patterns.find((p) => p.slotIndex === slotIndex);
      if (!placement) return undefined;

      return patternManager.actions.getPattern(placement.patternId);
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

    // Calculate launch time based on quantization
    const launchTime = Tone.now(); // We'll add quantization later

    // Schedule the pattern
    const part = new Tone.Part(
      (time, event) => {
        if (track.mute || (!track.solo && this.hasSoloedTracks())) return;
        pattern.part?.callback(time, event);
      },
      pattern.tracks.flatMap((t) => t.events),
    );

    part.start(launchTime);
    part.stop(
      Tone.Time(placement.startTime).toSeconds() +
        Tone.Time(placement.duration).toSeconds(),
    );

    // Update clip state
    this.actions.setClipState(track.id, placement.slotIndex, ClipState.PLAYING);

    // Store the part for cleanup
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
    this.updateState({ tracks: [], length: "0", clipStates: {} });
  }
}
