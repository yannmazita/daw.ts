<template>
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
    isPlaying: boolean;
}
const props = defineProps<Props>();

const classes = computed(() => ({
    'bg-ts-blue': props.isActive,
    'border-ts-blue': props.isActive && !props.isPlaying,
    'border-ts-pink': props.isPlaying
}));

const trackManager = inject<SequencerTrackManager>(sequencerTrackManagerKey) as SequencerTrackManager;
const sequencerStore = useSequencerStore();

function handleLeftClick(stepIndex: number) {
    trackManager.toggleStepActiveState(props.trackId, stepIndex);
}

function handleRightClick(trackIndex: number, stepIndex: number) {
    sequencerStore.rightClickSelectStep(trackIndex, stepIndex);
}
</script>
