<template>
    <div id="sequencer-track-settings-dialog-instruments-content-container">
        <h3 class="font-bold mb-4">Assign instrument to Track {{ rightClickTrackPos }}</h3>
        <div class="flex flex-row justify-center w-full">
            <select v-model="selectedInstrument" class="select select-bordered select-sm w-full max-w-xs">
                <option disabled value="">Select an instrument</option>
                <option v-for="(instrument, name) in instrumentPool" :key="name" :value="name">
                    {{ name }}
                </option>
            </select>
            <AppSmallButton @click="assignInstrument">Assign to Track</AppSmallButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, ref, computed, Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSequencerStore } from '@/stores/sequencerStore';
import { sequencerInstrumentManagerKey } from '@/utils/injection-keys';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { InstrumentName } from '@/utils/types';
import AppSmallButton from '@/components/AppSmallButton.vue';

const sequencerInstrumentManager: SequencerInstrumentManager = inject<SequencerInstrumentManager>(sequencerInstrumentManagerKey) as SequencerInstrumentManager;
const selectedInstrument: Ref<InstrumentName | null> = ref(null);

const { rightClickTrackPos } = storeToRefs(useSequencerStore());

function assignInstrument() {
    if (selectedInstrument.value && sequencerInstrumentManager && rightClickTrackPos !== null) {
        if (rightClickTrackPos.value !== null) {
            sequencerInstrumentManager.setInstrumentForTrack(rightClickTrackPos.value, selectedInstrument.value);
        }
    }
}

const instrumentPool = computed(() => sequencerInstrumentManager ? sequencerInstrumentManager.instrumentPool : {});
</script>
