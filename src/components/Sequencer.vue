<template>
    <div id="sequencer-container">
        <SequencerTrackSettings></SequencerTrackSettings>
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
import SequencerTrackSettings from '@/components/SequencerTrackSettings.vue';
import SequencerStepTracker from '@/components/SequencerStepTracker.vue';
</script>
