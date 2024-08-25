<template>
    <!-- Container for displaying the current step of the sequencer -->
    <div v-if="true" id="sequencer-step-tracker-container">
        <!-- Display the current step -->
        <div v-if="true">
            {{ currentStep }}
        </div>
        <!-- Range bar to change/display the current step -->
        <AppRangeBar v-model="currentStep" :step="1" :max="numSteps - 1"></AppRangeBar>
    </div>
</template>

<script setup lang="ts">
import { useSequencerStore } from '@/stores/sequencerStore';
import { storeToRefs } from 'pinia';
import AppRangeBar from '@/components/AppRangeBar.vue';

const { currentStep, numSteps } = storeToRefs(useSequencerStore());
</script>
