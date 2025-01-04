// src/common/utils/audioNodes.ts
import * as Tone from "tone";
import {
  EffectName,
  EffectOptions,
  FeedbackDelayOptions,
  FrequencyShifterOptions,
  ReverbOptions,
} from "@/core/types/effect";
import {
  EQ3Options,
  ProcessorName,
  ProcessorOptions,
} from "@/core/types/processor";
import { InstrumentName, InstrumentOptions } from "@/core/types/instrument";
import { DeviceType } from "@/features/mix/types";

export const createMixerTrackNodes = () => {
  const input = new Tone.Gain();
  const channel = new Tone.Channel();
  const meter = new Tone.Meter();

  return { input, channel, meter };
};

export const createEffectNode = (
  type: EffectName,
  options?: EffectOptions,
): Tone.ToneAudioNode => {
  const defaultOptions = { wet: 1, ...options };
  switch (type) {
    case EffectName.AutoFilter:
      return new Tone.AutoFilter(defaultOptions as Tone.AutoFilterOptions);
    case EffectName.AutoPanner:
      return new Tone.AutoPanner(defaultOptions as Tone.AutoPannerOptions);
    case EffectName.AutoWah:
      return new Tone.AutoWah(defaultOptions as Tone.AutoWahOptions);
    case EffectName.BitCrusher:
      return new Tone.BitCrusher(defaultOptions as Tone.BitCrusherOptions);
    case EffectName.Chebyshev:
      return new Tone.Chebyshev(defaultOptions as Tone.ChebyshevOptions);
    case EffectName.Chorus:
      return new Tone.Chorus(defaultOptions as Tone.ChorusOptions);
    case EffectName.Distortion:
      return new Tone.Distortion(defaultOptions as Tone.DistortionOptions);
    case EffectName.FeedbackDelay:
      return new Tone.FeedbackDelay(defaultOptions as FeedbackDelayOptions);
    case EffectName.Freeverb:
      return new Tone.Freeverb(defaultOptions as Tone.FreeverbOptions);
    case EffectName.FrequencyShifter:
      return new Tone.FrequencyShifter(
        defaultOptions as FrequencyShifterOptions,
      );
    case EffectName.JCReverb:
      return new Tone.JCReverb(defaultOptions as Tone.JCReverbOptions);
    case EffectName.Phaser:
      return new Tone.Phaser(defaultOptions as Tone.PhaserOptions);
    case EffectName.PingPongDelay:
      return new Tone.PingPongDelay(
        defaultOptions as Tone.PingPongDelayOptions,
      );
    case EffectName.PitchShift:
      return new Tone.PitchShift(defaultOptions as Tone.PitchShiftOptions);
    case EffectName.Reverb:
      return new Tone.Reverb(defaultOptions as ReverbOptions);
    case EffectName.StereoWidener:
      return new Tone.StereoWidener(
        defaultOptions as Tone.StereoWidenerOptions,
      );
    case EffectName.Tremolo:
      return new Tone.Tremolo(defaultOptions as Tone.TremoloOptions);
    default:
      throw new Error("Unknown effect type");
  }
};

export const createProcessorNode = (
  type: ProcessorName,
  options?: ProcessorOptions,
): Tone.ToneAudioNode => {
  const defaultOptions = { ...options };
  switch (type) {
    case ProcessorName.EQ3:
      return new Tone.EQ3(defaultOptions as EQ3Options);
    case ProcessorName.Compressor:
      return new Tone.Compressor(defaultOptions as Tone.CompressorOptions);
    case ProcessorName.Gate:
      return new Tone.Gate(defaultOptions as Tone.GateOptions);
    default:
      throw new Error("Unknown processor type");
  }
};

export const createInstrumentNode = (
  type: InstrumentName,
  options?: InstrumentOptions,
): Tone.ToneAudioNode => {
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

export const createDeviceNode = (
  type: DeviceType,
  options?: EffectOptions | ProcessorOptions | InstrumentOptions,
): Tone.ToneAudioNode => {
  switch (type) {
    case "effect":
      return createEffectNode(EffectName.AutoFilter, options as EffectOptions); // Default effect
    case "processor":
      return createProcessorNode(
        ProcessorName.Compressor,
        options as ProcessorOptions,
      ); // Default processor
    case "instrument":
      return createInstrumentNode(
        InstrumentName.Synth,
        options as InstrumentOptions,
      ); // Default instrument
    default:
      throw new Error("Unknown device type");
  }
};
