// src/features/mixer/services/EffectManager.ts

import * as Tone from "tone";
import { Effect } from "@/core/types/effect";
import { EffectName } from "@/core/enums/EffectName";

export class EffectManager {
  private effects = new Map<string, Effect>();

  private createEffect(effectName: EffectName): Effect {
    switch (effectName) {
      case EffectName.AutoFilter:
        return new Tone.AutoFilter();
      case EffectName.AutoPanner:
        return new Tone.AutoPanner();
      case EffectName.AutoWah:
        return new Tone.AutoWah();
      case EffectName.BitCrusher:
        return new Tone.BitCrusher();
      case EffectName.Chebyshev:
        return new Tone.Chebyshev();
      case EffectName.Chorus:
        return new Tone.Chorus();
      case EffectName.Distortion:
        return new Tone.Distortion();
      case EffectName.FeedbackDelay:
        return new Tone.FeedbackDelay();
      case EffectName.Freeverb:
        return new Tone.Freeverb();
      case EffectName.FrequencyShifter:
        return new Tone.FrequencyShifter();
      case EffectName.JCReverb:
        return new Tone.JCReverb();
      case EffectName.Phaser:
        return new Tone.Phaser();
      case EffectName.PingPongDelay:
        return new Tone.PingPongDelay();
      case EffectName.PitchShift:
        return new Tone.PitchShift();
      case EffectName.Reverb:
        return new Tone.Reverb();
      case EffectName.StereoWidener:
        return new Tone.StereoWidener();
      case EffectName.Tremolo:
        return new Tone.Tremolo();
      case EffectName.Vibrato:
        // not an error, linting doesn't like constuctor overload in Tone.Vibrato
        return new Tone.Vibrato();
      default:
        throw new Error(`Unknown effect type: ${effectName as string}`);
    }
  }

  addEffect(id: string, effectName: EffectName): Effect {
    this.removeEffect(id);
    const effect = this.createEffect(effectName);
    this.effects.set(id, effect);
    return effect;
  }

  getEffect(id: string): Effect | undefined {
    return this.effects.get(id);
  }

  removeEffect(id: string) {
    const effect = this.effects.get(id);
    if (effect) {
      effect.dispose();
      this.effects.delete(id);
    }
  }

  dispose() {
    this.effects.forEach((effect) => effect.dispose());
    this.effects.clear();
  }

  get count(): number {
    return this.effects.size;
  }

  get activeEffectIds(): string[] {
    return Array.from(this.effects.keys());
  }

  updateEffectParameters(id: string, parameters: Record<string, any>) {
    const effect = this.effects.get(id);
    if (effect) {
      Object.entries(parameters).forEach(([key, value]) => {
        if (key in effect) {
          (effect as any)[key] = value;
        }
      });
    }
  }
}
