<template>
    <div id="sequencer-tracks-container" class="flex flex-col space-y-2">
        <div :id="`sequencer-track-${track.id}`" v-for="track in trackStore.tracks" :key="track.id"
            class="flex items-center space-x-2 hover:opacity-100">
            <div class="flex items-center space-x-2 hover:opacity-100 opacity-70 transition ease-in-out duration-150">
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
                <div :id="`sequencer-track-${track.id}-step-${stepIndex}`" v-for="(_, stepIndex) in track.steps"
                    :key="stepIndex" @click="trackManager.toggleStepActive(track.id, stepIndex)"
                    class="w-8 h-8 m-0.5 rounded-md cursor-pointer transition-all duration-150" :class="{
                        'bg-ts-blue': trackManager.getStepActive(track.id, stepIndex),
                        'bg-gray-200': !trackManager.getStepActive(track.id, stepIndex),
                        'ring-2 ring-yellow-400': isCurrentStep(stepIndex),
                        'opacity-50': trackManager.getTrackMuted(track.id) && !trackManager.getTrackSolo(track.id),
                    }"
                    @contextmenu.prevent="handleContextMenu($event, { trackIndex: track.id, stepIndex: stepIndex })">
                </div>
            </div>
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
</script>
