<template>
    <div id="sequencer-settings-container" class="flex flex-row justify-center">
        <div class="flex flew-row">
            <div class="">
                <span>
                    Tracks:
                </span>
                <AppInput v-model="inputTracks" @focus="" @blur=""
                    class="input input-bordered input-xs text-center w-10">
                </AppInput>
            </div>
            <div class="">
                <span>
                    Steps:
                </span>
                <AppInput v-model="inputSteps" @focus="" @blur=""
                    class="input input-bordered input-xs text-center w-10">
                </AppInput>
            </div>
            <div class="">
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
import { computed, inject, } from 'vue';
import { storeToRefs } from 'pinia';
import { SequencerManager } from '@/services/SequencerManager';
import { useSequencerStore } from '@/stores/sequencerStore';
import { sequencerManagerKey } from '@/utils/injection-keys';
import AppInput from '@/components/AppInput.vue';

const { numTracks, numSteps, bpm } = storeToRefs(useSequencerStore());
const sequencerManager = inject<SequencerManager>(sequencerManagerKey);

const inputTracks = computed({
    get: () => numTracks.value,
    set: (val) => sequencerManager?.setNumTracks(val)
});

const inputSteps = computed({
    get: () => numSteps.value,
    set: (val) => sequencerManager?.setNumSteps(val)
});

const inputBpm = computed({
    get: () => bpm.value,
    set: (val) => sequencerManager?.setBpm(val)
});
</script>
