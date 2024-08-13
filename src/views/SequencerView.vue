<template>
    <div class="flex justify-center h-full max-w-full">
        <component :is="visibleComponent" />
        <Sequencer></Sequencer>
    </div>
</template>
<script setup lang="ts">
import { computed, provide } from 'vue';
import { SequencerService } from '@/services/SequencerServices.ts';
import Sequencer from '@/components/Sequencer.vue';
import { sequencerServiceKey } from '@/utils/injection-keys.ts';

const visibleComponent = computed(() => {
    return null;
});

const sequencerService = new SequencerService();
provide(sequencerServiceKey, sequencerService);
</script>
