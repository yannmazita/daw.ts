<template>
    <div id="piano-roll-playback-container" class="flex justify-center">
        <AppSmallButton @click="play">
            Play
        </AppSmallButton>
        <AppSmallButton @click="pause" :disabled="!isPlaying">
            Pause
        </AppSmallButton>
        <AppSmallButton @click="stop">
            Stop
        </AppSmallButton>
        <AppSmallCheckbox v-model="checked">
            <template #rightLabel>
                Loop
            </template>
        </AppSmallCheckbox>
    </div>
</template>

<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import AppSmallButton from '@/components/AppSmallButton.vue';
import AppSmallCheckbox from '@/components/AppSmallCheckbox.vue';
import { PianoRollPlaybackManager } from '@/services/PianoRollPlaybackManager';
import { pianoRollPlaybackManagerKey } from '@/utils/injection-keys';
import { usePianoRollStore } from '@/stores/usePianoRollStore';

const pianoRollStore = usePianoRollStore();
const playbackManager = inject<PianoRollPlaybackManager>(pianoRollPlaybackManagerKey) as PianoRollPlaybackManager;
const isPlaying = ref(false);
const checked = ref(false);

function play() {
    playbackManager.startPlayback();
    isPlaying.value = true;
}

function pause() {
    playbackManager.pausePlayback();
    isPlaying.value = false;
}

function stop() {
    playbackManager.stopPlayback();
    isPlaying.value = false;
}

// Watching for changes in the checkbox state to update the loop status in the playback manager
watch(checked, (newValue) => {
    playbackManager.loopEnabled = newValue;
});

watch(() => pianoRollStore.notes, (newNotes, oldNotes) => {
    playbackManager.scheduleNotes(); // Reschedule notes on change
}, { deep: true });
</script>
