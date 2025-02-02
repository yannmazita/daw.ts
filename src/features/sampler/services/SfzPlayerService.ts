// src/features/sampler/services/SfzPlayerService.ts
import { parseSfz, parseHeaders } from "@sfz-tools/core/dist/parse";
import { midiNameToNum, pathGetDirectory } from "@sfz-tools/core/dist/utils";
import {
  PreloadMode,
  SfzControlEvent,
  SfzRegion,
  RegionDefaults,
  SamplerState,
} from "../types";
import { FileLoaderService } from "./FileLoaderService";
import { ParseHeader, ParseOpcodeObj } from "@sfz-tools/core/dist/types/parse";
import { TransportEngine } from "@/features/transport/types";

export class SfzPlayerService {
  private regions: SfzRegion[] = [];
  private preloadMode: PreloadMode = PreloadMode.ON_DEMAND;
  private bend = 0; // todo: Implement bend control
  private chanaft = 64; // todo: Implement chanaft control
  private polyaft = 64; // todo: Implement polyaft control
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
    private transport: TransportEngine,
    private outputNode: GainNode,
  ) {}

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
   * Load an SFZ file and parse it.
   * The method expects a directory containing at least one .sfz file
   * to have been loaded using FileLoaderService.loadDirectory
   * @param state: The current sampler state.
   * @param sfzPath - Path to the SFZ file.
   * @returns The updated state.
   * @throws If .sfz not found.
   * */
  async loadSfz(state: SamplerState, sfzPath: string): Promise<SamplerState> {
    const sfzFileFound = state.sfzFilesFound[sfzPath];

    if (!sfzFileFound) {
      throw new Error(`SFZ file not found: ${sfzPath}`);
    }

    try {
      // Load and parse SFZ file
      const sfzContent = await this.fileLoader.loadSfzFile(sfzPath);
      const headers = (await parseSfz(
        sfzContent,
        pathGetDirectory(sfzPath),
      )) as ParseHeader[];
      this.regions = this.midiNamesToNum(
        parseHeaders(headers, pathGetDirectory(sfzPath)),
      );

      // Preload samples if needed
      if (this.preloadMode === PreloadMode.SEQUENTIAL) {
        await this.preloadSamples();
      }

      sfzFileFound.loaded = true;
      sfzFileFound.lastLoaded = Date.now();

      return {
        ...state,
        sfzFilesFound: { ...state.sfzFilesFound, [sfzPath]: sfzFileFound },
      };
    } catch (error) {
      console.warn(`Failed loading SFZ ${sfzPath}`);
      sfzFileFound.error = error.message;

      return {
        ...state,
        sfzFilesFound: { ...state.sfzFilesFound, [sfzPath]: sfzFileFound },
      };
    }
  }

  private async preloadSamples() {
    for (const region of this.regions) {
      if (region.sample) {
        try {
          await this.fileLoader.loadAudioFile(region.sample);
        } catch (error) {
          console.warn(`Error preloading sample: ${region.sample}`);
        }
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
      // Load sample audio file
      const audioBuffer = await this.fileLoader.loadAudioFile(region.sample!);

      // Create and configure source
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Apply pitch adjustment
      if (region.pitch_keycenter !== undefined) {
        const semitones = event.note - region.pitch_keycenter;
        source.detune.value = semitones * 100; // 100 cents per semitone
      }

      // Apply volume
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.calculateGain(region);

      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.outputNode);

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
    const currentBpm = this.transport.getTempo();
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
      (region.lobpm === undefined || currentBpm >= region.lobpm) &&
      (region.hibpm === undefined || currentBpm <= region.hibpm)
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
    // naive, sample might be used by other instance requiring a reload
    for (const region of this.regions) {
      if (region.sample) {
        this.fileLoader.clearRegionCache(region.sample);
      }
    }
    this.regions = [];
  }
}
