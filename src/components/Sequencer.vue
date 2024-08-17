<template>
    <div id="sequencer-container" @contextmenu.prevent="handleContextMenu($event)">
        <SequencerSettings></SequencerSettings>
        <SequencerTracks></SequencerTracks>
        <SequencerPlaybackControls></SequencerPlaybackControls>
    </div>
</template>

<script setup lang="ts">
import { useContextMenuStore } from '@/stores/contextMenuStore';
import { AppContextMenuItem } from '@/models/AppContextMenuItem';
import { AddTrackCommand, RemoveTrackCommand, AddStepCommand, RemoveStepCommand } from '@/services/commands/SequencerCommands';
import SequencerSettings from '@/components/SequencerSettings.vue';
import SequencerPlaybackControls from '@/components/SequencerPlaybackControls.vue';
import SequencerTracks from '@/components/SequencerTracks.vue';

const menuStore = useContextMenuStore();

function handleContextMenu(event: MouseEvent) {
    const items = [
        new AppContextMenuItem('Add Track', new AddTrackCommand()),
        new AppContextMenuItem('Remove Track', new RemoveTrackCommand()),
        new AppContextMenuItem('Add Step', new AddStepCommand()),
        new AppContextMenuItem('Remove Step', new RemoveStepCommand())
    ];
    menuStore.showContextMenu(items, event.clientX, event.clientY);
}

</script>
