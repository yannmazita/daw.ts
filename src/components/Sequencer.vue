<template>
    <div id="sequencer-container" class="flex flex-col p-4">
        <h2 class="text-2xl font-bold mb-4">Sequencer</h2>
        <SequencerStepTracker class="mb-4" />
        <SequencerPlaybackControls class="mb-4" />
        <SequencerSettings class="mb-4" />
        <div class="sequencer-tracks-wrapper overflow-x-auto">
            <SequencerTracks />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import SequencerStepTracker from '@/components/SequencerStepTracker.vue';
import SequencerPlaybackControls from '@/components/SequencerPlaybackControls.vue';
import SequencerSettings from '@/components/SequencerSettings.vue';
import SequencerTracks from '@/components/SequencerTracks.vue';

const emit = defineEmits<{
    addClasses: [classes: object]
}>();

onMounted(() => {
    emit('addClasses', {
        'flex': true,
        'justify-center': true,
    });
});
</script>

<style scoped>
.sequencer-tracks-wrapper {
    max-height: 60vh;
}
</style>
