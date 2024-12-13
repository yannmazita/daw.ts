// src/features/playlists/slices/usePlaylistSlice.ts

import { StateCreator } from "zustand";
import {
  PlaylistState,
  PlaylistActions,
  PlaylistTrack,
} from "@/core/interfaces/playlist";
import { Pattern } from "@/core/interfaces/pattern/index";
import { playlistManager } from "@/features/playlists/services/playlistManagerInstance";
import { Time } from "tone/build/esm/core/type/Units";

export interface PlaylistSlice extends PlaylistState, PlaylistActions {}

export const createPlaylistSlice: StateCreator<
  PlaylistSlice,
  [],
  [],
  PlaylistSlice
> = () => {
  return {
    // Initial state from playlist manager
    ...playlistManager.state,

    // Track Management
    createPlaylistTrack: (name: string): string => {
      try {
        return playlistManager.actions.createPlaylistTrack(name);
      } catch (error) {
        console.error("Error creating playlist track:", error);
        throw error;
      }
    },

    deletePlaylistTrack: (trackId: string): void => {
      try {
        playlistManager.actions.deletePlaylistTrack(trackId);
      } catch (error) {
        console.error("Error deleting playlist track:", error);
        throw error;
      }
    },

    updatePlaylistTrack: (
      trackId: string,
      updates: Partial<PlaylistTrack>,
    ): void => {
      try {
        playlistManager.actions.updatePlaylistTrack(trackId, updates);
      } catch (error) {
        console.error("Error updating playlist track:", error);
        throw error;
      }
    },

    reorderPlaylistTracks: (trackIds: string[]): void => {
      try {
        playlistManager.actions.reorderPlaylistTracks(trackIds);
      } catch (error) {
        console.error("Error reordering playlist tracks:", error);
        throw error;
      }
    },

    // Pattern Management
    addPlaylistPattern: (
      trackId: string,
      patternId: string,
      startTime: Time,
    ): string => {
      try {
        return playlistManager.actions.addPlaylistPattern(
          trackId,
          patternId,
          startTime,
        );
      } catch (error) {
        console.error("Error adding pattern to playlist:", error);
        throw error;
      }
    },

    removePlaylistPattern: (trackId: string, patternId: string): void => {
      try {
        playlistManager.actions.removePlaylistPattern(trackId, patternId);
      } catch (error) {
        console.error("Error removing pattern from playlist:", error);
        throw error;
      }
    },

    movePattern: (
      trackId: string,
      patternId: string,
      startTime: Time,
    ): void => {
      try {
        playlistManager.actions.movePattern(trackId, patternId, startTime);
      } catch (error) {
        console.error("Error moving pattern:", error);
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
    getPatternAt: (time: Time): Pattern[] => {
      try {
        return playlistManager.actions.getPatternAt(time);
      } catch (error) {
        console.error("Error getting patterns at time:", error);
        return [];
      }
    },

    getPatternsBetween: (startTime: Time, endTime: Time): Pattern[] => {
      try {
        return playlistManager.actions.getPatternsBetween(startTime, endTime);
      } catch (error) {
        console.error("Error getting patterns between times:", error);
        return [];
      }
    },

    getLength: (): Time => {
      try {
        return playlistManager.actions.getLength();
      } catch (error) {
        console.error("Error getting playlist length:", error);
        return "0";
      }
    },

    dispose: () => {
      try {
        playlistManager.dispose();
      } catch (error) {
        console.error("Error disposing playlist manager:", error);
      }
    },
  };
};
