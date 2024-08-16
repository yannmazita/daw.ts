<template>
    <div id="sequencer-tracks-container" v-for="track in tracks" :key="track.id">
        <Track :track-id="track.id" :steps="track.steps" />
    </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { useSequencerStore } from '@/stores/sequencerStore.ts';
import Track from '@/components/Track.vue';

const { tracks } = storeToRefs(useSequencerStore());
onBeforeUnmount(() => {
    //sequencerService?.dispose();
})
</script>
