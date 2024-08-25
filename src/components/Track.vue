<template>
  <!-- Track Component -->
  <!-- Renders a series of Step components for a given track.
       Right-clicking on any part of the track (not specifically on a step) will
       trigger context menu operations related to the entire track. -->
  <div class="flex flex-row" @contextmenu.prevent="handleRightClick(props.trackId)">
    <Step
      v-for="(step, index) in props.steps"
      :key="index"
      :isActive="step.active"
      :trackId="props.trackId"
      :stepId="index"
    >
    </Step>
  </div>
</template>

<script setup lang="ts">
import { SequencerStep } from '@/models/SequencerModels';
import Step from '@/components/Step.vue';
import { useSequencerStore } from '@/stores/sequencerStore';

interface Props {
    trackId: number; // Unique identifier for the track.
    steps: SequencerStep[]; // Array of step objects that make up the track.
}
const props = defineProps<Props>();

const sequencerStore = useSequencerStore();

// Function to handle right-click events on the track, setting the track's context in the global state.
function handleRightClick(trackIndex: number) {
    sequencerStore.rightClickSelectTrack(trackIndex);
}
</script>
