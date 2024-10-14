<template>
    <div id="sequencer-container-playback" class="flex flex-col items-center space-y-4">
        <div class="flex space-x-2">
            <AppSmallButton @click="playbackManager.playSequence()" :class="{ 'pulse-animation': isPlaying }">
                Play
            </AppSmallButton>
            <AppSmallButton @click="playbackManager.pauseSequence()" :disabled="disablePause">
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
import { ref, inject, watch, computed } from 'vue';
import { sequencerPlaybackManagerKey } from '@/utils/injection-keys';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import AppSmallButton from '@/components/AppSmallButton.vue';
import AppSmallCheckbox from '@/components/AppSmallCheckbox.vue';
import { SequenceStatus } from '@/utils/types';

const playbackManager = inject(sequencerPlaybackManagerKey) as SequencerPlaybackManager;

const loopEnabled = ref(playbackManager.loopEnabled);

const isPlaying = computed(() => playbackManager.getStatus() === SequenceStatus.Playing);
const disablePause = computed(() => (playbackManager.getStatus() === SequenceStatus.Paused) || (playbackManager.getStatus() === SequenceStatus.Stopped));

watch(loopEnabled, (newValue) => {
    playbackManager.loopEnabled = newValue;
});
</script>

<style scoped>
@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

.pulse-animation {
    animation: pulse 1s infinite;
}
</style>
