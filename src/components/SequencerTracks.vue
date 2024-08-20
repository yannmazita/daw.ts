<template>
    <div id="sequencer-tracks-container" v-for="track in tracks" :key="track.id"
        @contextmenu.prevent="handleContextMenu($event)">
        <Track :track-id="track.id" :steps="track.steps" />
        <SequencerTrackSettings :show-modal="showModal"></SequencerTrackSettings>
    </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Track from '@/components/Track.vue';
import { useSequencerStore } from '@/stores/sequencerStore';
const { tracks } = storeToRefs(useSequencerStore());
import { inject, ref, Ref } from 'vue';
import { sequencerInstrumentManagerKey, sequencerTrackManagerKey } from '@/utils/injection-keys';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { useContextMenuStore } from '@/stores/contextMenuStore';
import { AppContextMenuItem } from '@/models/AppContextMenuItem';
import { AddTrackCommand, RemoveTrackCommand, OpenTrackSettings } from '@/services/commands/SequencerCommands';
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
