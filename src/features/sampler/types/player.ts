// src/features/sampler/types/player.ts
/*
This file includes code released under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
See: https://github.com/sfzlab/sfz-web-player
As part of this project, this code is distributed under the terms of the GNU General Public License version 3.
*/
import { FileWithDirectoryAndFileHandle } from "browser-fs-access";
import { FileLoader } from "../utils/fileLoader";

interface AudioOptions {
  file?: string | FileWithDirectoryAndFileHandle;
  loader?: FileLoader;
  preload?: AudioPreload;
  root?: string;
}

enum AudioPreload {
  // No preloading, samples is loaded when key is pressed.
  ON_DEMAND = "on-demand",
  // Loop through each key, and preload one sample for each key.
  PROGRESSIVE = "progressive",
  // Loop through order of the file, and preload each sample.
  SEQUENTIAL = "sequential",
}

interface EditorOptions {
  directory?: string[] | FileWithDirectoryAndFileHandle[];
  file?: string | FileWithDirectoryAndFileHandle;
  loader?: FileLoader;
  root?: string;
}

interface HeaderOptions {
  local?: boolean;
  remote?: boolean;
  presets: HeaderPreset[];
}

interface HeaderPreset {
  branch?: string;
  name: string;
  id: string;
  selected?: boolean;
}

interface InterfaceOptions {
  directory?: string[] | FileWithDirectoryAndFileHandle[];
  file?: string | FileWithDirectoryAndFileHandle;
  loader?: FileLoader;
  root?: string;
}

interface PlayerOptions {
  audio?: AudioOptions;
  editor?: EditorOptions;
  header?: HeaderOptions;
  instrument?: HeaderPreset;
  interface?: InterfaceOptions;
}

export {
  AudioOptions,
  AudioPreload,
  EditorOptions,
  HeaderOptions,
  HeaderPreset,
  InterfaceOptions,
  PlayerOptions,
};
