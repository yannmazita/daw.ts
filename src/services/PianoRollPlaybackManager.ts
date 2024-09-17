// File: PianoRollPlaybackManager.ts
// Description: Manages the playback within the piano roll.
import * as Tone from 'tone';

export class PianoRollPlaybackManager {
    private synth = new Tone.Synth().toDestination();

    constructor() {
        Tone.getTransport().start();
    }

    playNote(pitch: number, duration = "8n") {
        // Convert MIDI number to frequency and play the note
        this.synth.triggerAttackRelease(Tone.Midi(21 + pitch).toFrequency(), duration, Tone.now());
    }
}
