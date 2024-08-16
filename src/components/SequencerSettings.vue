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
import { SequencerService } from '@/services/SequencerServices';
import { useSequencerStore } from '@/stores/sequencerStore';
import { sequencerServiceKey } from '@/utils/injection-keys';
import AppInput from '@/components/AppInput.vue';

const { numTracks, numSteps, bpm } = storeToRefs(useSequencerStore());
const sequencerService = inject<SequencerService>(sequencerServiceKey);

const inputTracks = computed({
    get: () => numTracks.value,
    set: (val) => sequencerService?.setNumTracks(val)
});

const inputSteps = computed({
    get: () => numSteps.value,
    set: (val) => sequencerService?.setNumSteps(val)
});

const inputBpm = computed({
    get: () => bpm.value,
    set: (val) => sequencerService?.setBpm(val)
});
</script>
