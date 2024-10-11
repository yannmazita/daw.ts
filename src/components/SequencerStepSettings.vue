<template>
    <h3 class="font-bold mb-4">Change step settings for step {{ props.stepPosition.stepIndex }} of track {{
        props.stepPosition.trackIndex }}</h3>
    <div class="flex flex-col justify-center">
        <div id="sequencer-step-settings-velocity-container" class="grid grid-cols-3 items-end">
            <div>
                velocity: {{ velocityValue }}
                <AppRangeBar v-model="velocityValue" :step="1" :max="127" />
            </div>
            <AppSmallCheckbox v-model="checks.velocityApplyToTrack">
                <template #rightLabel>Apply to track</template>
            </AppSmallCheckbox>
            <AppSmallCheckbox v-model="checks.velocityApplyToAllTracks">
                <template #rightLabel>Apply to all tracks</template>
            </AppSmallCheckbox>
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
            <AppSmallCheckbox v-model="checks.noteApplyToTrack">
                <template #rightLabel>Apply to track</template>
            </AppSmallCheckbox>
            <AppSmallCheckbox v-model="checks.noteApplyToAllTracks">
                <template #rightLabel>Apply to all tracks</template>
            </AppSmallCheckbox>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useSequencerStore } from '@/stores/sequencerStore';
import { ref, inject, reactive, watchEffect } from 'vue';
import { sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import AppRangeBar from '@/components/AppRangeBar.vue';
import AppSmallCheckbox from '@/components/AppSmallCheckbox.vue';
import { Note } from '@/utils/types';
import { StepPosition } from '@/utils/interfaces';

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
const checks = reactive({
    velocityApplyToTrack: false,
    velocityApplyToAllTracks: false,
    noteApplyToTrack: false,
    noteApplyToAllTracks: false,
});

watchEffect(() => {
    if (checks.velocityApplyToTrack) {
        trackManager.setStepVelocityToTrack(props.stepPosition.trackIndex, velocityValue.value ?? 1);
    } else if (checks.velocityApplyToAllTracks) {
        trackManager.setStepVelocityToAllTracks(velocityValue.value ?? 1);
    } else {
        trackManager.setStepVelocity(props.stepPosition.trackIndex, props.stepPosition.stepIndex, velocityValue.value ?? 1);
    }
    if (checks.noteApplyToTrack) {
        trackManager.setStepNoteToTrack(props.stepPosition.trackIndex, noteValue.value ?? Note.C4);
    } else if (checks.noteApplyToAllTracks) {
        trackManager.setStepNoteToAllTracks(noteValue.value ?? Note.C4);
    } else {
        trackManager.setStepNote(props.stepPosition.trackIndex, props.stepPosition.stepIndex, noteValue.value ?? Note.C4);
    }
});

</script>
