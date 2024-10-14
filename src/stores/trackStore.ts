// src/stores/trackStore.ts
import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { SequencerTrack } from '@/models/SequencerModels';
import { Note } from '@/utils/types';
import { InvalidStepIndexException, InvalidTrackIndexException } from '@/utils/exceptions';
import { useStructureStore } from '@/stores/structureStore';

export const useTrackStore = defineStore('track', () => {
    const structureStore = useStructureStore();
    const tracks = reactive<SequencerTrack[]>(Array.from(
        { length: structureStore.state.numTracks },
        (_, i) => new SequencerTrack(i, structureStore.state.numSteps)
    )
    );

    function validateTrackIndex(index: number): void {
        if (index < 0 || (index >= tracks.length) && index !== 0) {
            throw new InvalidTrackIndexException(index);
        }
    }

    function validateStepIndex(trackIndex: number, stepIndex: number): void {
        validateTrackIndex(trackIndex);
        if (stepIndex < 0 || stepIndex >= tracks[trackIndex].steps.length) {
            throw new InvalidStepIndexException(stepIndex);
        }
    }

    function addTrack(newTrack: SequencerTrack, insertPosition: number = tracks.length): void {
        if (insertPosition < 0 || insertPosition > tracks.length) {
            throw new InvalidTrackIndexException(insertPosition);
        }
        tracks.splice(insertPosition, 0, newTrack);
        structureStore.setNumTracks(tracks.length);
    }

    function removeTrack(index: number): SequencerTrack {
        validateTrackIndex(index);
        const removedTrack: SequencerTrack = tracks.splice(index, 1)[0];
        return removedTrack;
    }

    function updateEffectiveMute(): void {
        const soloTrackExists = tracks.some(track => track.solo);
        tracks.forEach(track => {
            if (soloTrackExists) {
                track.effectiveMute = !track.solo;
            } else {
                track.effectiveMute = track.muted;
            }
        });
    }

    function setTrackEffectiveMute(trackIndex: number, effectiveMute: boolean): void {
        validateTrackIndex(trackIndex);
        tracks[trackIndex].effectiveMute = effectiveMute;
    }

    function getTrackEffectiveMute(trackIndex: number): boolean {
        validateTrackIndex(trackIndex);
        return tracks[trackIndex].effectiveMute;
    }

    function toggleTrackEffectiveMute(trackIndex: number): void {
        validateTrackIndex(trackIndex);
        tracks[trackIndex].effectiveMute = !tracks[trackIndex].effectiveMute;
    }

    function getTrackMuted(index: number) {
        validateTrackIndex(index);
        return tracks[index].muted;
    }

    function setTrackMuted(index: number, muted: boolean) {
        validateTrackIndex(index);
        tracks[index].muted = muted;
        updateEffectiveMute();
    }

    function toggleTrackMuted(index: number) {
        validateTrackIndex(index);
        tracks[index].muted = !tracks[index].muted;
        updateEffectiveMute();
    }

    function getTrackSolo(index: number) {
        validateTrackIndex(index);
        return tracks[index].solo;
    }

    function setTrackSolo(index: number, solo: boolean) {
        validateTrackIndex(index);
        tracks[index].solo = solo;
        updateEffectiveMute();
    }

    function toggleTrackSolo(index: number) {
        validateTrackIndex(index);
        tracks[index].solo = !tracks[index].solo;
        updateEffectiveMute();
    }

    function getStepActive(trackIndex: number, stepIndex: number) {
        validateStepIndex(trackIndex, stepIndex);
        return tracks[trackIndex].steps[stepIndex].active;
    }

    function setStepActive(trackIndex: number, stepIndex: number, active: boolean) {
        validateStepIndex(trackIndex, stepIndex);
        tracks[trackIndex].steps[stepIndex].active = active;
    }

    function toggleStepActive(trackIndex: number, stepIndex: number) {
        validateStepIndex(trackIndex, stepIndex);
        tracks[trackIndex].steps[stepIndex].active = !tracks[trackIndex].steps[stepIndex].active;
    }

    function getStepVelocity(trackIndex: number, stepIndex: number) {
        validateStepIndex(trackIndex, stepIndex);
        return tracks[trackIndex].steps[stepIndex].velocity;
    }

    function setStepVelocity(trackIndex: number, stepIndex: number, velocity: number) {
        validateStepIndex(trackIndex, stepIndex);
        tracks[trackIndex].steps[stepIndex].velocity = velocity;
    }

    function getStepNote(trackIndex: number, stepIndex: number) {
        validateStepIndex(trackIndex, stepIndex);
        return tracks[trackIndex].steps[stepIndex].note;
    }

    function setStepNote(trackIndex: number, stepIndex: number, note: Note) {
        validateStepIndex(trackIndex, stepIndex);
        tracks[trackIndex].steps[stepIndex].note = note;
    }

    function getTrackVelocity(trackIndex: number): number | null {
        validateTrackIndex(trackIndex);
        return tracks[trackIndex].commonVelocity;
    }

    function setTrackVelocity(trackIndex: number, velocity: number | null) {
        validateTrackIndex(trackIndex);
        tracks[trackIndex].commonVelocity = velocity;
    }

    function getTrackNote(trackIndex: number): Note | null {
        validateTrackIndex(trackIndex);
        return tracks[trackIndex].commonNote;
    }

    function setTrackNote(trackIndex: number, note: Note | null) {
        validateTrackIndex(trackIndex);
        tracks[trackIndex].commonNote = note;
    }

    return {
        tracks,
        addTrack,
        removeTrack,
        getTrackEffectiveMute,
        setTrackEffectiveMute,
        toggleTrackEffectiveMute,
        getTrackMuted,
        setTrackMuted,
        toggleTrackMuted,
        getTrackSolo,
        setTrackSolo,
        toggleTrackSolo,
        getStepActive,
        setStepActive,
        toggleStepActive,
        getStepVelocity,
        setStepVelocity,
        getStepNote,
        setStepNote,
        getTrackVelocity,
        setTrackVelocity,
        getTrackNote,
        setTrackNote,
    };
});
