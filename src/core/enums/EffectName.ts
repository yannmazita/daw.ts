// src/core/enums/EffectName.ts

export enum EffectName {
  /** An auto-filter effect that sweeps a frequency band with an LFO. */
  AutoFilter = "Auto Filter",

  /** An auto-panning effect that modulates the stereo panning position. */
  AutoPanner = "Auto Panner",

  /** An auto-wah effect that modulates the filter's cutoff frequency. */
  AutoWah = "Auto-wah",

  /** A bit crusher effect that reduces the resolution of the audio signal. */
  BitCrusher = "Bit Crusher",

  /** A Chebyshev distortion effect with rich harmonic distortion. */
  Chebyshev = "Chebyshev",

  /** A chorus effect that thickens the sound by adding delayed copies of the signal. */
  Chorus = "Chorus",

  /** A distortion effect that adds harmonic distortion to the signal. */
  Distortion = "Distortion",

  /** A feedback delay effect that adds echoes with feedback control. */
  FeedbackDelay = "Feedback Delay",

  /** A reverb effect that simulates room acoustics using freeverb. */
  Freeverb = "Freeverb",

  /** A frequency shifter effect that shifts the frequency of the input signal. */
  FrequencyShifter = "Frequency Shifter",

  /** A reverb effect inspired by the JC reverb units. */
  JCReverb = "John Chowning Reverb",

  /** A phaser effect that creates phase-shifting audio oscillations. */
  Phaser = "Phaser",

  /** A ping-pong delay effect that alternates echoes between left and right channels. */
  PingPongDelay = "Ping-Pong Delay",

  /** A pitch-shifting effect that changes the pitch of the input signal. */
  PitchShift = "Pitch Shift",

  /** A classic reverb effect for simulating various acoustic spaces. */
  Reverb = "Reverb",

  /** A stereo widening effect that enhances the stereo field of the audio. */
  StereoWidener = "Stereo Widener",

  /** A tremolo effect that modulates the amplitude of the signal. */
  Tremolo = "Tremolo",

  /** A vibrato effect that modulates the pitch of the signal. */
  Vibrato = "Vibrato",
}
