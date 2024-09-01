<template>
    <div id="sequencer-container flex justify-center">
        <SequencerStepTracker></SequencerStepTracker>
        <SequencerSettings></SequencerSettings>
        <SequencerTracks></SequencerTracks>
        <SequencerPlaybackControls></SequencerPlaybackControls>
    </div>
</template>

<script setup lang="ts">
import SequencerSettings from '@/components/SequencerSettings.vue';
import SequencerPlaybackControls from '@/components/SequencerPlaybackControls.vue';
import SequencerTracks from '@/components/SequencerTracks.vue';
import SequencerStepTracker from '@/components/SequencerStepTracker.vue';
import { onMounted } from 'vue';

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
