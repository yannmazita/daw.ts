// src/features/sampler/utils/regionDefaults.ts
/*
This file includes code released under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
See: https://github.com/sfzlab/sfz-web-player
As part of this project, this code is distributed under the terms of the GNU General Public License version 3.
*/
import { RegionDefaults } from "../types";

export const DEFAULT_REGION_DEFAULTS: RegionDefaults = {
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
