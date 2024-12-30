// src/features/mix/utils/audioNodes.ts
import * as Tone from "tone";
import {
  EffectName,
  EffectOptions,
  EQ3Options,
  FeedbackDelayOptions,
  FrequencyShifterOptions,
  ReverbOptions,
  ToneEffectType,
} from "@/core/types/audio";
import {
  ProcessorName,
  ProcessorOptions,
  ToneProcessorType,
} from "@/core/types/audio";

export const createMixerTrackNodes = () => {
  const input = new Tone.Gain();
  const channel = new Tone.Channel();
  const meter = new Tone.Meter();

  return { input, channel, meter };
};

export const createEffectNode = (
  type: EffectName,
  options?: EffectOptions,
): ToneEffectType => {
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
): ToneProcessorType => {
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
