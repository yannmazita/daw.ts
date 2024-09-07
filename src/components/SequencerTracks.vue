<template>
    <div id="sequencer-tracks-container" v-for="track in tracks" :key="track.id"
        @contextmenu.prevent="handleContextMenu($event, track.id)">
        <Track :track-id="track.id" :steps="track.steps" />
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { inject, markRaw } from 'vue';
import { sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { useSequencerStore } from '@/stores/sequencerStore';
import { useContextMenuStore } from '@/stores/contextMenuStore';
import { AppContextMenuItem } from '@/models/AppContextMenuItem';
import { AddTrackCommand, RemoveTrackCommand, OpenTrackSettings, OpenStepSettings } from '@/services/commands/SequencerCommands';
import Track from '@/components/Track.vue';
import { WindowDualPaneContent } from '@/utils/interfaces';
import SequencerTrackSettingsInstrumentsPane from './SequencerTrackSettingsInstrumentsPane.vue';
import SequencerTrackSettingsEffectsPane from './SequencerTrackSettingsEffectsPane.vue';

const sequencerStore = useSequencerStore();
const menuStore = useContextMenuStore();
const { tracks } = storeToRefs(useSequencerStore());
const trackManager = inject<SequencerTrackManager>(sequencerTrackManagerKey) as SequencerTrackManager;

function createContextMenuItems(trackIndex: number) {
    const contents: WindowDualPaneContent[] = [
        { label: 'Instrument', component: markRaw(SequencerTrackSettingsInstrumentsPane) },
        { label: 'Effects', component: markRaw(SequencerTrackSettingsEffectsPane) },
    ]
    const contextMenuItems = [
        new AppContextMenuItem('Add track', new AddTrackCommand(trackManager)),
        new AppContextMenuItem('Remove track', new RemoveTrackCommand(trackManager)),
        new AppContextMenuItem('Track settings', new OpenTrackSettings(contents, trackIndex)),
    ];

    if (sequencerStore.isRightClickStepPosValid()) {
        contextMenuItems.push(new AppContextMenuItem('Step settings', new OpenStepSettings(sequencerStore.rightClickStepPos.trackIndex as number, sequencerStore.rightClickStepPos.stepIndex as number)));
    }

    return contextMenuItems;
}

// Handles right-click context menu for track operations
function handleContextMenu(event: MouseEvent, trackIndex: number) {
    const items = createContextMenuItems(trackIndex);
    // Opens the context menu at the click location
    menuStore.openContextMenu(items, event.clientX, event.clientY);
}
</script>
