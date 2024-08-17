<template>
    <div class="flex justify-center h-full max-w-full">
        <component :is="visibleComponent" />
        <Sequencer></Sequencer>
    </div>
</template>
<script setup lang="ts">
import { computed, provide } from 'vue';
import { SequencerManager } from '@/services/SequencerManager';
import { sequencerManagerKey } from '@/utils/injection-keys';
import Sequencer from '@/components/Sequencer.vue';

const visibleComponent = computed(() => {
    return null;
});

const sequencerManager = new SequencerManager();
provide(sequencerManagerKey, sequencerManager);
</script>
