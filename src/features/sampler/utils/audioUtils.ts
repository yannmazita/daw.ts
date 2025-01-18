// src/features/sampler/utils/audioUtils.ts
/*
This file includes code released under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
See: https://github.com/sfzlab/sfz-web-player
As part of this project, this code is distributed under the terms of the GNU General Public License version 3.
*/
import { ParseOpcodeObj } from "@sfz-tools/core/dist/types/parse";
import { AudioControlEvent } from "../types/audio";
import { midiNameToNum } from "@sfz-tools/core/dist/utils";
import { SFZRegion } from "../types";

const regionDefaults = {
  lochan: 0,
  hichan: 15,
  lokey: 0,
  hikey: 127,
  lovel: 0,
  hivel: 127,
  lobend: -8192,
  hibend: 8192,
  lochanaft: 0,
  hichanaft: 127,
  lopolyaft: 0,
  hipolyaft: 127,
  lorand: 0,
  hirand: 1,
  lobpm: 0,
  hibpm: 500,
};

const checkRegion = (
  region: ParseOpcodeObj,
  controlEvent: AudioControlEvent,
  rand: number,
) => {
  return (
    region.sample != null &&
    region.lochan <= controlEvent.channel &&
    region.hichan >= controlEvent.channel &&
    region.lokey <= controlEvent.note &&
    region.hikey >= controlEvent.note &&
    region.lovel <= controlEvent.velocity &&
    region.hivel >= controlEvent.velocity &&
    region.lobend <= 0 && // todo: implement bend
    region.hibend >= 0 && // todo: implement bend
    region.lochanaft <= 64 && // todo: implement chanaft
    region.hichanaft >= 64 && // todo: implement chanaft
    region.lopolyaft <= 64 && // todo: implement polyaft
    region.hipolyaft >= 64 && // todo: implement polyaft
    region.lorand <= rand &&
    region.hirand >= rand &&
    region.lobpm <= 120 && // todo: implement bpm
    region.hibpm >= 120 // todo: implement bpm
  );
};

export const checkRegions = (
  regions: SFZRegion[],
  controlEvent: AudioControlEvent,
): SFZRegion => {
  const random = Math.random();
  return regions.filter((region: ParseOpcodeObj) => {
    if (!region.lokey && region.key) region.lokey = region.key;
    if (!region.hikey && region.key) region.hikey = region.key;
    const merged = Object.assign({}, regionDefaults, region);
    return checkRegion(merged, controlEvent, random);
  });
};

const midiNameToNumConvert = (val: string | number) => {
  if (typeof val === "number") return val;
  const isLetters = /[a-zA-Z]/g;
  if (isLetters.test(val)) return midiNameToNum(val);
  return parseInt(val, 10);
};

export const midiNamesToNum = (regions: SFZRegion[]) => {
  const regionsWithMidi = regions.map((region) => {
    if (region.lokey) region.lokey = midiNameToNumConvert(region.lokey);
    if (region.hikey) region.hikey = midiNameToNumConvert(region.hikey);
    if (region.key) region.key = midiNameToNumConvert(region.key);
    if (region.pitch_keycenter)
      region.pitch_keycenter = midiNameToNumConvert(region.pitch_keycenter);
    return region;
  });
  return regionsWithMidi;
};
