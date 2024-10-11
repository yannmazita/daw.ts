<template>
    <div id="sequencer-tracks-container" class="flex flex-col space-y-2">
        <div :id="`sequencer-track-${track.id}`" v-for="track in structure.tracks" :key="track.id"
            class="flex items-center space-x-2 hover:opacity-100">
            <div class="flex items-center space-x-2 hover:opacity-100 opacity-70 transition ease-in-out duration-150">
                <button @click="toggleTrackMute(track.id)"
                    :class="{ 'bg-red-500': track.muted, 'bg-gray-300': !track.muted }"
                    class="w-8 h-8 rounded-full focus:outline-none transition-colors duration-150">
                    M
                </button>
                <button @click="toggleTrackSolo(track.id)"
                    :class="{ 'bg-green-500': track.solo, 'bg-gray-300': !track.solo }"
                    class="w-8 h-8 rounded-full focus:outline-none transition-colors duration-150">
                    S
                </button>
            </div>
            <div class="track-steps flex-grow flex">
                <div :id="`sequencer-track-${track.id}-step-${stepIndex}`" v-for="(step, stepIndex) in track.steps"
                    :key="stepIndex" @click="toggleStep(track.id, stepIndex)"
                    class="w-8 h-8 m-0.5 rounded-md cursor-pointer transition-all duration-150" :class="{
                        'bg-ts-blue': step.active,
                        'bg-gray-200': !step.active,
                        'ring-2 ring-yellow-400': isCurrentStep(stepIndex),
                        'opacity-50': track.muted && !track.solo
                    }"
                    @contextmenu.prevent="handleContextMenu($event, { trackIndex: track.id, stepIndex: stepIndex })">
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, markRaw } from 'vue';
import { storeToRefs } from 'pinia';
import { useSequencerStore } from '@/stores/sequencerStore';
import { useContextMenuStore } from '@/stores/contextMenuStore';
import { AppContextMenuItem } from '@/models/AppContextMenuItem';
import { AddTrackCommand, RemoveTrackCommand, OpenTrackSettings, OpenStepSettings } from '@/services/commands/SequencerCommands';
import { sequencerTrackManagerKey, sequencerInstrumentManagerKey } from '@/utils/injection-keys';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { StepPosition, WindowDualPaneContent } from '@/utils/interfaces';
import SequencerTrackSettingsInstrumentsPane from './SequencerTrackSettingsInstrumentsPane.vue';
import SequencerTrackSettingsEffectsPane from './SequencerTrackSettingsEffectsPane.vue';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';

const sequencerStore = useSequencerStore();
const menuStore = useContextMenuStore();
const { playback, structure } = storeToRefs(sequencerStore);

const trackManager = inject(sequencerTrackManagerKey) as SequencerTrackManager;
const instrumentManager = inject(sequencerInstrumentManagerKey) as SequencerInstrumentManager;

const isCurrentStep = computed(() => (stepIndex: number) => stepIndex === playback.value.visualStep);

function toggleStep(trackIndex: number, stepIndex: number) {
    sequencerStore.toggleStepActive(trackIndex, stepIndex);
}

function toggleTrackMute(trackIndex: number) {
    trackManager.toggleTrackMute(trackIndex);
}

function toggleTrackSolo(trackIndex: number) {
    trackManager.toggleTrackSolo(trackIndex);
}

function createContextMenuItems(position: StepPosition) {
    if (sequencerStore.isTrackSelectionValid()) {
        const contents: WindowDualPaneContent[] = [
            { label: 'Instrument', component: markRaw(SequencerTrackSettingsInstrumentsPane) },
            { label: 'Effects', component: markRaw(SequencerTrackSettingsEffectsPane) },
        ]
        const contextMenuItems = [
            new AppContextMenuItem('Add track', new AddTrackCommand(position.trackIndex + 1, instrumentManager)),
            new AppContextMenuItem('Remove track', new RemoveTrackCommand(position.trackIndex, instrumentManager)),
            new AppContextMenuItem('Track settings', new OpenTrackSettings(contents, position.trackIndex)),
        ];
        if (sequencerStore.isStepSelectionValid()) {
            contextMenuItems.push(new AppContextMenuItem('Step settings', new OpenStepSettings(position)));
        }

        return contextMenuItems;
    }
}

// Handles right-click context menu for track operations
function handleContextMenu(event: MouseEvent, position: StepPosition) {
    sequencerStore.rightClickSelect(position);

    const items = createContextMenuItems(position);
    if (items) {
        menuStore.clearContextualItems(); // Clear previous contextual items
        menuStore.addContextualItems(items); // Add new contextual items
        menuStore.openContextMenu(event.clientX, event.clientY);
    }
}
</script>
