// src/features/arrangement/utils/constants.ts
export const GRID_CONSTANTS = {
  MIN_ZOOM: 30,
  MAX_ZOOM: 200,
  DEFAULT_ZOOM: 60,
  TRACK_HEIGHT: 80,
  HEADER_WIDTH: 200,
  RULER_HEIGHT: 30,
  BEAT_SUBDIVISIONS: 4,

  MAJOR_BAR_INTERVAL: 4,
  SUBDIVISION_LEVELS: {
    MAJOR_BAR: { opacity: 0.8, width: 1 },
    BAR: { opacity: 0.5, width: 1 },
    BEAT: { opacity: 0.3, width: 0.5 },
    SUBDIVISION: { opacity: 0.15, width: 0.5 },
  },
  RULER: {
    MAJOR_TICK_HEIGHT: 12,
    BEAT_TICK_HEIGHT: 8,
    SUBDIVISION_TICK_HEIGHT: 4,
    FONT_SIZE: 10,
    FONT_FAMILY: "Inter, system-ui, sans-serif",
  },
};
