<template>
    <div class="flex flex-row">
        <Step v-for="(step, index) in props.steps" :key="index" :isActive="step.active" :isPlaying="step.playing"
            @toggleActive="toggleStepActiveState(index)" />
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import Step from '@/components/Step.vue';
import { SequencerStep } from '@/models/SequencerModels.ts';
import { SequencerService } from '@/services/SequencerServices';
import { sequencerServiceKey } from '@/utils/injection-keys';

interface Props {
    trackId: number;
    steps: SequencerStep[];
}
const props = defineProps<Props>();
const sequencerService = inject<SequencerService>(sequencerServiceKey);

function toggleStepActiveState(index: number): void {
    sequencerService?.toggleStepActiveState(props.trackId, index);
}
</script>
