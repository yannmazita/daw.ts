// src/core/types/parameter.ts
import * as Tone from "tone";
import { Time } from "tone/build/esm/core/type/Units";

export interface ParameterConfig {
  name: string;
  defaultValue: number;
  range: [number, number];
  scaling: "linear" | "exponential" | "decibels";
  units?: string;
}

export class ModulableParameter {
  private signal: Tone.Signal;
  private converter?: Tone.WaveShaper;

  constructor(
    private param: Tone.Param,
    private config: ParameterConfig,
  ) {
    // Create the signal with proper range
    this.signal = new Tone.Signal({
      value: config.defaultValue,
      units: "number",
    });

    // Set up scaling if needed
    if (config.scaling === "exponential") {
      this.converter = new Tone.WaveShaper((x) => Math.pow(2, x));
      this.signal.connect(this.converter);
      this.converter.connect(param);
    } else if (config.scaling === "decibels") {
      this.converter = new Tone.WaveShaper((x) => Math.pow(10, x / 20));
      this.signal.connect(this.converter);
      this.converter.connect(param);
    } else {
      // Linear scaling
      this.signal.connect(param);
    }
  }

  // Set value with optional ramp time
  setValue(value: number, time?: Time) {
    const scaled = this.scaleValue(value);
    if (time) {
      this.signal.rampTo(scaled, time);
    } else {
      this.signal.value = scaled;
    }
  }

  // Get current value
  getValue(): number {
    return this.unscaleValue(this.signal.value);
  }

  // Connect a modulation source
  connectModulation(source: Tone.Signal | Tone.ToneAudioNode, amount = 1) {
    const scale = new Tone.Multiply(amount);
    source.connect(scale);
    scale.connect(this.signal);
    return scale; // Return for later disconnection
  }

  // Scale value to internal range
  private scaleValue(value: number): number {
    const [min, max] = this.config.range;
    return (value - min) / (max - min);
  }

  // Unscale value from internal range
  private unscaleValue(value: number): number {
    const [min, max] = this.config.range;
    return value * (max - min) + min;
  }

  dispose() {
    this.signal.dispose();
    this.converter?.dispose();
  }
}
