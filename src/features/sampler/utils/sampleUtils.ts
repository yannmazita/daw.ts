// src/features/sampler/utils/sampleUtils.ts
import * as Tone from "tone";
import { SFZRegion } from "../types";

export class SampleUtils {
  private sampleCache = new Map<string, Tone.ToneAudioBuffer>();

  async loadSamples(
    regions: SFZRegion[],
    defaultPath: string | undefined,
    instrumentId: string,
  ): Promise<Record<string, Tone.ToneAudioBuffer>> {
    const loadedSamples: Record<string, Tone.ToneAudioBuffer> = {};
    const loadingPromises: Promise<void>[] = [];

    for (const region of regions) {
      const sampleUrl = defaultPath
        ? `${defaultPath}/${region.sample}`
        : region.sample;

      if (this.sampleCache.has(sampleUrl)) {
        const cachedBuffer = this.sampleCache.get(sampleUrl);
        if (cachedBuffer) {
          loadedSamples[sampleUrl] = cachedBuffer;
          continue;
        } else {
          console.warn(
            `Sample URL ${sampleUrl} was found in the cache but is undefined. Reloading.`,
          );
        }
      }

      const loadPromise = new Promise<void>((resolve, reject) => {
        const buffer = new Tone.ToneAudioBuffer(
          sampleUrl,
          () => {
            this.sampleCache.set(sampleUrl, buffer);
            loadedSamples[sampleUrl] = buffer;
            resolve();
          },
          (error) => {
            console.error(
              `Failed to load sample: ${sampleUrl} for instrument ${instrumentId}`,
              error,
            );
            reject(error);
          },
        );
      });
      loadingPromises.push(loadPromise);
    }

    try {
      await Promise.all(loadingPromises);
      return loadedSamples;
    } catch (error) {
      console.error(
        `Error loading samples for instrument ${instrumentId}`,
        error,
      );
      return {};
    }
  }

  getSample(sampleUrl: string): Tone.ToneAudioBuffer | undefined {
    return this.sampleCache.get(sampleUrl);
  }

  dispose(): void {
    this.sampleCache.forEach((buffer) => {
      buffer.dispose();
    });
    this.sampleCache.clear();
  }
}
