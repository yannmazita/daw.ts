<template>
    <div id="sequencer-track-settings-dialog-instruments-paine">
        <h3 class="font-bold mb-4">Assign instrument to Track {{ props.trackIndex }}</h3>
        <div class="flex flex-row justify-center w-full">
            <select v-model="selectedInstrument" class="select select-bordered select-sm w-full max-w-xs">
                <option disabled value="">Select an instrument</option>
                <option v-for="(_, name) in instrumentPool" :key="name" :value="name">
                    {{ name }}
                </option>
            </select>
            <AppSmallButton @click="assignInstrument">Assign to Track</AppSmallButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, ref, computed, Ref } from 'vue';
import { sequencerInstrumentManagerKey } from '@/utils/injection-keys';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { InstrumentName } from '@/utils/types';
import AppSmallButton from '@/components/AppSmallButton.vue';

const props = defineProps<{
    trackIndex: number
}>()

// Injection of the sequencer instrument manager to access the instrument pool
const sequencerInstrumentManager: SequencerInstrumentManager = inject<SequencerInstrumentManager>(sequencerInstrumentManagerKey) as SequencerInstrumentManager;
// Model for the selected instrument in the dropdown
const selectedInstrument: Ref<InstrumentName | null> = ref(null);

// Function to assign the selected instrument to the specified track
function assignInstrument() {
    if (selectedInstrument.value && sequencerInstrumentManager) {
        sequencerInstrumentManager.setInstrumentForTrack(props.trackIndex, selectedInstrument.value);
    }
}

// Computed property to fetch and monitor the instrument pool for changes
const instrumentPool = computed(() => sequencerInstrumentManager ? sequencerInstrumentManager.instrumentPool : {});
</script>
