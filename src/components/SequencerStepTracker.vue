<template>
    <div v-if="true" id="sequencer-step-tracker-container">
        <div v-if="true">
            {{ currentStep }}
        </div>
        <AppRangeBar v-model="currentStep" :step="1" :max="numSteps - 1"></AppRangeBar>
    </div>
</template>

<script setup lang="ts">
import { useSequencerStore } from '@/stores/sequencerStore';
import { storeToRefs } from 'pinia';
import AppRangeBar from '@/components/AppRangeBar.vue';

const { currentStep, numSteps } = storeToRefs(useSequencerStore());


</script>
