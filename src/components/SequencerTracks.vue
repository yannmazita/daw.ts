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
import { AddTrackCommand, RemoveTrackCommand, OpenTrackSettings } from '@/services/commands/SequencerCommands';
import { AppWindowDualPaneItem } from '@/models/AppWindowDualPaneItem';
import { ShowActiveComponentCommand } from '@/services/commands/DialogCommands';
import { v4 as uuidv4 } from 'uuid';
import Track from '@/components/Track.vue';
import SequencerTrackSettingsDialogInstrumentsContent from '@/components/SequencerTrackSettingsDialogInstrumentsContent.vue';
import SequencerTrackSettingsDialogEffectsContent from '@/components/SequencerTrackSettingsDialogEffectsContent.vue';

const menuStore = useContextMenuStore();
const { tracks } = storeToRefs(useSequencerStore());
const trackManager = inject<SequencerTrackManager>(sequencerTrackManagerKey) as SequencerTrackManager;

// Handles right-click context menu for track operations
function handleContextMenu(event: MouseEvent, trackIndex: number) {
    // Generate unique ID for each new dialog
    const dialogId = uuidv4();
    // Prepare content items for the dialog
    const dialogWindowItems = [
        new AppWindowDualPaneItem('Instruments', new ShowActiveComponentCommand(dialogId, markRaw(SequencerTrackSettingsDialogInstrumentsContent))),
        new AppWindowDualPaneItem('Effects', new ShowActiveComponentCommand(dialogId, markRaw(SequencerTrackSettingsDialogEffectsContent))),
    ];

    // Items to show in the context menu
    const contextMenuItems = [
        new AppContextMenuItem('Add track', new AddTrackCommand(trackManager)),
        new AppContextMenuItem('Remove track', new RemoveTrackCommand(trackManager)),
        new AppContextMenuItem('Track settings', new OpenTrackSettings()),
    ];
    // Opens the context menu at the click location
    menuStore.openContextMenu(contextMenuItems, event.clientX, event.clientY);
}
</script>
