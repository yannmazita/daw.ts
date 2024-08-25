<template>
    <!-- Playback control section for the sequencer -->
    <div id="sequencer-container-playback" class="flex justify-center">
        <!-- Button to start the sequence playback -->
        <AppSmallButton @click="playbackManager.playSequence()">
            Play
        </AppSmallButton>
        <!-- Button to pause the sequence playback, enabled only when the sequence is playing -->
        <AppSmallButton @click="playbackManager.pauseSequence()" :disabled="!isPlaying">
            Pause
        </AppSmallButton>
        <!-- Button to stop the sequence playback -->
        <AppSmallButton @click="playbackManager.stopSequence()">
            Stop
        </AppSmallButton>
        <!-- Checkbox for toggling the loop mode of the sequence playback -->
        <AppSmallCheckbox v-model="checked">
            <template #rightLabel>
                Loop
            </template>
        </AppSmallCheckbox>
    </div>
</template>

<script setup lang="ts">
import { watch, inject, ref, Ref } from 'vue';
import { useSequencerStore } from '@/stores/sequencerStore';
import { storeToRefs } from 'pinia';
import { sequencerPlaybackManagerKey } from '@/utils/injection-keys';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import AppSmallButton from '@/components/AppSmallButton.vue';
import AppSmallCheckbox from '@/components/AppSmallCheckbox.vue';

const playbackManager = inject<SequencerPlaybackManager>(sequencerPlaybackManagerKey) as SequencerPlaybackManager;
// State for the checkbox, representing the loop status
const checked: Ref<boolean> = ref(false);

// Watching for changes in the checkbox state to update the loop status in the playback manager
watch(checked, (newValue) => {
    playbackManager.loopEnabled = newValue;
});

// Extracting the `isPlaying` state from the sequencer store to control the disabled state of the pause button
const { isPlaying } = storeToRefs(useSequencerStore());
</script>
