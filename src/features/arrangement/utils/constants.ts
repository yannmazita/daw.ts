// src/features/arrangement/utils/constants.ts
export const GRID_CONSTANTS = {
  HEADER_WIDTH: 200,
  RULER_HEIGHT: 32,
  TRACK_HEIGHT: 100,
  FOLDED_HEIGHT: 32,
  MIN_TRACK_HEIGHT: 32,
  MIN_TOTAL_HEIGHT: 100,
  DEFAULT_ZOOM: 100,
  MIN_ZOOM: 25,
  MAX_ZOOM: 500,

  // Grid subdivisions
  MAJOR_BAR_INTERVAL: 4,
  BEAT_SUBDIVISIONS: 4,

  // Ruler settings
  RULER: {
    FONT_SIZE: 10,
    FONT_FAMILY: "Inter, sans-serif",
    MAJOR_TICK_HEIGHT: 12,
    BEAT_TICK_HEIGHT: 8,
    SUBDIVISION_TICK_HEIGHT: 4,
  },

  // Grid line styles
  SUBDIVISION_LEVELS: {
    MAJOR_BAR: { opacity: 0.4, width: 1 },
    BAR: { opacity: 0.3, width: 1 },
    BEAT: { opacity: 0.2, width: 1 },
    SUBDIVISION: { opacity: 0.1, width: 1 },
  },
} as const;
