<template>
    <div id="sequencer-tracks-container" class="flex flex-col">
        <div class="flex">
            <!-- Spacer for mute/solo buttons -->
            <div class="track-controls-spacer flex-shrink-0"></div>
            <SequencerStepTracker class="flex-grow" />
        </div>
        <div class="sequencer-scrollable-container">
            <div class="sequencer-content" :style="{ width: `${contentWidth}px` }">
                <TransitionGroup name="sequencer-track" tag="div" class="flex flex-col w-full">
                    <div :id="`sequencer-track-${track.id}`" v-for="track in trackStore.tracks" :key="track.id"
                        class="sequencer-track flex items-center hover:opacity-100">
                        <div
                            class="track-controls flex-shrink-0 flex items-center space-x-2 hover:opacity-100 opacity-70 transition ease-in-out duration-150">
                            <button @click="trackManager.toggleTrackMuted(track.id)"
                                :class="{ 'bg-red-500': trackManager.getTrackMuted(track.id), 'bg-gray-300': !trackManager.getTrackMuted(track.id) }"
                                class="w-8 h-8 rounded-full focus:outline-none transition-colors duration-150">
                                M
                            </button>
                            <button @click="trackManager.toggleTrackSolo(track.id)"
                                :class="{ 'bg-green-500': trackManager.getTrackSolo(track.id), 'bg-gray-300': !trackManager.getTrackSolo(track.id) }"
                                class="w-8 h-8 rounded-full focus:outline-none transition-colors duration-150">
                                S
                            </button>
                        </div>
                        <div class="track-steps flex-grow flex">
                            <div :id="`sequencer-track-${track.id}-step-${stepIndex}`"
                                v-for="(_, stepIndex) in track.steps" :key="stepIndex"
                                @click="trackManager.toggleStepActive(track.id, stepIndex)"
                                class="min-w-8 w-8 h-8 m-0.5 cursor-pointer transition-all duration-150" :class="{
                                    'bg-ts-blue': trackManager.getStepActive(track.id, stepIndex),
                                    'bg-gray-200': !trackManager.getStepActive(track.id, stepIndex),
                                    'ring-2 ring-yellow-400': isCurrentStep(stepIndex),
                                    'opacity-50': trackManager.getTrackMuted(track.id) && !trackManager.getTrackSolo(track.id),
                                }"
                                @contextmenu.prevent="handleContextMenu($event, { trackIndex: track.id, stepIndex: stepIndex })">
                            </div>
                        </div>
                    </div>
                </TransitionGroup>
            </div>
        </div>
        <div class="flex">
            <!-- Spacer for mute/solo buttons -->
            <div class="track-controls-spacer flex-shrink-0"></div>
            <SequencerPlaybackControls class="flex-grow" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, markRaw } from 'vue';
import { useContextMenuStore } from '@/stores/contextMenuStore';
import { AppContextMenuItem } from '@/models/AppContextMenuItem';
import { AddTrackCommand, RemoveTrackCommand, OpenTrackSettings, OpenStepSettings } from '@/services/commands/SequencerCommands';
import { sequencerInstrumentManagerKey, sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { StepPosition, WindowDualPaneContent } from '@/utils/interfaces';
import SequencerTrackSettingsInstrumentsPane from './SequencerTrackSettingsInstrumentsPane.vue';
import SequencerTrackSettingsEffectsPane from './SequencerTrackSettingsEffectsPane.vue';
import SequencerPlaybackControls from './SequencerPlaybackControls.vue';
import SequencerStepTracker from './SequencerStepTracker.vue';
import { useStructureStore } from '@/stores/structureStore';
import { useTrackStore } from '@/stores/trackStore';
import { usePlaybackStore } from '@/stores/playbackStore';

const instrumentManager = inject(sequencerInstrumentManagerKey) as SequencerInstrumentManager;
const trackManager = inject(sequencerTrackManagerKey) as SequencerTrackManager;

const menuStore = useContextMenuStore();
const playbackStore = usePlaybackStore();
const structureStore = useStructureStore();
const trackStore = useTrackStore();


const isCurrentStep = computed(() => (stepIndex: number) => stepIndex === playbackStore.state.visualStep);

function createContextMenuItems(position: StepPosition) {
    if (structureStore.isTrackSelectionValid()) {
        const contents: WindowDualPaneContent[] = [
            { label: 'Instrument', component: markRaw(SequencerTrackSettingsInstrumentsPane) },
            { label: 'Effects', component: markRaw(SequencerTrackSettingsEffectsPane) },
        ]
        const contextMenuItems = [
            new AppContextMenuItem('Add track', new AddTrackCommand(position.trackIndex + 1, instrumentManager)),
            new AppContextMenuItem('Remove track', new RemoveTrackCommand(position.trackIndex, instrumentManager)),
            new AppContextMenuItem('Track settings', new OpenTrackSettings(contents, position.trackIndex)),
        ];
        if (structureStore.isStepSelectionValid()) {
            contextMenuItems.push(new AppContextMenuItem('Step settings', new OpenStepSettings(position)));
        }

        return contextMenuItems;
    }
}

// Handles right-click context menu for track operations
function handleContextMenu(event: MouseEvent, position: StepPosition) {
    structureStore.rightClickSelect(position);

    const items = createContextMenuItems(position);
    if (items) {
        menuStore.clearContextualItems(); // Clear previous contextual items
        menuStore.addContextualItems(items); // Add new contextual items
        menuStore.openContextMenu(event.clientX, event.clientY);
    }
}

const contentWidth = computed(() => {
    return 80 + (structureStore.state.numSteps * 36); // 80px for controls, 36px per step
});
</script>
<style scoped>
.track-controls {
    min-width: 72px;
    width: 72px;
    /* 2 buttons (32px each) + 8px space between */
    margin-right: 8px;
    /* Match the margin of the first step */
}

.track-controls-spacer {
    min-width: 80px;
    width: 80px;
    /* Same as .track-controls width + margin-right */
}

.sequencer-track-move {
    transition: transform 0.5s;
}

.sequencer-track-enter-active,
.sequencer-track-leave-active {
    transition: all 0.5s ease;
}

.sequencer-track-enter-from,
.sequencer-track-leave-to {
    opacity: 0;
    transform: translateX(-30px);
}

.sequencer-track-leave-active {
    position: absolute;
}
</style>
