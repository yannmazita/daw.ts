// src/features/arrangement/slices/useMarkerSlice.ts
import { StateCreator } from "zustand";
import {
  MarkerManagerState,
  MarkerManagerActions,
  MarkerType,
  MarkerValue,
  TimelineMarker,
  TimelineRegion,
} from "@/core/interfaces/arrangement/markers";
import { markerManager } from "../services/markerManagerInstance";
import { Time } from "tone/build/esm/core/type/Units";

export interface MarkerSlice extends MarkerManagerState, MarkerManagerActions {}

export const createMarkerSlice: StateCreator<
  MarkerSlice,
  [],
  [],
  MarkerSlice
> = () => {
  return {
    // Initial state from session manager
    ...markerManager.state,

    // Marker operations
    addMarker: (
      time: Time,
      type: MarkerType,
      value: MarkerValue,
      color?: string,
    ): string => {
      try {
        return markerManager.actions.addMarker(time, type, value, color);
      } catch (error) {
        console.error("Error adding marker:", error);
        throw error;
      }
    },
    removeMarker: (id: string): void => {
      try {
        markerManager.actions.removeMarker(id);
      } catch (error) {
        console.error("Error removing marker:", error);
        throw error;
      }
    },
    updateMarker: (
      id: string,
      updates: Partial<Omit<TimelineMarker, "id">>,
    ): void => {
      try {
        markerManager.actions.updateMarker(id, updates);
      } catch (error) {
        console.error("Error updating marker:", error);
        throw error;
      }
    },
    moveMarker: (id: string, newTime: Time): void => {
      try {
        markerManager.actions.moveMarker(id, newTime);
      } catch (error) {
        console.error("Error moving marker:", error);
        throw error;
      }
    },
    getMarkersInRange: (startTime: Time, endTime: Time): TimelineMarker[] => {
      try {
        return markerManager.actions.getMarkersInRange(startTime, endTime);
      } catch (error) {
        console.error("Error getting markers in range:", error);
        throw error;
      }
    },

    // Region operations
    addRegion: (
      startTime: Time,
      duration: Time,
      name: string,
      color: string,
      isLoop?: boolean,
    ): string => {
      try {
        return markerManager.actions.addRegion(
          startTime,
          duration,
          name,
          color,
          isLoop,
        );
      } catch (error) {
        console.error("Error adding region:", error);
        throw error;
      }
    },
    removeRegion: (id: string): void => {
      try {
        markerManager.actions.removeRegion(id);
      } catch (error) {
        console.error("Error removing region:", error);
        throw error;
      }
    },
    updateRegion: (
      id: string,
      updates: Partial<Omit<TimelineMarker, "id">>,
    ): void => {
      try {
        markerManager.actions.updateRegion(id, updates);
      } catch (error) {
        console.error("Error updating region:", error);
        throw error;
      }
    },
    moveRegion: (id: string, newStartTime: Time): void => {
      try {
        markerManager.actions.moveRegion(id, newStartTime);
      } catch (error) {
        console.error("Error moving region:", error);
        throw error;
      }
    },
    resizeRegion: (id: string, newDuration: Time): void => {
      try {
        markerManager.actions.resizeRegion(id, newDuration);
      } catch (error) {
        console.error("Error resizing region:", error);
        throw error;
      }
    },
    getRegionsInRange: (startTime: Time, endTime: Time): TimelineRegion[] => {
      try {
        return markerManager.actions.getRegionsInRange(startTime, endTime);
      } catch (error) {
        console.error("Error getting regions in range:", error);
        throw error;
      }
    },

    // Loop region control
    setLoopRegion: (id: string | null): void => {
      try {
        markerManager.actions.setLoopRegion(id);
      } catch (error) {
        console.error("Error setting loop region:", error);
        throw error;
      }
    },
    getActiveLoopRegion: (): TimelineRegion | null => {
      try {
        return markerManager.actions.getActiveLoopRegion();
      } catch (error) {
        console.error("Error getting active loop region:", error);
        throw error;
      }
    },

    // Utility
    getMarkerAtTime: (time: Time, tolerance?: Time): TimelineMarker | null => {
      try {
        return markerManager.actions.getMarkerAtTime(time, tolerance);
      } catch (error) {
        console.error("Error getting marker at time:", error);
        throw error;
      }
    },
    getRegionAtTime: (time: Time): TimelineRegion[] => {
      try {
        return markerManager.actions.getRegionAtTime(time);
      } catch (error) {
        console.error("Error getting region at time:", error);
        throw error;
      }
    },
    sortMarkers: (): void => {
      try {
        markerManager.actions.sortMarkers();
      } catch (error) {
        console.error("Error sorting markers:", error);
        throw error;
      }
    },
    validateRegionBoundaries: (region: Partial<TimelineRegion>): boolean => {
      try {
        return markerManager.actions.validateRegionBoundaries(region);
      } catch (error) {
        console.error("Error validating region boundaries:", error);
        throw error;
      }
    },
  };
};
