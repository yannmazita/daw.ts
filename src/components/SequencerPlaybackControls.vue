<template>
    <div id="sequencer-container-playback" class="flex justify-center">
        <AppSmallButton @click="sequencerService?.playSequence()">
            {{ 'Play' }}
        </AppSmallButton>
        <AppSmallButton @click="sequencerService?.stopSequence()">
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
import { sequencerServiceKey } from '@/utils/injection-keys.ts';
import { SequencerService } from '@/services/SequencerServices.ts';
import AppSmallButton from '@/components/AppSmallButton.vue';
import AppSmallCheckbox from '@/components/AppSmallCheckbox.vue';

const sequencerService = inject<SequencerService>(sequencerServiceKey) as SequencerService;
const checked: Ref<boolean> = ref(false);

watch(checked, (newValue) => {
    sequencerService.loopEnabled = newValue;
});
</script>
