// File: sequencerStore.ts
// Description: Provides a store for managing the state of the sequencer in the application.

import { SequencerTrack } from '@/models/SequencerModels';
import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { PlaybackState, SequenceStructure, StepPosition } from '@/utils/interfaces';
import { SequenceStatus } from '@/utils/types';
import { Note } from '@/utils/types';

/**
 * Defines the store for managing sequencer data.
 */
export const useSequencerStore = defineStore('sequencer', () => {
    const playback: PlaybackState = reactive({
        status: SequenceStatus.Stopped,
        bpm: 0,
        currentStep: 0,
        visualStep: 0,
    });

    const structure: SequenceStructure = reactive({
        numTracks: 0,
        numSteps: 0,
        tracks: [],
        stepDuration: '',
        timeSignature: [0, 0],
    });

    const rightClickSelectionPos: StepPosition = reactive({ trackIndex: -1, stepIndex: -1 });

    // Methods for track management
    function addTrack(insertPosition: number = structure.tracks.length) {
        const newTrack = new SequencerTrack(insertPosition, structure.numSteps);
        structure.tracks.splice(insertPosition, 0, newTrack);
        updateTrackIds();
        structure.numTracks++;
    }

    function removeTrack(deletePosition: number): SequencerTrack | null {
        let removedTrack: SequencerTrack | null = null;
        if (deletePosition >= 0 && deletePosition < structure.tracks.length) {
            removedTrack = structure.tracks.splice(deletePosition, 1)[0];
            updateTrackIds();
            structure.numTracks--;
            return removedTrack;
        }
        return null;
    }

    function restoreTrack(track: SequencerTrack, index: number) {
        structure.tracks.splice(index, 0, track);
        updateTrackIds();
        structure.numTracks++;
    }

    function updateTrackIds() {
        structure.tracks.forEach((track, index) => {
            track.id = index;
        });
    }

    function getNumTracks(): number {
        return structure.numTracks;
    }

    function setNumTracks(newCount: number) {
        if (newCount < 1) return;
        while (newCount > structure.tracks.length) {
            addTrack();
        }
        while (newCount < structure.tracks.length) {
            removeTrack(structure.tracks.length - 1);
        }
    }

    function updateEffectiveMuteStates() {
        const soloTrackExists = structure.tracks.some(track => track.solo);

        structure.tracks.forEach(track => {
            if (soloTrackExists) {
                track.effectiveMute = !track.solo;
            } else {
                track.effectiveMute = track.muted;
            }
        });
    }

    function getTrackMuted(trackIndex: number): boolean | null {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length) {
            return structure.tracks[trackIndex].muted;
        }
        return null;
    }

    function setTrackMuted(trackIndex: number, muted: boolean) {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length) {
            structure.tracks[trackIndex].muted = muted;
            updateEffectiveMuteStates();
        }
    }

    function toggleTrackMuted(trackIndex: number) {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length) {
            structure.tracks[trackIndex].muted = !structure.tracks[trackIndex].muted;
            updateEffectiveMuteStates();
        }
    }

    function getTrackSolo(trackIndex: number): boolean | null {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length) {
            return structure.tracks[trackIndex].solo;
        }
        return null;
    }

    function setTrackSolo(trackIndex: number, solo: boolean) {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length) {
            structure.tracks[trackIndex].solo = solo;
            updateEffectiveMuteStates();
        }
    }

    function toggleTrackSolo(trackIndex: number) {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length) {
            structure.tracks[trackIndex].solo = !structure.tracks[trackIndex].solo;
            updateEffectiveMuteStates();
        }
    }

    function getTrack(trackIndex: number): SequencerTrack | null {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length) {
            return structure.tracks[trackIndex];
        }
        return null;
    }

    function getTracks(): SequencerTrack[] {
        return structure.tracks;
    }

    function getBpm(): number {
        return playback.bpm;
    }

    function setBpm(newBpm: number) {
        playback.bpm = newBpm;
    }

    function getTimeSignature(): [number, number] {
        return structure.timeSignature;
    }

    function setTimeSignature(newTimeSignature: [number, number]) {
        structure.timeSignature = newTimeSignature;
    }

    // Methods for step management
    function getStepActive(trackIndex: number, stepIndex: number): boolean | null {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length &&
            stepIndex >= 0 && stepIndex < structure.numSteps) {
            return structure.tracks[trackIndex].steps[stepIndex].active;
        }
        return null;
    }

    function setStepActive(trackIndex: number, stepIndex: number, active: boolean) {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length &&
            stepIndex >= 0 && stepIndex < structure.numSteps) {
            structure.tracks[trackIndex].steps[stepIndex].active = active;
        }
    }

    function getStepVelocity(trackIndex: number, stepIndex: number): number | null {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length &&
            stepIndex >= 0 && stepIndex < structure.numSteps) {
            return structure.tracks[trackIndex].steps[stepIndex].velocity;
        }
        return null;
    }

    function setStepVelocity(trackIndex: number, stepIndex: number, velocity: number) {
        if (trackIndex >= -1 && trackIndex < structure.tracks.length &&
            stepIndex >= 0 && stepIndex < structure.numSteps) {
            clearTrackVelocity(trackIndex);
            structure.tracks[trackIndex].steps[stepIndex].velocity = velocity;
        }
    }

    function getTrackVelocity(trackIndex: number): number | null {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length) {
            return structure.tracks[trackIndex].commonVelocity;
        }
        return null;
    }

    function setTrackVelocity(trackIndex: number, velocity: number) {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length) {
            structure.tracks[trackIndex].commonVelocity = velocity;
        }
    }

    function clearTrackVelocity(trackIndex: number) {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length) {
            structure.tracks[trackIndex].commonVelocity = null;
        }
    }


    function getStepNote(trackIndex: number, stepIndex: number): Note | null {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length &&
            stepIndex >= 0 && stepIndex < structure.numSteps) {
            return structure.tracks[trackIndex].steps[stepIndex].note;
        }
        return null;
    }

    function setStepNote(trackIndex: number, stepIndex: number, note: Note) {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length &&
            stepIndex >= 0 && stepIndex < structure.numSteps) {
            clearTrackNote(trackIndex);
            const step = structure.tracks[trackIndex].steps[stepIndex];
            step.note = note;
        }
    }

    function clearTrackNote(trackIndex: number) {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length) {
            structure.tracks[trackIndex].commonNote = null;
        }
    }

    function getTrackNote(trackIndex: number): Note | null {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length) {
            return structure.tracks[trackIndex].commonNote;
        }
        return null;
    }

    function setTrackNote(trackIndex: number, note: Note) {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length) {
            structure.tracks[trackIndex].commonNote = note;
        }
    }


    function toggleStepActive(trackIndex: number, stepIndex: number) {
        if (trackIndex >= 0 && trackIndex < structure.tracks.length &&
            stepIndex >= 0 && stepIndex < structure.numSteps) {
            const step = structure.tracks[trackIndex].steps[stepIndex];
            step.active = !step.active;
        }
    }

    function getNumSteps(): number {
        return structure.numSteps;
    }

    function setNumSteps(newCount: number) {
        if (newCount < 1) return;
        structure.numSteps = newCount;
        structure.tracks.forEach((track) => {
            track.setNumSteps(newCount);
        });
    }

    // Methods for right-click selection
    function rightClickSelect(position: StepPosition) {
        if (position.trackIndex >= 0 && position.trackIndex < structure.tracks.length) {
            rightClickSelectionPos.trackIndex = position.trackIndex;
        }
        else {
            rightClickSelectionPos.trackIndex = -1;
        }
        if (position.stepIndex >= 0 && position.stepIndex < structure.numSteps) {
            rightClickSelectionPos.stepIndex = position.stepIndex;
        }
        else {
            rightClickSelectionPos.stepIndex = -1;
        }
    }

    function clearRightClickSelect() {
        rightClickSelectionPos.trackIndex = -1;
        rightClickSelectionPos.stepIndex = -1;
    }

    function isTrackSelectionValid(): boolean {
        return rightClickSelectionPos.trackIndex >= 0 && rightClickSelectionPos.trackIndex < structure.tracks.length;
    }

    function isStepSelectionValid(): boolean {
        return rightClickSelectionPos.stepIndex >= 0 && rightClickSelectionPos.stepIndex < structure.numSteps;
    }

    return {
        playback,
        structure,
        rightClickSelectionPos,
        rightClickSelect,
        clearRightClickSelect,
        isTrackSelectionValid,
        isStepSelectionValid,
        updateEffectiveMuteStates,
        addTrack,
        removeTrack,
        restoreTrack,
        getBpm,
        getTimeSignature,
        getTrackMuted,
        getTrack,
        getTracks,
        getNumTracks,
        getStepActive,
        getStepVelocity,
        getNumSteps,
        getStepNote,
        getTrackSolo,
        getTrackNote,
        getTrackVelocity,
        setBpm,
        setTimeSignature,
        setTrackMuted,
        setStepNote,
        setNumTracks,
        setNumSteps,
        setStepActive,
        setStepVelocity,
        setTrackVelocity,
        setTrackNote,
        setTrackSolo,
        toggleStepActive,
        toggleTrackMuted,
        toggleTrackSolo,
    };
});
