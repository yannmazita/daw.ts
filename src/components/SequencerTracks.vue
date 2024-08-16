<template>
    <div id="sequencer-tracks-container" v-for="track in tracks" :key="track.id">
        <Track :track-id="track.id" :steps="track.steps" />
    </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, inject, computed } from 'vue';
import Track from '@/components/Track.vue';
import { SequencerService } from '@/services/SequencerServices';
import { sequencerServiceKey } from '@/utils/injection-keys';

const sequencerService = inject<SequencerService>(sequencerServiceKey);
const tracks = computed(() => sequencerService?.tracks.value);

onBeforeUnmount(() => {
    //sequencerService?.dispose();
})
</script>
