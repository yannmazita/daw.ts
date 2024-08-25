<template>
    <!-- Instruments Assignment Dialog Content -->
    <!-- This component displays a selection menu for assigning instruments to a specific track. -->
    <div id="sequencer-track-settings-dialog-instruments-content-container">
        <!-- Title displaying the track index dynamically -->
        <h3 class="font-bold mb-4">Assign instrument to Track {{ props.context?.trackIndex }}</h3>
        <!-- Instrument selection interface -->
        <div class="flex flex-row justify-center w-full">
            <!-- Dropdown menu for selecting an instrument from the pool -->
            <select v-model="selectedInstrument" class="select select-bordered select-sm w-full max-w-xs">
                <option disabled value="">Select an instrument</option>
                <!-- Dynamically lists all available instruments from the instrument pool -->
                <option v-for="(_, name) in instrumentPool" :key="name" :value="name">
                    {{ name }}
                </option>
            </select>
            <!-- Button to confirm the assignment of the selected instrument to the track -->
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

interface Props {
    context: { trackIndex: number } | null;
}
// Default prop values, including a nullable context for track identification
const props: Props = withDefaults(defineProps<Props>(), {
    context: null,
});

// Injection of the sequencer instrument manager to access the instrument pool
const sequencerInstrumentManager: SequencerInstrumentManager = inject<SequencerInstrumentManager>(sequencerInstrumentManagerKey) as SequencerInstrumentManager;
// Model for the selected instrument in the dropdown
const selectedInstrument: Ref<InstrumentName | null> = ref(null);

// Function to assign the selected instrument to the specified track
function assignInstrument() {
    if (selectedInstrument.value && sequencerInstrumentManager && props.context !== null) {
        if (props.context.trackIndex !== null) {
            sequencerInstrumentManager.setInstrumentForTrack(props.context.trackIndex, selectedInstrument.value);
        }
    }
}

// Computed property to fetch and monitor the instrument pool for changes
const instrumentPool = computed(() => sequencerInstrumentManager ? sequencerInstrumentManager.instrumentPool : {});
</script>
