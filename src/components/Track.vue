<template>
    <div class="flex flex-row" @contextmenu.prevent="handleRightClick(props.trackId)">
        <Step v-for="(step, index) in props.steps" :key="index" :isActive="step.active" :trackId="props.trackId"
            :stepId="index">
        </Step>
    </div>
</template>

<script setup lang="ts">
import { SequencerStep } from '@/models/SequencerModels';
import Step from '@/components/Step.vue';
import { useSequencerStore } from '@/stores/sequencerStore';

interface Props {
    trackId: number;
    steps: SequencerStep[];
}
const props = defineProps<Props>();
const sequencerStore = useSequencerStore();

function handleRightClick(trackIndex: number) {
    sequencerStore.rightClickSelectTrack(trackIndex);
}
</script>
