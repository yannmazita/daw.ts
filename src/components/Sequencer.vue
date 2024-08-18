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
import { AddTrackCommand, RemoveTrackCommand, AddStepCommand, RemoveStepCommand, RemoveLastTrackCommand } from '@/services/commands/SequencerCommands';
import SequencerSettings from '@/components/SequencerSettings.vue';
import SequencerPlaybackControls from '@/components/SequencerPlaybackControls.vue';
import SequencerTracks from '@/components/SequencerTracks.vue';

const menuStore = useContextMenuStore();

function handleContextMenu(event: MouseEvent) {
    const items = [
        new AppContextMenuItem('Add track', new AddTrackCommand()),
        new AppContextMenuItem('Remove track', new RemoveTrackCommand()),
        new AppContextMenuItem('Remove last track', new RemoveLastTrackCommand()),
    ];
    menuStore.showContextMenu(items, event.clientX, event.clientY);
}

</script>
