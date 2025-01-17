// src/features/sampler/utils/fileLoader.ts
/*
This file includes code released under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
See: https://github.com/sfzlab/sfz-web-player
As part of this project, this code is distributed under the terms of the GNU General Public License version 3.
*/
export interface FileWithHandle extends File {
  webkitRelativePath: string;
  handle?: File;
}

export interface FileLocal {
  ext: string;
  contents: any;
  path: string;
  handle?: FileWithHandle;
}

export interface FileRemote {
  ext: string;
  contents: any;
  path: string;
}

export type FilesMap = Record<string, FileLocal | FileRemote>;

export interface FilesTree {
  [key: string]: FilesTree;
}
