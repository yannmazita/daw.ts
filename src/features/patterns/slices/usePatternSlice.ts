// src/features/patterns/slices/usePatternSlice.ts

import { StateCreator } from "zustand";
import {
  PatternState,
  PatternActions,
  Pattern,
  PatternTrackState,
  SequenceEvent,
} from "@/core/interfaces/pattern";
import { InstrumentName, InstrumentOptions } from "@/core/types/instrument";
import { mixerManager } from "@/features/mixer/services/mixerManagerInstance";
import { patternManager } from "@/features/patterns/services/patternManagerInstance";
import { TransportSlice } from "@/common/slices/useTransportSlice";
import { MixerSlice } from "@/features/mixer/slices/useMixerSlice";
import { Time } from "tone/build/esm/core/type/Units";

export interface PatternSlice extends PatternState, PatternActions {}

export const createPatternSlice: StateCreator<
  PatternSlice & TransportSlice & MixerSlice,
  [],
  [],
  PatternSlice
> = (set, get) => {
  return {
    // Initial state from mixer manager
    ...patternManager.state,

    // Pattern Management
    createPattern: (name: string, timeSignature: [number, number]): string => {
      try {
        const id = patternManager.actions.createPattern(name, timeSignature);
        return id;
      } catch (error) {
        console.error("Error creating pattern:", error);
        throw error;
      }
    },

    deletePattern: (id: string): void => {
      try {
        // Get pattern before deletion for cleanup
        const pattern = patternManager.actions.getPattern(id);
        if (!pattern) return;

        // Clean up mixer channels associated with pattern tracks
        pattern.tracks.forEach((track) => {
          if (track.mixerChannelId) {
            mixerManager.actions.removeChannel(track.mixerChannelId);
          }
        });

        // Delete pattern
        patternManager.actions.deletePattern(id);

        // If deleted pattern was current, select another pattern
        if (get().currentPatternId === id) {
          const remainingPatterns = get().patterns;
          const newCurrentId =
            remainingPatterns.length > 0 ? remainingPatterns[0].id : null;
          get().setCurrentPattern(newCurrentId);
        }
      } catch (error) {
        console.error("Error deleting pattern:", error);
        throw error;
      }
    },

    duplicatePattern: (id: string): string => {
      try {
        const newId = patternManager.actions.duplicatePattern(id);

        // Get the new pattern
        const newPattern = patternManager.actions.getPattern(newId);
        if (!newPattern) throw new Error("Failed to get duplicated pattern");

        // Create new mixer channels for the duplicated tracks
        newPattern.tracks.forEach((track) => {
          const newChannelId = mixerManager.actions.createChannel(track.name);
          patternManager.actions.updateTrack(newId, track.id, {
            ...track,
            mixerChannelId: newChannelId,
          });
        });

        return newId;
      } catch (error) {
        console.error("Error duplicating pattern:", error);
        throw error;
      }
    },

    updatePattern: (id: string, updates: Partial<Pattern>): void => {
      try {
        patternManager.actions.updatePattern(id, updates);
      } catch (error) {
        console.error("Error updating pattern:", error);
        throw error;
      }
    },

    // Track Management
    addTrack: (
      patternId: string,
      name: string,
      type: "instrument" | "audio",
      instrumentType?: InstrumentName,
      options?: InstrumentOptions,
    ): string => {
      try {
        // Create mixer channel first
        const channelId = mixerManager.actions.createChannel(name);

        // Create track
        const trackId = patternManager.actions.addTrack(
          patternId,
          name,
          type,
          instrumentType,
          options,
        );

        // Update track with mixer channel
        patternManager.actions.updateTrack(patternId, trackId, {
          mixerChannelId: channelId,
        });

        return trackId;
      } catch (error) {
        console.error("Error adding track:", error);
        throw error;
      }
    },

    removeTrack: (patternId: string, trackId: string): void => {
      try {
        // Get track before removal for cleanup
        const pattern = patternManager.actions.getPattern(patternId);
        const track = pattern?.tracks.find((t) => t.id === trackId);

        if (track?.mixerChannelId) {
          mixerManager.actions.removeChannel(track.mixerChannelId);
        }

        patternManager.actions.removeTrack(patternId, trackId);
      } catch (error) {
        console.error("Error removing track:", error);
        throw error;
      }
    },

    updateTrack: (
      patternId: string,
      trackId: string,
      updates: Partial<PatternTrackState>,
    ): void => {
      try {
        patternManager.actions.updateTrack(patternId, trackId, updates);

        // Sync mixer channel settings if needed
        const pattern = patternManager.actions.getPattern(patternId);
        const track = pattern?.tracks.find((t) => t.id === trackId);

        if (track?.mixerChannelId) {
          if (
            "volume" in updates ||
            "pan" in updates ||
            "muted" in updates ||
            "soloed" in updates
          ) {
            mixerManager.actions.updateChannel(track.mixerChannelId, {
              volume: updates.volume,
              pan: updates.pan,
              mute: updates.muted,
              solo: updates.soloed,
            });
          }
        }
      } catch (error) {
        console.error("Error updating track:", error);
        throw error;
      }
    },

    // Event Management
    addEvent: (
      patternId: string,
      trackId: string,
      event: SequenceEvent,
    ): void => {
      try {
        patternManager.actions.addEvent(patternId, trackId, event);
      } catch (error) {
        console.error("Error adding event:", error);
        throw error;
      }
    },

    removeEvent: (
      patternId: string,
      trackId: string,
      eventId: string,
    ): void => {
      try {
        patternManager.actions.removeEvent(patternId, trackId, eventId);
      } catch (error) {
        console.error("Error removing event:", error);
        throw error;
      }
    },

    updateEvent: (
      patternId: string,
      trackId: string,
      eventId: string,
      updates: Partial<SequenceEvent>,
    ): void => {
      try {
        patternManager.actions.updateEvent(
          patternId,
          trackId,
          eventId,
          updates,
        );
      } catch (error) {
        console.error("Error updating event:", error);
        throw error;
      }
    },

    // Pattern Selection
    setCurrentPattern: (id: string | null): void => {
      try {
        patternManager.actions.setCurrentPattern(id);
      } catch (error) {
        console.error("Error setting current pattern:", error);
        throw error;
      }
    },

    // Session
    setLoop: (id: string, isLoop: boolean, start?: Time, end?: Time): void => {
      try {
        patternManager.actions.setLoop(id, isLoop, start, end);
      } catch (error) {
        console.error("Error setting pattern loop:", error);
        throw error;
      }
    },

    setColor: (id: string, color: string): void => {
      try {
        patternManager.actions.setColor(id, color);
      } catch (error) {
        console.error("Error setting pattern color:", error);
        throw error;
      }
    },

    // Utility Methods
    getPattern: (id: string): Pattern | undefined => {
      return patternManager.actions.getPattern(id);
    },

    getCurrentPattern: (): Pattern | null => {
      return patternManager.actions.getCurrentPattern();
    },

    getPatterns: (): Pattern[] => {
      return patternManager.actions.getPatterns();
    },

    dispose: (): void => {
      try {
        // Clean up all patterns and associated resources
        get().patterns.forEach((pattern) => {
          pattern.tracks.forEach((track) => {
            if (track.mixerChannelId) {
              mixerManager.actions.removeChannel(track.mixerChannelId);
            }
          });
        });

        patternManager.actions.dispose();
      } catch (error) {
        console.error("Error disposing patterns:", error);
        throw error;
      }
    },
  };
};
