// src/features/playlists/slices/usePlaylistStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {} from "@redux-devtools/extension";
import { PlaylistState, PlaylistTrack } from "@/core/interfaces/playlist";

export const usePlaylistStore = create<PlaylistState>()(
  devtools(
    (set, get) => ({
      tracks: [],
      patterns: [],
      length: 0,

      // Track Management
      addTrack: (trackData) => {
        const id = `track_${Date.now()}`;
        set((state) => ({
          tracks: [
            ...state.tracks,
            {
              ...trackData,
              id,
            },
          ],
        }));
        return id;
      },

      removeTrack: (id) => {
        set((state) => ({
          tracks: state.tracks.filter((track) => track.id !== id),
          patterns: state.patterns.filter((pattern) => pattern.trackId !== id),
        }));
        get().updateLength();
      },

      updateTrack: (id, updates) => {
        set((state) => ({
          tracks: state.tracks.map((track) =>
            track.id === id ? { ...track, ...updates } : track,
          ),
        }));
      },

      reorderTracks: (trackIds) => {
        set((state) => ({
          tracks: trackIds
            .map((id) => state.tracks.find((track) => track.id === id))
            .filter((track): track is PlaylistTrack => track !== undefined),
        }));
      },

      // Pattern Management
      addPatternInstance: (instanceData) => {
        const id = `pattern_instance_${Date.now()}`;
        set((state) => ({
          patterns: [
            ...state.patterns,
            {
              ...instanceData,
              id,
            },
          ],
        }));
        get().updateLength();
        return id;
      },

      removePatternInstance: (id) => {
        set((state) => ({
          patterns: state.patterns.filter((pattern) => pattern.id !== id),
        }));
        get().updateLength();
      },

      updatePatternInstance: (id, updates) => {
        set((state) => ({
          patterns: state.patterns.map((pattern) =>
            pattern.id === id ? { ...pattern, ...updates } : pattern,
          ),
        }));
        get().updateLength();
      },

      movePatternInstance: (id, trackId, startTime) => {
        set((state) => ({
          patterns: state.patterns.map((pattern) =>
            pattern.id === id ? { ...pattern, trackId, startTime } : pattern,
          ),
        }));
        get().updateLength();
      },

      // Pattern Queries
      getPatternInstancesInTimeRange: (startTime, endTime) => {
        return get().patterns.filter((pattern) => {
          const patternEnd = pattern.startTime + pattern.duration;
          return (
            (pattern.startTime >= startTime && pattern.startTime < endTime) ||
            (patternEnd > startTime && patternEnd <= endTime) ||
            (pattern.startTime <= startTime && patternEnd >= endTime)
          );
        });
      },

      getPatternInstancesForTrack: (trackId) => {
        return get().patterns.filter((pattern) => pattern.trackId === trackId);
      },

      // Playlist Operations
      clearTrack: (trackId) => {
        set((state) => ({
          patterns: state.patterns.filter(
            (pattern) => pattern.trackId !== trackId,
          ),
        }));
        get().updateLength();
      },

      clearAll: () => {
        set({
          patterns: [],
          length: 0,
        });
      },

      duplicatePatternInstance: (id) => {
        const original = get().patterns.find((pattern) => pattern.id === id);
        if (!original) return id;

        const newId = `pattern_instance_${Date.now()}`;
        set((state) => ({
          patterns: [
            ...state.patterns,
            {
              ...original,
              id: newId,
              startTime: original.startTime + original.duration,
            },
          ],
        }));
        get().updateLength();
        return newId;
      },

      // Utility
      hasPatterns: () => {
        return get().patterns.length > 0;
      },

      getLength: () => {
        return get().length;
      },

      updateLength: () => {
        const patterns = get().patterns;
        if (patterns.length === 0) {
          set({ length: 0 });
          return;
        }

        const maxEnd = Math.max(
          ...patterns.map((pattern) => pattern.startTime + pattern.duration),
        );
        set({ length: Math.ceil(maxEnd) });
      },
    }),
    { name: "playlist-storage" },
  ),
);
