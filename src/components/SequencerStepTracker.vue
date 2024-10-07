<template>
    <div id="sequencer-step-tracker-container" class="flex flex-col items-center p-4">
        <!-- Current step display -->
        <div class="text-2xl font-bold mb-2">
            Step: {{ displayStep + 1 }} / {{ numSteps }}
        </div>

        <!-- Step visualization -->
        <div class="flex justify-center w-full mb-4">
            <div v-for="step in numSteps" :key="step" class="w-4 h-4 mx-1 rounded-full transition-all duration-150"
                :class="{
                    'bg-ts-blue': step - 1 === displayStep,
                    'bg-gray-300': step - 1 !== displayStep,
                    'border-2 border-ts-blue': isLoopPoint(step - 1)
                }"></div>
        </div>

        <!-- Range bar for manual step selection -->
        <AppRangeBar v-model="manualStep" :step="1" :min="0" :max="numSteps - 1" class="w-full"
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

const sequencerStore = useSequencerStore();
const { numSteps, visualStep, isPlaying } = storeToRefs(sequencerStore);
const playbackManager = inject(sequencerPlaybackManagerKey) as SequencerPlaybackManager;

const displayStep = ref(0);
const manualStep = ref(0);

const playbackStart = ref(0);
const playbackEnd = computed(() => numSteps.value);

watch(visualStep, (newStep) => {
    displayStep.value = newStep;
    manualStep.value = newStep;
}, { immediate: true });

const handleManualStepChange = (newStep: number) => {
    displayStep.value = newStep;
    manualStep.value = newStep;
    playbackManager.seekTo(newStep);
};

const isLoopPoint = (step: number) => {
    return step === playbackStart.value || step === playbackEnd.value - 1;
};

// Smooth step transition for display
watch(displayStep, (newStep, oldStep) => {
    if (Math.abs(newStep - oldStep) > 1 && !isPlaying.value) {
        const animate = () => {
            if (displayStep.value !== newStep) {
                displayStep.value += displayStep.value < newStep ? 1 : -1;
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }
});
</script>
