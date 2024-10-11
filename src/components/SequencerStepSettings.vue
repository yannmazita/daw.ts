<template>
    <h3 class="font-bold mb-4">Change step settings for step {{ props.stepPosition.stepIndex }} of track {{
        props.stepPosition.trackIndex }}</h3>
    <div class="flex flex-col justify-center">
        <div id="sequencer-step-settings-velocity-container" class="grid grid-cols-3 items-end">
            <div>
                velocity: {{ velocityValue }}
                <AppRangeBar v-model="velocityValue" :step="1" :max="127" />
            </div>
            <AppSmallButton @click="setTrackVelocity()">
                Apply to Track
            </AppSmallButton>
        </div>
        <div id="sequencer-step-settings-note-container" class="grid grid-cols-3 items-end">
            <div>
                note: {{ noteValue }}
                <select v-model="noteValue" class="select select-bordered select-sm w-full max-w-xs">
                    <option disabled value="">Select a note</option>
                    <option v-for="note in Object.keys(Note)" :key="note" :value="note">
                        {{ note }}
                    </option>
                </select>
            </div>
            <AppSmallButton @click="setTrackNote()">
                Apply to Track
            </AppSmallButton>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useSequencerStore } from '@/stores/sequencerStore';
import { ref, inject, watchEffect } from 'vue';
import { sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import AppRangeBar from '@/components/AppRangeBar.vue';
import { Note } from '@/utils/types';
import { StepPosition } from '@/utils/interfaces';
import AppSmallButton from '@/components/AppSmallButton.vue';

const props = defineProps<{
    stepPosition: StepPosition;
}>()
defineOptions({
    inheritAttrs: false // Component won't inherit attributes and trigger Vue warning about @add-classes in AppWindow
})

const sequencerStore = useSequencerStore();
const trackManager = inject<SequencerTrackManager>(sequencerTrackManagerKey) as SequencerTrackManager;
const noteValue = ref(sequencerStore.getStepNote(props.stepPosition.trackIndex, props.stepPosition.stepIndex));
const velocityValue = ref(sequencerStore.getStepVelocity(props.stepPosition.trackIndex, props.stepPosition.stepIndex));

function setTrackVelocity() {
    trackManager.setTrackVelocity(props.stepPosition.trackIndex, velocityValue.value ?? 1);
}
function setTrackNote() {
    trackManager.setTrackNote(props.stepPosition.trackIndex, noteValue.value ?? Note.C4);
}

watchEffect(() => {
    trackManager.setStepVelocity(props.stepPosition.trackIndex, props.stepPosition.stepIndex, velocityValue.value ?? 1);
    trackManager.setStepNote(props.stepPosition.trackIndex, props.stepPosition.stepIndex, noteValue.value ?? Note.C4);
});

</script>
