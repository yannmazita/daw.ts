import { usePianoRollStore } from '@/stores/usePianoRollStore';
import { storeToRefs } from 'pinia';
import * as Tone from 'tone';

export class PianoRollPlaybackManager {
    private pianoRollStore = usePianoRollStore();
    private synth = new Tone.PolySynth(Tone.Synth).toDestination();
    private noteDuration = "8n";
    public loopEnabled = false;
    private playbackPart?: Tone.Part<any>;

    constructor() {
        Tone.getTransport().start();
    }

    public playNote(pitch: number, duration = "8n") {
        // Convert MIDI number to frequency and play the note
        this.synth.triggerAttackRelease(Tone.Midi(21 + pitch).toFrequency(), duration, Tone.now());
    }

    /**
     * Schedules notes for playback using the current state from the piano roll store.
     */
    public scheduleNotes() {
        const { notes, pixelsPerBeat, pitchesToShow } = storeToRefs(this.pianoRollStore);
        const height = 800;

        // Dispose existing part if any
        if (this.playbackPart) {
            this.playbackPart.dispose();
        }

        // Create a new part
        this.playbackPart = new Tone.Part((time, event) => {
            const pitch = Tone.Midi(Math.floor((event.note.y / (height / pitchesToShow.value)) + 21)).toFrequency();
            const duration = Tone.Time((event.note.length / pixelsPerBeat.value) + "n").toSeconds();
            this.synth.triggerAttackRelease(pitch, duration, time);
        }, notes.value.map(note => ({
            time: Tone.Time((note.x / pixelsPerBeat.value) + "n").toSeconds(),
            note
        })));

        // Configure looping if enabled
        if (this.loopEnabled) {
            this.playbackPart.loop = true;
            this.playbackPart.loopEnd = '1m'; // Set loop end dynamically if needed
        } else {
            this.playbackPart.loop = false;
        }

        this.playbackPart.start(0);
    }

    /**
     * Starts the playback of the piano roll sequence.
     */
    public startPlayback(): void {
        if (!this.pianoRollStore.isPlaying) {
            this.scheduleNotes();
            Tone.getTransport().start();
            this.pianoRollStore.isPlaying = true;
        }
    }

    /**
     * Stops the playback of the piano roll sequence, disposing of any scheduled parts.
     */
    public stopPlayback(): void {
        if (this.playbackPart) {
            this.playbackPart.stop();
            this.playbackPart.dispose();
            this.playbackPart = undefined;
        }
        Tone.getTransport().stop();
        this.pianoRollStore.isPlaying = false;
    }

    /**
     * Pauses the playback of the piano roll sequence.
     */
    public pausePlayback(): void {
        if (!this.pianoRollStore.isPlaying) {
            return;
        }
        this.pianoRollStore.isPlaying = false;
        Tone.getTransport().pause();
    }

    public setBpm(newBpm: number): void {
        Tone.getTransport().bpm.value = newBpm;
    }
}
