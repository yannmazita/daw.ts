// src/features/patterns/slices/usePatternSlice.ts

import { StateCreator } from "zustand";
import {
  PatternsState,
  PatternActions,
  Pattern,
  PatternTrack,
  NoteEvent,
  AudioEvent,
} from "@/core/interfaces/pattern/index";
import { InstrumentName, InstrumentOptions } from "@/core/types/instrument";
import { patternManager } from "@/features/patterns/services/patternManagerInstance";

export interface PatternSlice extends PatternsState, PatternActions {}

export const createPatternSlice: StateCreator<
  PatternSlice,
  [],
  [],
  PatternSlice
> = () => {
  return {
    // Initial state from pattern manager
    ...patternManager.state,

    // Pattern Management
    createPattern: (name: string, timeSignature: [number, number]): string => {
      try {
        return patternManager.actions.createPattern(name, timeSignature);
      } catch (error) {
        console.error("Error creating pattern:", error);
        throw error;
      }
    },

    deletePattern: (id: string): void => {
      try {
        patternManager.actions.deletePattern(id);
      } catch (error) {
        console.error("Error deleting pattern:", error);
        throw error;
      }
    },

    duplicatePattern: (id: string): string => {
      try {
        return patternManager.actions.duplicatePattern(id);
      } catch (error) {
        console.error("Error duplicating pattern:", error);
        throw error;
      }
    },

    updatePattern: (
      id: string,
      updates: Partial<Omit<Pattern, "tracks" | "part">>,
    ): void => {
      try {
        patternManager.actions.updatePattern(id, updates);
      } catch (error) {
        console.error("Error updating pattern:", error);
        throw error;
      }
    },

    // Track Management
    createInstrumentTrack: (
      patternId: string,
      name: string,
      instrumentType: InstrumentName,
      options?: InstrumentOptions,
    ): string => {
      try {
        return patternManager.actions.createInstrumentTrack(
          patternId,
          name,
          instrumentType,
          options,
        );
      } catch (error) {
        console.error("Error creating instrument track:", error);
        throw error;
      }
    },

    createAudioTrack: (patternId: string, name: string): string => {
      try {
        return patternManager.actions.createAudioTrack(patternId, name);
      } catch (error) {
        console.error("Error creating audio track:", error);
        throw error;
      }
    },

    removePatternTrack: (patternId: string, trackId: string): void => {
      try {
        patternManager.actions.removePatternTrack(patternId, trackId);
      } catch (error) {
        console.error("Error removing track:", error);
        throw error;
      }
    },

    updatePatternTrack: <T extends PatternTrack>(
      patternId: string,
      trackId: string,
      updates: Partial<T>,
    ): void => {
      try {
        patternManager.actions.updatePatternTrack(patternId, trackId, updates);
      } catch (error) {
        console.error("Error updating track:", error);
        throw error;
      }
    },

    // Event Management
    addNoteEvent: (
      patternId: string,
      trackId: string,
      event: Omit<NoteEvent, "id">,
    ): string => {
      try {
        return patternManager.actions.addNoteEvent(patternId, trackId, event);
      } catch (error) {
        console.error("Error adding note event:", error);
        throw error;
      }
    },

    addAudioEvent: (
      patternId: string,
      trackId: string,
      event: Omit<AudioEvent, "id">,
    ): string => {
      try {
        return patternManager.actions.addAudioEvent(patternId, trackId, event);
      } catch (error) {
        console.error("Error adding audio event:", error);
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

    updateEvent: <T extends NoteEvent | AudioEvent>(
      patternId: string,
      trackId: string,
      eventId: string,
      updates: Partial<Omit<T, "id" | "type">>,
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

    // Scene Management
    assignToScene: (
      patternId: string,
      sceneId: string,
      trackId: string,
      clipSlot: number,
    ): void => {
      try {
        patternManager.actions.assignToScene(
          patternId,
          sceneId,
          trackId,
          clipSlot,
        );
      } catch (error) {
        console.error("Error assigning pattern to scene:", error);
        throw error;
      }
    },

    removeFromScene: (patternId: string): void => {
      try {
        patternManager.actions.removeFromScene(patternId);
      } catch (error) {
        console.error("Error removing pattern from scene:", error);
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

    // Utility Methods
    getPattern: (id: string): Pattern | undefined => {
      try {
        return patternManager.actions.getPattern(id);
      } catch (error) {
        console.error("Error getting pattern:", error);
        throw error;
      }
    },

    getCurrentPattern: (): Pattern | null => {
      try {
        return patternManager.actions.getCurrentPattern();
      } catch (error) {
        console.error("Error getting current pattern:", error);
        return null;
      }
    },

    getPatterns: (): Pattern[] => {
      try {
        return patternManager.actions.getPatterns();
      } catch (error) {
        console.error("Error getting patterns:", error);
        return [];
      }
    },

    getPatternsInScene: (sceneId: string): Pattern[] => {
      try {
        return patternManager.actions.getPatternsInScene(sceneId);
      } catch (error) {
        console.error("Error getting patterns in scene:", error);
        return [];
      }
    },

    dispose: (): void => {
      try {
        patternManager.dispose();
      } catch (error) {
        console.error("Error disposing pattern manager:", error);
        throw error;
      }
    },
  };
};
