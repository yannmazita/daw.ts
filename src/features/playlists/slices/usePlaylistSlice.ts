// src/features/playlists/slices/usePlaylistSlice.ts

import { StateCreator } from "zustand";
import {
  PlaylistState,
  PlaylistActions,
  PlaylistTrackState,
} from "@/core/interfaces/playlist";
import { playlistManager } from "@/features/playlists/services/playlistManagerInstance";
import { Pattern } from "@/core/interfaces/pattern";
import { Time } from "tone/build/esm/core/type/Units";
import { useEffect } from "react";

export interface PlaylistSlice extends PlaylistState, PlaylistActions {}

export const createPlaylistSlice: StateCreator<
  PlaylistSlice,
  [],
  [],
  PlaylistSlice
> = (set, get) => {
  // Set up subscription to playlist manager state changes
  useEffect(() => {
    const unsubscribe = playlistManager.onStateUpdate((state) => {
      set((prev) => ({
        ...prev,
        tracks: state.tracks,
        length: state.length,
      }));
    });

    return () => unsubscribe();
  }, []);

  return {
    // Initial state from playlist manager
    ...playlistManager.state,

    // Track Management
    createTrack: (name: string): string => {
      try {
        return playlistManager.actions.createTrack(name);
      } catch (error) {
        console.error("Error creating track:", error);
        throw error;
      }
    },

    deleteTrack: (trackId: string): void => {
      try {
        playlistManager.actions.deleteTrack(trackId);
      } catch (error) {
        console.error("Error deleting track:", error);
        throw error;
      }
    },

    updateTrack: (
      trackId: string,
      updates: Partial<PlaylistTrackState>,
    ): void => {
      try {
        playlistManager.actions.updateTrack(trackId, updates);
      } catch (error) {
        console.error("Error updating track:", error);
        throw error;
      }
    },

    reorderTracks: (trackIds: string[]): void => {
      try {
        playlistManager.actions.reorderTracks(trackIds);
      } catch (error) {
        console.error("Error reordering tracks:", error);
        throw error;
      }
    },

    // Pattern Management
    addPattern: (
      trackId: string,
      pattern: Pattern,
      startTime: Time,
    ): string => {
      try {
        return playlistManager.actions.addPattern(trackId, pattern, startTime);
      } catch (error) {
        console.error("Error adding pattern:", error);
        throw error;
      }
    },

    removePattern: (trackId: string, placementId: string): void => {
      try {
        playlistManager.actions.removePattern(trackId, placementId);
      } catch (error) {
        console.error("Error removing pattern:", error);
        throw error;
      }
    },

    movePattern: (
      placementId: string,
      trackId: string,
      startTime: Time,
    ): void => {
      try {
        playlistManager.actions.movePattern(placementId, trackId, startTime);
      } catch (error) {
        console.error("Error moving pattern:", error);
        throw error;
      }
    },

    duplicatePattern: (placementId: string): string => {
      try {
        return playlistManager.actions.duplicatePattern(placementId);
      } catch (error) {
        console.error("Error duplicating pattern:", error);
        throw error;
      }
    },

    // Playback Control
    setTrackMute: (trackId: string, muted: boolean): void => {
      try {
        playlistManager.actions.setTrackMute(trackId, muted);
      } catch (error) {
        console.error("Error setting track mute:", error);
        throw error;
      }
    },

    setTrackSolo: (trackId: string, soloed: boolean): void => {
      try {
        playlistManager.actions.setTrackSolo(trackId, soloed);
      } catch (error) {
        console.error("Error setting track solo:", error);
        throw error;
      }
    },

    // Query Methods
    getPatternAt: (time: Time) => {
      try {
        return playlistManager.actions.getPatternAt(time);
      } catch (error) {
        console.error("Error getting pattern at time:", error);
        throw error;
      }
    },

    getPatternsBetween: (startTime: Time, endTime: Time) => {
      try {
        return playlistManager.actions.getPatternsBetween(startTime, endTime);
      } catch (error) {
        console.error("Error getting patterns between times:", error);
        throw error;
      }
    },

    getLength: () => {
      try {
        return playlistManager.actions.getLength();
      } catch (error) {
        console.error("Error getting length:", error);
        throw error;
      }
    },

    // Cleanup
    dispose: (): void => {
      try {
        playlistManager.actions.dispose();
      } catch (error) {
        console.error("Error disposing playlist:", error);
        throw error;
      }
    },
  };
};
