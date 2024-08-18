<template>
    <div id="sequencer-tracks-container" v-for="track in tracks" :key="track.id">
        <Track :track-id="track.id" :steps="track.steps" />
    </div>
</template>
<script setup lang="ts">
import { inject, computed } from 'vue';
import Track from '@/components/Track.vue';
import { sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';

const sequencerManager = inject<SequencerTrackManager>(sequencerTrackManagerKey) as SequencerTrackManager;
const tracks = computed(() => sequencerManager.tracks.value);
</script>
