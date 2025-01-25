// src/features/clips/ClipMidiService.ts

import { MidiFile } from "midifile-ts";
import { MidiClip } from "../types";
import { MixRoutingService } from "@/features/mix/services/MixRoutingService";

export class ClipMidiService {
  constructor(
    private audioContext: AudioContext,
    private routingService: MixRoutingService,
  ) {}

  /**
   * Creates a new midi clip.
   * The pan node is connected to the output node on clip creation.
   * @param trackId - The id of the track the clip belongs to.
   * @param midiData - The midi data for the clip.
   * @param name - The name of the clip.
   * @returns The created midi clip.
   */
  createMidiClip(trackId: string, midiData: MidiFile, name?: string): MidiClip {
    const inputNode = this.audioContext.createGain();
    const outputNode = this.audioContext.createGain();
    const panNode = this.audioContext.createStereoPanner();

    const clip: MidiClip = {
      id: crypto.randomUUID(),
      name: name ?? "New Midi Clip",
      trackId,
      inputNode,
      outputNode,
      panNode,
      startTime: 0,
      endTime: 0,
      loopEnabled: false,
      loopStart: 0,
      loopEnd: 0,
      midiData,
    };
    this.routingService.connect(clip.panNode, clip.outputNode);
    return clip;
  }
}
