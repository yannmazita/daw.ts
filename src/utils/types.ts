import * as Tone from 'tone';

export enum InstrumentName {
    Synth = 'Synth',
    AMSynth = 'AMSynth',
    FMSynth = 'FMSynth',
    MembraneSynth = 'MembraneSynth',
    MetalSynth = 'MetalSynth',
    MonoSynth = 'MonoSynth',
    NoiseSynth = 'NoiseSynth'
}

export type Instrument = Tone.Synth | Tone.AMSynth | Tone.FMSynth | Tone.MembraneSynth | Tone.MetalSynth | Tone.MonoSynth | Tone.NoiseSynth
