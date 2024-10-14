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
import { onMounted, ref, watch } from 'vue';
import SequencerStepTracker from '@/components/SequencerStepTracker.vue';
import SequencerPlaybackControls from '@/components/SequencerPlaybackControls.vue';
import SequencerSettings from '@/components/SequencerSettings.vue';
import SequencerTracks from '@/components/SequencerTracks.vue';
import { useTrackStore } from '@/stores/trackStore';

const emit = defineEmits<{
    addClasses: [classes: object]
}>();

const trackStore = useTrackStore();
const tracksCount = ref(trackStore.tracks.length);

onMounted(() => {
    emit('addClasses', {
        'flex': true,
        'justify-center': true,
    });
});

// Watch for changes in the number of tracks
watch(() => trackStore.tracks.length, (newCount) => {
    tracksCount.value = newCount;
});
</script>

<style scoped>
.sequencer-tracks-wrapper {
    max-height: 60vh;
    overflow-y: auto;
    scroll-behavior: smooth;
    /* Enable smooth scrolling */
}

/* Add a subtle scrollbar style */
.sequencer-tracks-wrapper::-webkit-scrollbar {
    width: 8px;
}

.sequencer-tracks-wrapper::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.sequencer-tracks-wrapper::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

.sequencer-tracks-wrapper::-webkit-scrollbar-thumb:hover {
    background: #555;
}

/* Transition effect for adding/removing tracks */
:deep(.sequencer-track) {
    transition: all 0.3s ease-in-out;
    opacity: 1;
    transform: translateY(0);
}

:deep(.sequencer-track-enter-active),
:deep(.sequencer-track-leave-active) {
    transition: all 0.3s ease-in-out;
}

:deep(.sequencer-track-enter-from),
:deep(.sequencer-track-leave-to) {
    opacity: 0;
    transform: translateY(-20px);
}
</style>
