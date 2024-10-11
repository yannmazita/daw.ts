<template>
    <div id="sequencer-track-settings-dialog-instruments-paine">
        <h3 class="font-bold mb-4">Assign instrument to Track {{ props.trackIndex }}</h3>
        <div class="flex flex-row justify-center w-full">
            <select v-model="selectedInstrument" class="select select-bordered select-sm w-full max-w-xs">
                <option disabled value="">Select an instrument</option>
                <option v-for="instrumentName in instrumentNames" :key="instrumentName" :value="instrumentName">
                    {{ instrumentName }}
                </option>
            </select>
            <AppSmallButton @click="setTrackInstrument">Assign to Track</AppSmallButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, ref, Ref } from 'vue';
import { sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { InstrumentName } from '@/utils/types';
import AppSmallButton from '@/components/AppSmallButton.vue';

const props = defineProps<{
    trackIndex: number
}>();

const trackManager: SequencerTrackManager = inject(sequencerTrackManagerKey) as SequencerTrackManager;
const selectedInstrument: Ref<InstrumentName | null> = ref(null);

const instrumentNames = Object.values(InstrumentName);

function setTrackInstrument() {
    if (selectedInstrument.value) {
        trackManager.setTrackInstrument(props.trackIndex, selectedInstrument.value);
    }
}
</script>
