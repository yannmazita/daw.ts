// src/core/types/common.ts

export type Note = string; // e.g., "C4", "A#3"
export type Tick = number;

export enum PlaybackMode {
  PATTERN = "pattern",
  PLAYLIST = "playlist",
  SESSION = "session",
}

export enum SceneState {
  STOPPED = "stopped",
  PLAYING = "playing",
  QUEUED = "queued",
}

export enum ClipState {
  EMPTY = "empty",
  STOPPED = "stopped",
  PLAYING = "playing",
  QUEUED = "queued",
  RECORDING = "recording",
}

export enum LaunchQuantization {
  NONE = "none",
  ONE_BAR = "1n",
  TWO_BARS = "2n",
  FOUR_BARS = "4n",
}

export enum FollowAction {
  NONE = "none",
  STOP = "stop",
  NEXT = "next",
  PREVIOUS = "previous",
  FIRST = "first",
  LAST = "last",
  ANY = "any",
  OTHER = "other",
}
