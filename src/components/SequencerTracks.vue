<template>
    <div id="sequencer-tracks-container" v-for="track in tracks" :key="track.id">
        <Track :track-id="track.id" :steps="track.steps" />
    </div>
</template>
<script setup lang="ts">
import { inject, computed } from 'vue';
import Track from '@/components/Track.vue';
import { SequencerManager } from '@/services/SequencerManager';
import { sequencerManagerKey } from '@/utils/injection-keys';

const sequencerManager = inject<SequencerManager>(sequencerManagerKey);
const tracks = computed(() => sequencerManager?.tracks.value);
</script>
