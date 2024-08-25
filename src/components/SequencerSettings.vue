<template>
    <!-- Container for sequencer settings -->
    <div id="sequencer-settings-container" class="flex flex-row justify-center">
        <div class="flex flew-row">
            <!-- Tracks input field -->
            <div>
                <span>
                    Tracks:
                </span>
                <AppInput v-model="inputTracks" @focus="" @blur=""
                    class="input input-bordered input-xs text-center w-10">
                </AppInput>
            </div>
            <!-- Steps input field -->
            <div>
                <span>
                    Steps:
                </span>
                <AppInput v-model="inputSteps" @focus="" @blur=""
                    class="input input-bordered input-xs text-center w-10">
                </AppInput>
            </div>
            <!-- BPM input field -->
            <div>
                <span>
                    BPM:
                </span>
                <AppInput v-model="inputBpm" @focus="" @blur="" class="input input-bordered input-xs text-center w-10">
                </AppInput>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { storeToRefs } from 'pinia';
import { sequencerPlaybackManagerKey, sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { useSequencerStore } from '@/stores/sequencerStore';
import AppInput from '@/components/AppInput.vue';

const { numTracks, numSteps, bpm } = storeToRefs(useSequencerStore());
const playbackManager = inject<SequencerPlaybackManager>(sequencerPlaybackManagerKey) as SequencerPlaybackManager;
const trackManager = inject<SequencerTrackManager>(sequencerTrackManagerKey) as SequencerTrackManager;

// Computed properties for inputs, with getters and setters for immediate updates
const inputTracks = computed({
    get: () => numTracks.value,
    set: (val) => trackManager.setNumTracks(val)
});

const inputSteps = computed({
    get: () => numSteps.value,
    set: (val) => trackManager.setNumSteps(val)
});

const inputBpm = computed({
    get: () => bpm.value,
    set: (val) => playbackManager.setBpm(val)
});
</script>
