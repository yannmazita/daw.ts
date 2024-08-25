<template>
    <!-- Step Component -->
    <!-- Displays a step in the sequencer track. Clicking on the step toggles its active state,
         and right-clicking sets the step as the target for context menu operations. -->
    <div class="step flex flex-row justify-center items-center w-8 h-8 m-0.5 bg-gray-200 cursor-pointer border-solid border-4"
        :class="classes" @click="handleLeftClick(props.stepId)"
        @contextmenu.prevent="handleRightClick(props.trackId, props.stepId)">
    </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useSequencerStore } from '@/stores/sequencerStore';
import { sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';

interface Props {
    trackId: number;
    stepId: number;
    isActive: boolean;
}
const props = defineProps<Props>();

const classes = computed(() => ({
    'bg-ts-blue': props.isActive,  // Applies blue background if the step is active.
    'border-ts-blue': props.isActive,  // Applies blue border if the step is active.
}));

// Injects the track manager to allow toggling the step's active state.
const trackManager = inject<SequencerTrackManager>(sequencerTrackManagerKey) as SequencerTrackManager;
const sequencerStore = useSequencerStore();

// Handles the left-click on the step, which toggles its active state.
function handleLeftClick(stepIndex: number) {
    trackManager.toggleStepActiveState(props.trackId, stepIndex);
}

// Handles the right-click on the step, which sets it as the target for context menu operations.
function handleRightClick(trackIndex: number, stepIndex: number) {
    sequencerStore.rightClickSelectStep(trackIndex, stepIndex);
}
</script>
