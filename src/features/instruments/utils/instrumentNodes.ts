// src/features/instruments/utils/instrumentNodes.ts
import * as Tone from "tone";
import {
  InstrumentName,
  InstrumentOptions,
  ToneInstrumentType,
} from "@/core/types/instrument";

export const createInstrumentNode = (
  type: InstrumentName,
  options?: InstrumentOptions,
): ToneInstrumentType => {
  switch (type) {
    case InstrumentName.Synth:
      return new Tone.Synth(options as Tone.SynthOptions);
    case InstrumentName.AMSynth:
      return new Tone.AMSynth(options as Tone.AMSynthOptions);
    case InstrumentName.DuoSynth:
      return new Tone.DuoSynth(options as Tone.DuoSynthOptions);
    case InstrumentName.FMSynth:
      return new Tone.FMSynth(options as Tone.FMSynthOptions);
    case InstrumentName.MembraneSynth:
      return new Tone.MembraneSynth(options as Tone.MembraneSynthOptions);
    case InstrumentName.MetalSynth:
      return new Tone.MetalSynth(options as Tone.MetalSynthOptions);
    case InstrumentName.MonoSynth:
      return new Tone.MonoSynth(options as Tone.MonoSynthOptions);
    case InstrumentName.NoiseSynth:
      return new Tone.NoiseSynth(options as Tone.NoiseSynthOptions);
    case InstrumentName.Sampler:
      return new Tone.Sampler(options as Tone.SamplerOptions);
    default:
      throw new Error("Unknown instrument type");
  }
};
