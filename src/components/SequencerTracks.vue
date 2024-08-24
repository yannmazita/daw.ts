<template>
    <div id="sequencer-tracks-container" v-for="track in tracks" :key="track.id"
        @contextmenu.prevent="handleContextMenu($event)">
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
import { AppDialogWindowItem } from '@/models/AppDialogWindowItem';
import { ShowActiveComponentCommand } from '@/services/commands/DialogCommands';
import Track from '@/components/Track.vue';
import SequencerTrackSettingsDialogInstrumentsContent from '@/components/SequencerTrackSettingsDialogInstrumentsContent.vue';
import SequencerTrackSettingsDialogEffectsContent from '@/components/SequencerTrackSettingsDialogEffectsContent.vue';

const menuStore = useContextMenuStore();
const { tracks } = storeToRefs(useSequencerStore());
const trackManager = inject<SequencerTrackManager>(sequencerTrackManagerKey) as SequencerTrackManager;

function handleContextMenu(event: MouseEvent) {
    const dialogWindowItems = [
        new AppDialogWindowItem('Instruments', new ShowActiveComponentCommand(markRaw(SequencerTrackSettingsDialogInstrumentsContent))),
        new AppDialogWindowItem('Effects', new ShowActiveComponentCommand(markRaw(SequencerTrackSettingsDialogEffectsContent))),
    ];

    const contextMenuItems = [
        new AppContextMenuItem('Add track', new AddTrackCommand(trackManager)),
        new AppContextMenuItem('Remove track', new RemoveTrackCommand(trackManager)),
        new AppContextMenuItem('Track settings', new OpenTrackSettings("Track settings", dialogWindowItems, 0, 0, true)),
    ];
    menuStore.openContextMenu(contextMenuItems, event.clientX, event.clientY);
}
</script>
