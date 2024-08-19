<template>
    <div class="flex justify-center h-full max-w-full">
        <component :is="visibleComponent" />
        <Sequencer></Sequencer>
    </div>
</template>
<script setup lang="ts">
import { computed, provide } from 'vue';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { sequencerInstrumentManagerKey, sequencerPlaybackManagerKey, sequencerTrackManagerKey } from '@/utils/injection-keys.ts';
import Sequencer from '@/components/Sequencer.vue';

const visibleComponent = computed(() => {
    return null;
});

const sequencerInstrumentManager = new SequencerInstrumentManager();
const sequencerPlaybackManager = new SequencerPlaybackManager(sequencerInstrumentManager);
const sequencerTrackManager = new SequencerTrackManager(sequencerPlaybackManager);

provide(sequencerInstrumentManagerKey, sequencerInstrumentManager);
provide(sequencerTrackManagerKey, sequencerTrackManager);
provide(sequencerPlaybackManagerKey, sequencerPlaybackManager);
</script>
