// src/features/sampler/services/SfzPlayerService.ts
import { parseSfz, parseHeaders } from "@sfz-tools/core/dist/parse";
import { midiNameToNum, pathGetDirectory } from "@sfz-tools/core/dist/utils";
import {
  SfzOptions,
  PreloadMode,
  SfzControlEvent,
  SfzRegion,
  RegionDefaults,
} from "../types";
import { FileLoaderService } from "./FileLoaderService";
import { ParseOpcodeObj } from "@sfz-tools/core/dist/types/parse";

export class SfzPlayerService {
  private regions: SfzRegion[] = [];
  private options: SfzOptions;
  private bend = 0; // todo: Implement bend control
  private chanaft = 64; // todo: Implement chanaft control
  private polyaft = 64; // todo: Implement polyaft control
  private bpm = 120; // todo: Implement bpm control
  private regionDefaults: RegionDefaults = {
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

  constructor(
    private audioContext: AudioContext,
    private fileLoader: FileLoaderService,
    options: SfzOptions = {},
  ) {
    this.options = {
      preload: PreloadMode.ON_DEMAND,
      ...options,
    };

    if (options.root) {
      this.fileLoader.setRoot(options.root);
    }
  }

  private midiNameToNumConvert(val: string | number) {
    if (typeof val === "number") return val;
    const isLetters = /[a-zA-Z]/g;
    if (isLetters.test(val)) return midiNameToNum(val);
    return parseInt(val, 10);
  }

  /**
   * Convert MIDI note names to numbers in the regions
   * @param regions - Regions to convert
   * @returns Converted regions
   * */
  private midiNamesToNum(regions: ParseOpcodeObj[]): ParseOpcodeObj[] {
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

  /**
   * Load an SFZ file and parse it
   * @param path - Path to the SFZ file
   * @returns True if successful, false otherwise
   * */
  async loadSfz(path: string) {
    try {
      // Load and parse SFZ file
      const sfzContent = await this.fileLoader.loadTextFile(path);
      const prefix = pathGetDirectory(path);
      const headers = await parseSfz(sfzContent, prefix);
      this.regions = this.midiNamesToNum(parseHeaders(headers, prefix));

      // Preload samples if needed
      if (this.options.preload === PreloadMode.SEQUENTIAL) {
        await this.preloadSamples();
      }

      return true;
    } catch (error) {
      console.error("Error loading SFZ:", error);
      return false;
    }
  }

  private async preloadSamples() {
    for (const region of this.regions) {
      if (region.sample) {
        await this.fileLoader.loadAudioFile(region.sample);
      }
    }
  }

  /**
   * Play a note based on the control event
   * @param event - Control event to play
   * */
  async playNote(event: SfzControlEvent) {
    if (event.velocity === 0) return;

    // Find matching regions
    const matchingRegions = this.regions.filter((region) =>
      this.isRegionMatch(region, event),
    );

    if (matchingRegions.length === 0) return;

    // Pick a random region if multiple match
    const region =
      matchingRegions[Math.floor(Math.random() * matchingRegions.length)];

    try {
      // Load audio if needed
      const audioBuffer = await this.fileLoader.loadAudioFile(region.sample!);

      // Create and configure source
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Apply pitch adjustment
      if (region.pitch_keycenter !== undefined) {
        const semitones = event.note - region.pitch_keycenter;
        source.detune.value = semitones * 100; // 100 cents per semitone
      }

      // Apply volume/pan
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.calculateGain(region);

      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Play with offset if specified
      const startTime = this.audioContext.currentTime;
      const offset = region.offset ? region.offset / 44100 : 0;
      const duration = region.end
        ? (region.end - (region.offset ?? 0)) / 44100
        : undefined;

      source.start(startTime, offset, duration);
    } catch (error) {
      console.error("Error playing note:", error);
    }
  }

  /**
   * Check if a region matches the control event
   * @param region - Region to check
   * @param event - Control event to match
   * @returns True if the region matches the event
   * */
  private isRegionMatch(region: SfzRegion, event: SfzControlEvent): boolean {
    const rand = Math.random();
    return (
      region.sample != null &&
      (region.lochan === undefined || event.channel >= region.lochan) &&
      (region.hichan === undefined || event.channel <= region.hichan) &&
      (region.lokey === undefined || event.note >= region.lokey) &&
      (region.hikey === undefined || event.note <= region.hikey) &&
      (region.lovel === undefined || event.velocity >= region.lovel) &&
      (region.hivel === undefined || event.velocity <= region.hivel) &&
      (region.lobend === undefined || this.bend >= region.lobend) &&
      (region.hibend === undefined || this.bend <= region.hibend) &&
      (region.lochanaft === undefined || this.chanaft >= region.lochanaft) &&
      (region.hichanaft === undefined || this.chanaft <= region.hichanaft) &&
      (region.lopolyaft === undefined || this.polyaft >= region.lopolyaft) &&
      (region.hipolyaft === undefined || this.polyaft <= region.hipolyaft) &&
      (region.lorand === undefined || rand >= region.lorand) &&
      (region.hirand === undefined || rand <= region.hirand) &&
      (region.lobpm === undefined || this.bpm >= region.lobpm) &&
      (region.hibpm === undefined || this.bpm <= region.hibpm)
    );
  }

  /**
   * Calculate the gain for a region
   * @param region - Region to calculate gain for
   * @returns Calculated gain
   * */
  private calculateGain(region: SfzRegion): number {
    let gain = 1;
    if (region.volume) {
      gain *= Math.pow(10, region.volume / 20); // Convert dB to linear
    }
    return gain;
  }

  dispose() {
    this.fileLoader.clearCache();
    this.regions = [];
  }
}
