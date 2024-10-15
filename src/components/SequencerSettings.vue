<template>
    <div id="sequencer-settings-container" class="flex flex-col space-y-4">
        <div class="flex flex-row justify-center">
            <div class="flex flex-row space-x-4">
                <div class="setting-group">
                    <AppInput v-model="inputTracks" @blur="updateTracks"
                        class="input input-bordered input-sm w-12 text-center" label="Tracks" />
                </div>
                <div class="setting-group">
                    <AppInput v-model="inputSteps" @blur="updateSteps"
                        class="input input-bordered input-sm w-12 text-center" label="Steps" />
                </div>
                <div class="setting-group">
                    <AppInput v-model="inputBpm" @blur="updateBpm"
                        class="input input-bordered input-sm w-12 text-center" label="BPM" />
                </div>
            </div>
        </div>

        <div class="flex justify-center space-x-4">
            <div class="setting-group">
                <AppDropdown v-model="stepDuration" :options="stepDurationOptions" label="Step Duration"
                    @update:modelValue="updateStepDuration" />
            </div>
            <div class="setting-group">
                <AppDropdown v-model="timeSignature" :options="timeSignatureOptions" label="Time Signature"
                    @update:modelValue="updateTimeSignature" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { sequencerPlaybackManagerKey, sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import AppInput from '@/components/AppInput.vue';
import AppDropdown from '@/components/AppDropdown.vue';
import { useStructureStore } from '@/stores/structureStore';
import { usePlaybackStore } from '@/stores/playbackStore';

const structureStore = useStructureStore();
const playbackStore = usePlaybackStore();
const playbackManager = inject(sequencerPlaybackManagerKey) as SequencerPlaybackManager;
const trackManager = inject(sequencerTrackManagerKey) as SequencerTrackManager;

const inputTracks = ref(structureStore.state.numTracks.toString());
const inputSteps = ref(structureStore.state.numSteps.toString());
const inputBpm = ref(playbackStore.state.bpm.toString());
const stepDuration = ref('16n');
const timeSignature = ref('4/4');

const stepDurationOptions = [
    { value: '4n', label: 'Quarter Note' },
    { value: '8n', label: 'Eighth Note' },
    { value: '16n', label: 'Sixteenth Note' },
    { value: '32n', label: 'Thirty-Second Note' },
];

const timeSignatureOptions = [
    { value: '4/4', label: '4/4' },
    { value: '3/4', label: '3/4' },
    { value: '6/8', label: '6/8' },
];

function updateTracks() {
    const newTracks = parseInt(inputTracks.value);
    if (!isNaN(newTracks) && newTracks > 0) {
        trackManager.setNumTracks(newTracks);
    }
}

function updateSteps() {
    const newSteps = parseInt(inputSteps.value);
    if (!isNaN(newSteps) && newSteps > 0) {
        trackManager.setNumSteps(newSteps);
    }
}

function updateBpm() {
    const newBpm = parseInt(inputBpm.value);
    if (!isNaN(newBpm) && newBpm > 0) {
        playbackManager.setBpm(newBpm);
    }
}

function updateStepDuration() {
    playbackManager.setStepDuration(stepDuration.value);
}

function updateTimeSignature() {
    const [numerator, denominator] = timeSignature.value.split('/').map(Number);
    playbackManager.setTimeSignature(numerator, denominator);
}

// Watch for changes in store values and update input fields
watch(() => structureStore.state.numTracks, (newValue) => {
    inputTracks.value = newValue.toString();
});

watch(() => structureStore.state.numSteps, (newValue) => {
    inputSteps.value = newValue.toString();
});

watch(() => playbackStore.state.bpm, (newValue) => {
    inputBpm.value = newValue.toString();
});
</script>

<style scoped>
.setting-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}
</style>
