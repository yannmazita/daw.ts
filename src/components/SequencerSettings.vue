<template>
    <div id="sequencer-settings-container" class="flex flex-col space-y-4">
        <div class="flex flex-row justify-center">
            <div class="flex flex-row space-x-4">
                <div>
                    <span>Tracks:</span>
                    <AppInput v-model="inputTracks" @blur="updateTracks"
                        class="input input-bordered input-sm w-12 text-center" />
                </div>
                <div>
                    <span>Steps:</span>
                    <AppInput v-model="inputSteps" @blur="updateSteps"
                        class="input input-bordered input-sm w-12 text-center" />
                </div>
                <div>
                    <span>BPM:</span>
                    <AppInput v-model="inputBpm" @blur="updateBpm"
                        class="input input-bordered input-sm w-12 text-center" />
                </div>
            </div>
        </div>

        <div class="flex justify-center space-x-4">
            <div>
                <span>Step Duration:</span>
                <select v-model="stepDuration" @change="updateStepDuration"
                    class="bg-gray-700 text-white px-2 py-1 rounded">
                    <option value="4n">Quarter Note</option>
                    <option value="8n">Eighth Note</option>
                    <option value="16n">Sixteenth Note</option>
                    <option value="32n">Thirty-Second Note</option>
                </select>
            </div>
            <div>
                <span>Time Signature:</span>
                <select v-model="timeSignature" @change="updateTimeSignature"
                    class="bg-gray-700 text-white px-2 py-1 rounded">
                    <option value="4/4">4/4</option>
                    <option value="3/4">3/4</option>
                    <option value="6/8">6/8</option>
                </select>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { sequencerPlaybackManagerKey, sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import AppInput from '@/components/AppInput.vue';
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
</script>
