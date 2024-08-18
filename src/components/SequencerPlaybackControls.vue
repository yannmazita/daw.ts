<template>
    <div id="sequencer-container-playback" class="flex justify-center">
        <AppSmallButton @click="playbackManager.playSequence()">
            {{ 'Play' }}
        </AppSmallButton>
        <AppSmallButton @click="playbackManager.stopSequence()">
            {{ 'Stop' }}
        </AppSmallButton>
        <AppSmallCheckbox v-model="checked">
            <template #rightLabel>
                Loop
            </template>
        </AppSmallCheckbox>
    </div>
</template>

<script setup lang="ts">
import { watch, inject, ref, Ref } from 'vue';
import { sequencerPlaybackManagerKey } from '@/utils/injection-keys';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import AppSmallButton from '@/components/AppSmallButton.vue';
import AppSmallCheckbox from '@/components/AppSmallCheckbox.vue';

const playbackManager = inject<SequencerPlaybackManager>(sequencerPlaybackManagerKey) as SequencerPlaybackManager;
const checked: Ref<boolean> = ref(false);

watch(checked, (newValue) => {
    playbackManager.loopEnabled = newValue;
});
</script>
