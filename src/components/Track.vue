<template>
    <div class="flex flex-row">
        <Step v-for="(step, index) in props.steps" :key="index" :isActive="step.active" :isPlaying="step.playing"
            @toggleActive="toggleStepActiveState(index)" />
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import Step from '@/components/Step.vue';
import { SequencerStep } from '@/models/SequencerModels';
import { SequencerManager } from '@/services/SequencerManager';
import { sequencerManagerKey } from '@/utils/injection-keys';

interface Props {
    trackId: number;
    steps: SequencerStep[];
}
const props = defineProps<Props>();
const sequencerManager = inject<SequencerManager>(sequencerManagerKey);

function toggleStepActiveState(index: number): void {
    sequencerManager?.toggleStepActiveState(props.trackId, index);
}
</script>
