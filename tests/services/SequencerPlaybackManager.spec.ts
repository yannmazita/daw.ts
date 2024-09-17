import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import * as Tone from 'tone';
import { reactive, ref } from 'vue';

// Mocking of Tone.js
vi.mock('tone', async () => {
    const actual = await vi.importActual<typeof Tone>('tone');
    const mockSynth = () => ({
        toDestination: () => ({
            triggerAttackRelease: vi.fn(),
        })
    });

    const mockTransport = {
        start: vi.fn(),
        pause: vi.fn(),
        stop: vi.fn(),
        cancel: vi.fn(),
        clear: vi.fn(),
        scheduleRepeat: vi.fn(),
        bpm: { value: 120 }
    };

    return {
        ...actual,
        getTransport: vi.fn(() => mockTransport),
        Synth: vi.fn(mockSynth),
        AMSynth: vi.fn(mockSynth),
        FMSynth: vi.fn(mockSynth),
        MembraneSynth: vi.fn(mockSynth),
        MetalSynth: vi.fn(mockSynth),
        MonoSynth: vi.fn(mockSynth),
        NoiseSynth: vi.fn(mockSynth),
    };
});

vi.mock('@/stores/sequencerStore', () => ({
    useSequencerStore: vi.fn(() => ({
        isPlaying: ref(false),
        bpm: ref(120),
        numSteps: ref(16),
        currentStep: ref(0),
        tracks: ref([]),
        rightClickStepPos: reactive({ trackIndex: -1, stepIndex: -1 }),
    }))
}));

describe('SequencerPlaybackManager', () => {
    let sequencerPlaybackManager: SequencerPlaybackManager;
    let instrumentManagerMock: SequencerInstrumentManager;

    beforeEach(() => {
        instrumentManagerMock = new SequencerInstrumentManager();
        sequencerPlaybackManager = new SequencerPlaybackManager(instrumentManagerMock);
        sequencerPlaybackManager.sequenceID = 1;
    });

    it('should properly initialize', () => {
        expect(sequencerPlaybackManager).toBeInstanceOf(SequencerPlaybackManager);
    });

    it('starts sequence playback', () => {
        sequencerPlaybackManager.playSequence();
        expect(Tone.getTransport().start).toHaveBeenCalled();
    });

    it('pauses sequence playback (when playing)', () => {
        sequencerPlaybackManager.playSequence();
        sequencerPlaybackManager.pauseSequence();
        expect(Tone.getTransport().pause).toHaveBeenCalled();
    });

    it('stops sequence playback (when playing)', () => {
        sequencerPlaybackManager.playSequence();
        sequencerPlaybackManager.stopSequence();
        expect(Tone.getTransport().stop).toHaveBeenCalled();
        expect(Tone.getTransport().cancel).toHaveBeenCalled();
    });

    it('sets BPM correctly (when not playing)', () => {
        const newBpm = 140;
        sequencerPlaybackManager.setBpm(newBpm);
        expect(Tone.getTransport().bpm.value).toBe(newBpm);
    });

    it('sets BPM correctly (when playing)', () => {
        const newBpm = 140;
        sequencerPlaybackManager.playSequence();
        sequencerPlaybackManager.setBpm(newBpm);
        expect(Tone.getTransport().bpm.value).toBe(newBpm);
    });
});
