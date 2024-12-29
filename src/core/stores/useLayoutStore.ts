// src/core/stores/useLayoutStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { GRID_CONSTANTS } from "@/features/arrangement/utils/constants";

interface TrackLayout {
  height: number;
  isFolded: boolean;
}

interface GridSettings {
  snapEnabled: boolean;
  snapSubdivision: number;
  showGrid: boolean;
}

interface LayoutState {
  trackLayouts: Record<string, TrackLayout>;
  defaultTrackHeight: number;
  foldedTrackHeight: number;
  gridSettings: GridSettings;
  zoomLevel: number;
  minZoom: number;
  maxZoom: number;
  scrollX: number;
  scrollY: number;

  // Add methods for track layout management
  initializeTrackLayout: (trackId: string) => void;
  setTrackHeight: (trackId: string, height: number) => void;
  setTrackFolded: (trackId: string, isFolded: boolean) => void;
}

const initialGridSettings: GridSettings = {
  snapEnabled: true,
  snapSubdivision: 16,
  showGrid: true,
};

export const useLayoutStore = create<LayoutState>()(
  devtools(
    persist(
      (set) => ({
        trackLayouts: {},
        defaultTrackHeight: GRID_CONSTANTS.TRACK_HEIGHT,
        foldedTrackHeight: GRID_CONSTANTS.FOLDED_HEIGHT,
        gridSettings: initialGridSettings,
        zoomLevel: GRID_CONSTANTS.DEFAULT_ZOOM,
        minZoom: GRID_CONSTANTS.MIN_ZOOM,
        maxZoom: GRID_CONSTANTS.MAX_ZOOM,
        scrollX: 0,
        scrollY: 0,

        initializeTrackLayout: (trackId: string) =>
          set((state) => ({
            trackLayouts: {
              ...state.trackLayouts,
              [trackId]: {
                height: state.defaultTrackHeight,
                isFolded: false,
              },
            },
          })),

        setTrackHeight: (trackId: string, height: number) =>
          set((state) => ({
            trackLayouts: {
              ...state.trackLayouts,
              [trackId]: {
                ...state.trackLayouts[trackId],
                height: Math.max(GRID_CONSTANTS.MIN_TRACK_HEIGHT, height),
              },
            },
          })),

        setTrackFolded: (trackId: string, isFolded: boolean) =>
          set((state) => ({
            trackLayouts: {
              ...state.trackLayouts,
              [trackId]: {
                ...state.trackLayouts[trackId],
                isFolded,
              },
            },
          })),
      }),
      { name: "daw-layout-storage" },
    ),
  ),
);
