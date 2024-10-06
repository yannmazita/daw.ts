<template>
    <div ref="stepRef" class="step-cell w-8 h-8 m-0.5 rounded-md cursor-pointer transition-all duration-150 relative"
        :class="stepClasses" @click="handleLeftClick(props.stepId)" @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false">
        <!-- Velocity indicator -->
        <div class="velocity-indicator absolute bottom-0 left-0 right-0 bg-white opacity-50 transition-all duration-150"
            :style="{ height: `${step.velocity * 100}%` }"></div>

        <!-- Note indicator (for pitched instruments) -->
        <div v-if="step.note" class="note-indicator absolute top-1 left-1 text-xs font-bold text-white">
            {{ step.note }}
        </div>

        <!-- Tooltip -->
        <div v-if="showTooltip"
            class="tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-90 whitespace-nowrap">
            {{ tooltipContent }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { SequencerStep } from '@/models/SequencerModels';

interface Props {
    trackId: number;
    stepId: number;
    step: SequencerStep;
    isCurrentStep: boolean;
    isMuted: boolean;
}

const props = defineProps<Props>();

const trackManager = inject(sequencerTrackManagerKey) as SequencerTrackManager;

const stepRef = ref<HTMLElement | null>(null);
const showTooltip = ref(false);

const stepClasses = computed(() => ({
    'bg-ts-blue': props.step.active,
    'bg-gray-200': !props.step.active,
    'ring-2 ring-yellow-400': props.isCurrentStep,
    'opacity-50': props.isMuted,
}));

const tooltipContent = computed(() => {
    return `Note: ${props.step.note}, Velocity: ${Math.round(props.step.velocity * 100)}%`;
});

// Handles the left-click on the step, which toggles its active state.
function handleLeftClick(stepIndex: number) {
    trackManager.toggleStepActiveState(props.trackId, stepIndex);
}
</script>

<style scoped>
.step-cell:hover {
    transform: scale(1.05);
}

/* need to update this */
.tooltip {
    z-index: 10;
}
</style>
