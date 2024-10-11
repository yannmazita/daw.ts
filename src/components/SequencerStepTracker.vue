<template>
    <div id="sequencer-step-tracker-container" class="flex flex-col items-center p-4">
        <!-- Current step display -->
        <div class="text-2xl font-bold mb-2">
            Step: {{ currentDisplayStep }} / {{ structure.numSteps }}
        </div>

        <!-- Step visualization -->
        <div class="flex justify-center w-full mb-4">
            <div v-for="step in structure.numSteps" :key="step"
                class="w-4 h-4 mx-1 rounded-full transition-all duration-150" :class="{
                    'bg-ts-blue': step === currentDisplayStep,
                    'bg-gray-300': step !== currentDisplayStep,
                    'border-2 border-ts-blue': isLoopPoint(step - 1)
                }"></div>
        </div>

        <!-- Range bar for manual step selection -->
        <AppRangeBar v-model="manualStep" :step="1" :min="1" :max="structure.numSteps" class="w-full"
            @update:modelValue="handleManualStepChange"></AppRangeBar>

        <!-- Playback boundaries and loop points -->
        <div class="flex justify-between w-full mt-2 text-sm">
            <span>Start: {{ playbackStart + 1 }}</span>
            <span>End: {{ playbackEnd }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import { storeToRefs } from 'pinia';
import { useSequencerStore } from '@/stores/sequencerStore';
import AppRangeBar from '@/components/AppRangeBar.vue';
import { sequencerPlaybackManagerKey } from '@/utils/injection-keys';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import { SequenceStatus } from '@/utils/types';

const sequencerStore = useSequencerStore();
const { playback, structure } = storeToRefs(sequencerStore);
const playbackManager = inject(sequencerPlaybackManagerKey) as SequencerPlaybackManager;

const manualStep = ref(1);
const playbackStart = ref(0);
const playbackEnd = computed(() => structure.value.numSteps);

const currentDisplayStep = computed(() => {
    switch (playback.value.status) {
        case SequenceStatus.Playing:
            return playback.value.visualStep + 1;
        case SequenceStatus.Paused:
        case SequenceStatus.Stopped:
            return manualStep.value;
        default:
            return 1;
    }
});

const handleManualStepChange = (newStep: number) => {
    manualStep.value = newStep;
    playbackManager.seekTo(newStep - 1);
};

const isLoopPoint = (step: number) => {
    return step === playbackStart.value || step === playbackEnd.value - 1;
};

// Watch for changes in playback state
watch(() => playback.value.status, (status) => {
    if (status === SequenceStatus.Stopped) {
        // Reset to initial position when playback stops
        manualStep.value = 1;
        playbackManager.seekTo(0);
    } else if (status === SequenceStatus.Paused) {
        // Update manualStep to current position when paused
        manualStep.value = playback.value.visualStep + 1;
    }
});

// Keep manual step in sync with visual step during playback
watch(() => playback.value.visualStep, (newStep) => {
    if (playback.value.status !== SequenceStatus.Stopped) {
        manualStep.value = newStep + 1;
    }
});
</script>
