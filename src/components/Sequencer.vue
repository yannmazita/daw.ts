<template>
    <div id="sequencer-container" @contextmenu.prevent="handleContextMenu($event)">
        <SequencerSettings></SequencerSettings>
        <SequencerTracks></SequencerTracks>
        <SequencerPlaybackControls></SequencerPlaybackControls>
        <SequencerTrackSettings :show-modal="showModal"></SequencerTrackSettings>
    </div>
</template>

<script setup lang="ts">
import { inject, ref, Ref } from 'vue';
import { sequencerInstrumentManagerKey, sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { useContextMenuStore } from '@/stores/contextMenuStore';
import { AppContextMenuItem } from '@/models/AppContextMenuItem';
import { AddTrackCommand, RemoveTrackCommand, OpenTrackSettings } from '@/services/commands/SequencerCommands';
import SequencerSettings from '@/components/SequencerSettings.vue';
import SequencerPlaybackControls from '@/components/SequencerPlaybackControls.vue';
import SequencerTracks from '@/components/SequencerTracks.vue';
import SequencerTrackSettings from '@/components/SequencerTrackSettings.vue';

const menuStore = useContextMenuStore();
const trackManager = inject<SequencerTrackManager>(sequencerTrackManagerKey) as SequencerTrackManager;
const instrumentManager = inject<SequencerInstrumentManager>(sequencerInstrumentManagerKey) as SequencerInstrumentManager;

const showModal: Ref<boolean> = ref(false);

function handleContextMenu(event: MouseEvent) {
    const items = [
        new AppContextMenuItem('Add track', new AddTrackCommand(trackManager)),
        new AppContextMenuItem('Remove track', new RemoveTrackCommand(trackManager)),
        new AppContextMenuItem('Track settings', new OpenTrackSettings()),
    ];
    menuStore.showContextMenu(items, event.clientX, event.clientY);
}

</script>
