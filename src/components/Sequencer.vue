<template>
    <!-- Main container for the sequencer components -->
    <div id="sequencer-container">
        <!-- Displays the current step position and allows user to navigate through steps -->
        <SequencerStepTracker></SequencerStepTracker>
        <!-- Provides settings for configuring the sequencer like tracks, steps, and BPM -->
        <SequencerSettings></SequencerSettings>
        <!-- Displays all the tracks and manages individual steps within each track -->
        <SequencerTracks></SequencerTracks>
        <!-- Provides playback controls for the sequencer such as play, pause, and stop -->
        <SequencerPlaybackControls></SequencerPlaybackControls>
    </div>
</template>

<script setup lang="ts">
import SequencerSettings from '@/components/SequencerSettings.vue';
import SequencerPlaybackControls from '@/components/SequencerPlaybackControls.vue';
import SequencerTracks from '@/components/SequencerTracks.vue';
import SequencerStepTracker from '@/components/SequencerStepTracker.vue';
</script>
