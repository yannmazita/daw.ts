// src/features/sampler/utils/sfzParser.ts
import { ParsedSFZ, SFZRegion } from "../types";

export class SFZParser {
  private sfzContent: string;

  constructor(sfzContent: string) {
    this.sfzContent = sfzContent;
  }

  parse(): ParsedSFZ {
    const regions: SFZRegion[] = [];
    let defaultPath: string | undefined;

    const lines = this.sfzContent.split(/[\r\n]+/);
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("<global>")) {
        const globalMatch = /default_path=(.*)/.exec(trimmedLine);
        if (globalMatch) {
          defaultPath = globalMatch[1].trim().replace(/"/g, "");
        }
      }
      if (trimmedLine.startsWith("<region>")) {
        const region: SFZRegion = {
          sample: "",
          loKey: 0,
          hiKey: 127,
          loVel: 0,
          hiVel: 127,
          pitchKeycenter: 60,
          loopMode: "no_loop",
          loopStart: 0,
          loopEnd: 0,
        };

        const sampleMatch = /sample=(.*)/.exec(trimmedLine);
        if (sampleMatch) {
          region.sample = sampleMatch[1].trim().replace(/"/g, "");
        }
        const lokeyMatch = /lokey=(\d+)/.exec(trimmedLine);
        if (lokeyMatch) {
          region.loKey = parseInt(lokeyMatch[1], 10);
        }
        const hikeyMatch = /hikey=(\d+)/.exec(trimmedLine);
        if (hikeyMatch) {
          region.hiKey = parseInt(hikeyMatch[1], 10);
        }
        const lovelMatch = /lovel=(\d+)/.exec(trimmedLine);
        if (lovelMatch) {
          region.loVel = parseInt(lovelMatch[1], 10);
        }
        const hivelMatch = /hivel=(\d+)/.exec(trimmedLine);
        if (hivelMatch) {
          region.hiVel = parseInt(hivelMatch[1], 10);
        }
        const pitchKeycenterMatch = /pitch_keycenter=(\d+)/.exec(trimmedLine);
        if (pitchKeycenterMatch) {
          region.pitchKeycenter = parseInt(pitchKeycenterMatch[1], 10);
        }
        const loopModeMatch = /loop_mode=(.*)/.exec(trimmedLine);
        if (loopModeMatch) {
          region.loopMode = loopModeMatch[1].trim().replace(/"/g, "");
        }
        const loopStartMatch = /loop_start=(\d+)/.exec(trimmedLine);
        if (loopStartMatch) {
          region.loopStart = parseInt(loopStartMatch[1], 10);
        }
        const loopEndMatch = /loop_end=(\d+)/.exec(trimmedLine);
        if (loopEndMatch) {
          region.loopEnd = parseInt(loopEndMatch[1], 10);
        }
        regions.push(region);
      }
    }
    return {
      regions,
      global: { defaultPath },
    };
  }
}
