// src/core/types/intrument.ts

import * as Tone from 'tone';

/**
 * Represents the types of synthesizer instruments available, as defined by the Tone.js library.
 * This type is used to manage instances of synthesizers that can be assigned to tracks in the sequencer.
 */
export type Instrument = Tone.Synth | Tone.AMSynth | Tone.FMSynth | Tone.MembraneSynth | Tone.MetalSynth | Tone.MonoSynth | Tone.NoiseSynth;
