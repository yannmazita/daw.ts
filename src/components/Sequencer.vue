<template>
    <div id="sequencer-container">
        <SequencerSettings></SequencerSettings>
        <div id="sequencer-container-tracks" v-for="track in tracks" :key="track.id">
            <Track :track-id="track.id" :steps="track.steps" />
        </div>
        <SequencerPlaybackControls></SequencerPlaybackControls>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { useSequencerStore } from '@/stores/sequencerStore.ts';
import Track from '@/components/Track.vue';
import SequencerSettings from '@/components/SequencerSettings.vue';
import SequencerPlaybackControls from '@/components/SequencerPlaybackControls.vue';

const { tracks } = storeToRefs(useSequencerStore());


onBeforeUnmount(() => {
    //sequencerService?.dispose();
})
</script>
