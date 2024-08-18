<template>
    <div class="flex flex-row">
        <Step v-for="(step, index) in props.steps" :key="index" :isActive="step.active" :isPlaying="step.playing"
            :trackId="props.trackId" :stepId="index">
        </Step>
    </div>
</template>

<script setup lang="ts">
import { SequencerStep } from '@/models/SequencerModels';
import Step from '@/components/Step.vue';

interface Props {
    trackId: number;
    steps: SequencerStep[];
}
const props = defineProps<Props>();
</script>
