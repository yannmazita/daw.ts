<template>
    <div id="sequencer-container-playback" class="flex justify-center">
        <AppSmallButton @click="sequencerManager?.playSequence()">
            {{ 'Play' }}
        </AppSmallButton>
        <AppSmallButton @click="sequencerManager?.stopSequence()">
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
import { sequencerManagerKey } from '@/utils/injection-keys';
import { SequencerManager } from '@/services/SequencerManager';
import AppSmallButton from '@/components/AppSmallButton.vue';
import AppSmallCheckbox from '@/components/AppSmallCheckbox.vue';

const sequencerManager = inject<SequencerManager>(sequencerManagerKey) as SequencerManager;
const checked: Ref<boolean> = ref(false);

watch(checked, (newValue) => {
    sequencerManager.loopEnabled = newValue;
});
</script>
