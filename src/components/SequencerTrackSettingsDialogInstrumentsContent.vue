<template>
    <div id="sequencer-track-settings-dialog-instruments-content-container">
        <h3 class="font-bold mb-4">Assign instrument to Track {{ props.context?.trackIndex }}</h3>
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
import { sequencerInstrumentManagerKey } from '@/utils/injection-keys';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { InstrumentName } from '@/utils/types';
import AppSmallButton from '@/components/AppSmallButton.vue';

interface Props {
    context: { trackIndex: number } | null;
}
const props: Props = withDefaults(defineProps<Props>(), {
    context: null,
});


const sequencerInstrumentManager: SequencerInstrumentManager = inject<SequencerInstrumentManager>(sequencerInstrumentManagerKey) as SequencerInstrumentManager;
const selectedInstrument: Ref<InstrumentName | null> = ref(null);

function assignInstrument() {
    if (selectedInstrument.value && sequencerInstrumentManager && props.context !== null) {
        if (props.context.trackIndex !== null) {
            sequencerInstrumentManager.setInstrumentForTrack(props.context.trackIndex, selectedInstrument.value);
        }
    }
}

const instrumentPool = computed(() => sequencerInstrumentManager ? sequencerInstrumentManager.instrumentPool : {});
</script>
