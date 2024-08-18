<template>
    <div id="sequencer-tracks-container" v-for="track in tracks" :key="track.id">
        <Track :track-id="track.id" :steps="track.steps" />
    </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Track from '@/components/Track.vue';
import { useSequencerStore } from '@/stores/sequencerStore';
const { tracks } = storeToRefs(useSequencerStore());
</script>
