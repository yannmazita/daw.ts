<template>
    <div id="sequencer-container-playback" class="flex justify-center">
        <AppSmallButton @click="sequencerService?.playSequence()">
            {{ 'Play' }}
        </AppSmallButton>
        <AppSmallButton @click="sequencerService?.stopSequence()">
            {{ 'Stop' }}
        </AppSmallButton>
        <AppSmallButton @click="sequencerService?.toggleLoop()">
            {{ 'Loop' }}
        </AppSmallButton>
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { sequencerServiceKey } from '@/utils/injection-keys.ts';
import { SequencerService } from '@/services/SequencerServices.ts';
import AppSmallButton from '@/components/AppSmallButton.vue';

const sequencerService = inject<SequencerService>(sequencerServiceKey);
</script>
