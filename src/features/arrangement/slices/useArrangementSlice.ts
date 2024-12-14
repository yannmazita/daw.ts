// src/features/arrangement/slices/useArrangementSlice.ts
import { StateCreator } from "zustand";
import {
  ArrangementState,
  ArrangementCoordinatorActions,
  TimelineItem,
} from "@/core/interfaces/arrangement/coordinator";
import { arrangementCoordinator } from "../services/arrangementCoordinatorInstance";
import { Time } from "tone/build/esm/core/type/Units";

export interface ArrangementSlice
  extends ArrangementState,
    ArrangementCoordinatorActions {}

export const createArrangementSlice: StateCreator<
  ArrangementSlice,
  [],
  [],
  ArrangementSlice
> = () => {
  return {
    // Initial state from coordinator
    ...arrangementCoordinator.state,

    // Timeline Operations
    setViewport: (
      startTime: Time,
      endTime: Time,
      verticalOffset?: number,
    ): void => {
      try {
        arrangementCoordinator.actions.setViewport(
          startTime,
          endTime,
          verticalOffset,
        );
      } catch (error) {
        console.error("Error setting viewport:", error);
        throw error;
      }
    },

    setZoom: (zoom: number): void => {
      try {
        arrangementCoordinator.actions.setZoom(zoom);
      } catch (error) {
        console.error("Error setting zoom:", error);
        throw error;
      }
    },

    scrollToTime: (time: Time): void => {
      try {
        arrangementCoordinator.actions.scrollToTime(time);
      } catch (error) {
        console.error("Error scrolling to time:", error);
        throw error;
      }
    },

    fitToContent: (): void => {
      try {
        arrangementCoordinator.actions.fitToContent();
      } catch (error) {
        console.error("Error fitting to content:", error);
        throw error;
      }
    },

    // Track Operations
    createTrack: (name: string): string => {
      try {
        return arrangementCoordinator.actions.createTrack(name);
      } catch (error) {
        console.error("Error creating track:", error);
        throw error;
      }
    },

    deleteTrack: (trackId: string): void => {
      try {
        arrangementCoordinator.actions.deleteTrack(trackId);
      } catch (error) {
        console.error("Error deleting track:", error);
        throw error;
      }
    },

    reorderTracks: (trackIds: string[]): void => {
      try {
        arrangementCoordinator.actions.reorderTracks(trackIds);
      } catch (error) {
        console.error("Error reordering tracks:", error);
        throw error;
      }
    },

    // Pattern Operations
    addPattern: (
      trackId: string,
      patternId: string,
      startTime: Time,
    ): string => {
      try {
        return arrangementCoordinator.actions.addPattern(
          trackId,
          patternId,
          startTime,
        );
      } catch (error) {
        console.error("Error adding pattern:", error);
        throw error;
      }
    },

    moveItems: (items: TimelineItem[], deltaTime: Time): void => {
      try {
        arrangementCoordinator.actions.moveItems(items, deltaTime);
      } catch (error) {
        console.error("Error moving items:", error);
        throw error;
      }
    },

    deleteItems: (items: TimelineItem[]): void => {
      try {
        arrangementCoordinator.actions.deleteItems(items);
      } catch (error) {
        console.error("Error deleting items:", error);
        throw error;
      }
    },

    duplicateItems: (items: TimelineItem[]): TimelineItem[] => {
      try {
        return arrangementCoordinator.actions.duplicateItems(items);
      } catch (error) {
        console.error("Error duplicating items:", error);
        throw error;
      }
    },

    splitPatternAtTime: (patternId: string, time: Time): [string, string] => {
      try {
        return arrangementCoordinator.actions.splitPatternAtTime(
          patternId,
          time,
        );
      } catch (error) {
        console.error("Error splitting pattern:", error);
        throw error;
      }
    },

    // Automation Operations
    createAutomationLane: (trackId: string, parameterName: string): string => {
      try {
        return arrangementCoordinator.actions.createAutomationLane(
          trackId,
          parameterName,
        );
      } catch (error) {
        console.error("Error creating automation lane:", error);
        throw error;
      }
    },

    addAutomationPoint: (laneId: string, time: Time, value: number): string => {
      try {
        return arrangementCoordinator.actions.addAutomationPoint(
          laneId,
          time,
          value,
        );
      } catch (error) {
        console.error("Error adding automation point:", error);
        throw error;
      }
    },

    // Marker/Region Operations
    addMarker: (time: Time, name: string): string => {
      try {
        return arrangementCoordinator.actions.addMarker(time, name);
      } catch (error) {
        console.error("Error adding marker:", error);
        throw error;
      }
    },

    addRegion: (startTime: Time, duration: Time, name: string): string => {
      try {
        return arrangementCoordinator.actions.addRegion(
          startTime,
          duration,
          name,
        );
      } catch (error) {
        console.error("Error adding region:", error);
        throw error;
      }
    },

    setLoopRegion: (regionId: string | null): void => {
      try {
        arrangementCoordinator.actions.setLoopRegion(regionId);
      } catch (error) {
        console.error("Error setting loop region:", error);
        throw error;
      }
    },

    // Selection Operations
    selectItems: (items: TimelineItem[]): void => {
      try {
        arrangementCoordinator.actions.selectItems(items);
      } catch (error) {
        console.error("Error selecting items:", error);
        throw error;
      }
    },

    clearSelection: (): void => {
      try {
        arrangementCoordinator.actions.clearSelection();
      } catch (error) {
        console.error("Error clearing selection:", error);
        throw error;
      }
    },

    // Clipboard Operations
    copyItems: (items: TimelineItem[]): void => {
      try {
        arrangementCoordinator.actions.copyItems(items);
      } catch (error) {
        console.error("Error copying items:", error);
        throw error;
      }
    },

    cutItems: (items: TimelineItem[]): void => {
      try {
        arrangementCoordinator.actions.cutItems(items);
      } catch (error) {
        console.error("Error cutting items:", error);
        throw error;
      }
    },

    paste: (time: Time, trackId?: string): TimelineItem[] => {
      try {
        return arrangementCoordinator.actions.paste(time, trackId);
      } catch (error) {
        console.error("Error pasting items:", error);
        throw error;
      }
    },

    // Playback Operations
    startPlayback: async (time?: Time): Promise<void> => {
      try {
        await arrangementCoordinator.actions.startPlayback(time);
      } catch (error) {
        console.error("Error starting playback:", error);
        throw error;
      }
    },

    stopPlayback: (): void => {
      try {
        arrangementCoordinator.actions.stopPlayback();
      } catch (error) {
        console.error("Error stopping playback:", error);
        throw error;
      }
    },
  };
};
