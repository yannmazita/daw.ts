<template>
    <div id="sequencer-container" class="flex flex-col p-4">
        <h2 class="text-2xl font-bold mb-4">Sequencer</h2>

        <SequencerStepTracker class="mb-4" />

        <SequencerPlaybackControls class="mb-4" />

        <SequencerSettings class="mb-4" />

        <div class="sequencer-tracks-wrapper overflow-x-auto">
            <SequencerTracks />
        </div>

        <AppMasterVolume class="mt-4" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useSequencerStore } from '@/stores/sequencerStore';
import { storeToRefs } from 'pinia';
import SequencerStepTracker from '@/components/SequencerStepTracker.vue';
import SequencerPlaybackControls from '@/components/SequencerPlaybackControls.vue';
import SequencerSettings from '@/components/SequencerSettings.vue';
import SequencerTracks from '@/components/SequencerTracks.vue';
import AppMasterVolume from '@/components/AppMasterVolume.vue';

const sequencerStore = useSequencerStore();
const { isPlaying } = storeToRefs(sequencerStore);

/*
// Lifecycle hooks
onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
});

// Keyboard shortcut handler
const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
        event.preventDefault();
        if (isPlaying.value) {
            sequencerStore.pauseSequence();
        } else {
            sequencerStore.playSequence();
        }
    }
};
*/

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
