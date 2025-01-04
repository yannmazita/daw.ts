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
import { ToneWithBypass } from "@/core/types/audio";

export const createMixerTrackNodes = () => {
  const input = new Tone.Gain();
  const channel = new Tone.Channel();
  const meter = new Tone.Meter();

  return { input, channel, meter };
};

export const createEffectNode = (
  type: EffectName,
  options?: EffectOptions,
): ToneWithBypass => {
  const defaultOptions = { wet: 1, ...options };
  let node: Tone.ToneAudioNode;
  switch (type) {
    case EffectName.AutoFilter:
      node = new Tone.AutoFilter(defaultOptions as Tone.AutoFilterOptions);
      break;
    case EffectName.AutoPanner:
      node = new Tone.AutoPanner(defaultOptions as Tone.AutoPannerOptions);
      break;
    case EffectName.AutoWah:
      node = new Tone.AutoWah(defaultOptions as Tone.AutoWahOptions);
      break;
    case EffectName.BitCrusher:
      node = new Tone.BitCrusher(defaultOptions as Tone.BitCrusherOptions);
      break;
    case EffectName.Chebyshev:
      node = new Tone.Chebyshev(defaultOptions as Tone.ChebyshevOptions);
      break;
    case EffectName.Chorus:
      node = new Tone.Chorus(defaultOptions as Tone.ChorusOptions);
      break;
    case EffectName.Distortion:
      node = new Tone.Distortion(defaultOptions as Tone.DistortionOptions);
      break;
    case EffectName.FeedbackDelay:
      node = new Tone.FeedbackDelay(defaultOptions as FeedbackDelayOptions);
      break;
    case EffectName.Freeverb:
      node = new Tone.Freeverb(defaultOptions as Tone.FreeverbOptions);
      break;
    case EffectName.FrequencyShifter:
      node = new Tone.FrequencyShifter(
        defaultOptions as FrequencyShifterOptions,
      );
      break;
    case EffectName.JCReverb:
      node = new Tone.JCReverb(defaultOptions as Tone.JCReverbOptions);
      break;
    case EffectName.Phaser:
      node = new Tone.Phaser(defaultOptions as Tone.PhaserOptions);
      break;
    case EffectName.PingPongDelay:
      node = new Tone.PingPongDelay(
        defaultOptions as Tone.PingPongDelayOptions,
      );
      break;
    case EffectName.PitchShift:
      node = new Tone.PitchShift(defaultOptions as Tone.PitchShiftOptions);
      break;
    case EffectName.Reverb:
      node = new Tone.Reverb(defaultOptions as ReverbOptions);
      break;
    case EffectName.StereoWidener:
      node = new Tone.StereoWidener(
        defaultOptions as Tone.StereoWidenerOptions,
      );
      break;
    case EffectName.Tremolo:
      node = new Tone.Tremolo(defaultOptions as Tone.TremoloOptions);
      break;
    default:
      throw new Error("Unknown effect type");
  }

  (node as ToneWithBypass).bypass = (bypass: boolean) => {
    (node as any).wet.value = bypass ? 0 : 1;
  };

  return node as ToneWithBypass;
};

export const createProcessorNode = (
  type: ProcessorName,
  options?: ProcessorOptions,
): ToneWithBypass => {
  let node: Tone.ToneAudioNode;
  const defaultOptions = { ...options };
  switch (type) {
    case ProcessorName.EQ3:
      node = new Tone.EQ3(defaultOptions as EQ3Options);
      break;
    case ProcessorName.Compressor:
      node = new Tone.Compressor(defaultOptions as Tone.CompressorOptions);
      break;
    case ProcessorName.Gate:
      node = new Tone.Gate(defaultOptions as Tone.GateOptions);
      break;
    default:
      throw new Error("Unknown processor type");
  }
  (node as ToneWithBypass).bypass = (bypass: boolean) => {
    (node as any).gain.value = bypass ? -Infinity : 0;
  };

  return node as ToneWithBypass;
};

export const createInstrumentNode = (
  type: InstrumentName,
  options?: InstrumentOptions,
): ToneWithBypass => {
  let node: Tone.ToneAudioNode;
  switch (type) {
    case InstrumentName.Synth:
      node = new Tone.Synth(options as Tone.SynthOptions);
      break;
    case InstrumentName.AMSynth:
      node = new Tone.AMSynth(options as Tone.AMSynthOptions);
      break;
    case InstrumentName.DuoSynth:
      node = new Tone.DuoSynth(options as Tone.DuoSynthOptions);
      break;
    case InstrumentName.FMSynth:
      node = new Tone.FMSynth(options as Tone.FMSynthOptions);
      break;
    case InstrumentName.MembraneSynth:
      node = new Tone.MembraneSynth(options as Tone.MembraneSynthOptions);
      break;
    case InstrumentName.MetalSynth:
      node = new Tone.MetalSynth(options as Tone.MetalSynthOptions);
      break;
    case InstrumentName.MonoSynth:
      node = new Tone.MonoSynth(options as Tone.MonoSynthOptions);
      break;
    case InstrumentName.NoiseSynth:
      node = new Tone.NoiseSynth(options as Tone.NoiseSynthOptions);
      break;
    case InstrumentName.Sampler:
      node = new Tone.Sampler(options as Tone.SamplerOptions);
      break;
    default:
      throw new Error("Unknown instrument type");
  }
  (node as ToneWithBypass).bypass = (bypass: boolean) => {
    (node as any).volume.value = bypass ? -Infinity : 0;
  };

  return node as ToneWithBypass;
};

export const createDeviceNode = (
  type: DeviceType,
  options?: EffectOptions | ProcessorOptions | InstrumentOptions,
): ToneWithBypass => {
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
