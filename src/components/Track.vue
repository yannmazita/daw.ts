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
import { sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';

interface Props {
    trackId: number;
    steps: SequencerStep[];
}
const props = defineProps<Props>();
const trackManager = inject<SequencerTrackManager>(sequencerTrackManagerKey) as SequencerTrackManager;

function toggleStepActiveState(index: number): void {
    trackManager.toggleStepActiveState(props.trackId, index);
}
</script>
