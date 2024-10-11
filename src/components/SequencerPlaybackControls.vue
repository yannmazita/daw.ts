<template>
    <div id="sequencer-container-playback" class="flex flex-col items-center space-y-4">
        <div class="flex space-x-2">
            <AppSmallButton @click="playbackManager.playSequence()">
                Play
            </AppSmallButton>
            <AppSmallButton @click="playbackManager.pauseSequence()"
                :disabled="playback.status === SequenceStatus.Paused">
                Pause
            </AppSmallButton>
            <AppSmallButton @click="playbackManager.stopSequence()">
                Stop
            </AppSmallButton>
            <AppSmallCheckbox v-model="loopEnabled">
                <template #rightLabel>Loop</template>
            </AppSmallCheckbox>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSequencerStore } from '@/stores/sequencerStore';
import { sequencerPlaybackManagerKey } from '@/utils/injection-keys';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import AppSmallButton from '@/components/AppSmallButton.vue';
import AppSmallCheckbox from '@/components/AppSmallCheckbox.vue';
import { SequenceStatus } from '@/utils/types';

const playbackManager = inject(sequencerPlaybackManagerKey) as SequencerPlaybackManager;
const sequencerStore = useSequencerStore();
const { playback } = storeToRefs(sequencerStore);

const loopEnabled = ref(playbackManager.loopEnabled);

watch(loopEnabled, (newValue) => {
    playbackManager.loopEnabled = newValue;
});
</script>
