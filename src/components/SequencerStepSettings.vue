<template>
    <h3 class="font-bold mb-4">Change step settings for step {{ props.stepIndex }} of track {{ props.trackIndex }}</h3>
    <div>
        velocity {{ velocityValue }} :
        <AppRangeBar v-model="velocityValue" :step="1" :max="127" />
    </div>
</template>
<script setup lang="ts">
import { ref, watch, inject, onMounted } from 'vue';
import { sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import AppRangeBar from '@/components/AppRangeBar.vue';

const props = defineProps<{
    trackIndex: number
    stepIndex: number
}>()
defineOptions({
    inheritAttrs: false // Component won't inherit attributes and trigger Vue warning about @add-classes in AppWindow
})

const trackManager = inject<SequencerTrackManager>(sequencerTrackManagerKey) as SequencerTrackManager;
const velocityValue = ref(0);

watch(velocityValue, (newValue) => {
    trackManager.setStepVelocity(props.trackIndex, props.stepIndex, newValue);
});

onMounted(() => {
    velocityValue.value = trackManager.getStepVelocity(props.trackIndex, props.stepIndex);
});
</script>
