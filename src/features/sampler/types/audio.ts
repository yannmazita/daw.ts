// src/features/sampler/types/audio.ts
/*
This file includes code released under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
See: https://github.com/sfzlab/sfz-web-player
As part of this project, this code is distributed under the terms of the GNU General Public License version 3.
*/
export interface AudioControlEvent {
  channel: number;
  note: number;
  velocity: number;
}

export type AudioKeyboardMap = Record<number, boolean>;
