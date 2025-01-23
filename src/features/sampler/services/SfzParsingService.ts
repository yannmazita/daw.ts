// src/features/sampler/services/SfzParsingService.ts
/*
This file includes code released under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
See: https://github.com/sfzlab/sfz-web-player
As part of this project, this code is distributed under the terms of the GNU General Public License version 3.
*/
import { FileLocal, FileRemote } from "../types/files";
import { FileLoaderService } from "./FileLoaderService";
import { parseHeaders, parseSfz } from "@sfz-tools/core/dist/parse";
import { ParseHeader, ParseOpcodeObj } from "@sfz-tools/core/dist/types/parse";
import { midiNameToNum, pathGetDirectory } from "@sfz-tools/core/dist/utils";
import { DEFAULT_REGION_DEFAULTS } from "../utils/regionDefaults";
import { RegionDefaults } from "../types";

export class SfzParsingService {
  loader: FileLoaderService;
  private regionDefaults: RegionDefaults;

  constructor(
    loader: FileLoaderService,
    regionDefaults: RegionDefaults = DEFAULT_REGION_DEFAULTS,
  ) {
    this.loader = loader;
    this.regionDefaults = regionDefaults;
  }

  async parse(
    file: FileLocal | FileRemote | undefined,
  ): Promise<ParseOpcodeObj[]> {
    if (!file) return [];

    try {
      const prefix: string = pathGetDirectory(file.path);
      let headers: ParseHeader[] = [];
      if (file.ext === "sfz") {
        headers = await parseSfz(file?.contents, prefix);
      } else if (file.ext === "json") {
        headers = JSON.parse(file?.contents).elements;
      }

      let regions: ParseOpcodeObj[] = parseHeaders(headers, prefix);
      regions = this.midiNamesToNum(regions);
      return regions;
    } catch (error: any) {
      console.error("Error parsing SFZ file:", file?.path, error);
      throw new Error(`Error parsing SFZ file: ${file?.path} ${error.message}`);
    }
  }

  midiNameToNumConvert(val: string | number) {
    if (typeof val === "number") return val;
    const isLetters = /[a-zA-Z]/g;
    if (isLetters.test(val)) return midiNameToNum(val);
    return parseInt(val, 10);
  }

  midiNamesToNum(regions: ParseOpcodeObj[]) {
    for (const region of regions) {
      if (region.lokey) region.lokey = this.midiNameToNumConvert(region.lokey);
      if (region.hikey) region.hikey = this.midiNameToNumConvert(region.hikey);
      if (region.key) region.key = this.midiNameToNumConvert(region.key);
      if (region.pitch_keycenter)
        region.pitch_keycenter = this.midiNameToNumConvert(
          region.pitch_keycenter,
        );
    }
    return regions;
  }

  updateKeyboardMap(
    region: ParseOpcodeObj,
    keyboardMap: Record<number, boolean>,
  ) {
    if (!region.lokey && region.key) region.lokey = region.key;
    if (!region.hikey && region.key) region.hikey = region.key;
    const merged = Object.assign({}, this.regionDefaults, region);
    for (let i = merged.lokey; i <= merged.hikey; i += 1) {
      keyboardMap[i] = true;
    }
  }
}
