<template>
    <div id="sequencer-container">
        <div id="sequencer-container-settings" class="flex flex-row justify-center">
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
                    <AppInput v-model="inputBpm" @focus="" @blur=""
                        class="input input-bordered input-xs text-center w-10">
                    </AppInput>
                </div>
            </div>
        </div>
        <div id="sequencer-container-tracks" v-for="track in tracks" :key="track.id">
            <Track :track-id="track.id" :steps="track.steps" />
        </div>
        <div id="sequencer-container-playback" class="flex justify-center">
            <AppSmallButton @click="sequencerService?.playSequence()">
                {{ '▶️' }}
            </AppSmallButton>
            <AppSmallButton @click="sequencerService?.stopSequence()">
                {{ '⏹️' }}
            </AppSmallButton>
            <AppSmallButton @click="sequencerService?.toggleLoop()">
                {{ loopIcon }}
            </AppSmallButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSequencerStore } from '@/stores/sequencerStore.ts';
import { sequencerServiceKey } from '@/utils/injection-keys.ts';
import { SequencerService } from '@/services/SequencerServices.ts';
import AppInput from '@/components/AppInput.vue';
import AppSmallButton from '@/components/AppSmallButton.vue';
import Track from '@/components/Track.vue';

const { tracks, numTracks, numSteps, bpm } = storeToRefs(useSequencerStore());
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

const loopIcon = computed(() => sequencerService?.loopEnabled ? "a" : "b");

onBeforeUnmount(() => {
    //sequencerService?.dispose();
})
</script>
