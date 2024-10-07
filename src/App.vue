<template>
    <main class="h-screen w-full overflow-hidden">
        <AppContextMenu></AppContextMenu>
        <AppTabBar></AppTabBar>
        <router-view></router-view>
    </main>
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { sequencerInstrumentManagerKey, sequencerPlaybackManagerKey, sequencerTrackManagerKey } from '@/utils/injection-keys.ts';
import AppContextMenu from '@/components/AppContextMenu.vue';
import AppTabBar from '@/components/AppTabBar.vue';
import { AppContextMenuItem } from './models/AppContextMenuItem';
import { useContextMenuStore } from './stores/contextMenuStore';

const contextMenuStore = useContextMenuStore();

// Instantiating the managers responsible for handling specific parts of the sequencer logic
const sequencerInstrumentManager = new SequencerInstrumentManager();
const sequencerPlaybackManager = new SequencerPlaybackManager(sequencerInstrumentManager);
const sequencerTrackManager = new SequencerTrackManager(sequencerPlaybackManager, sequencerInstrumentManager);

// Providing instances of sequencer managers globally so they can be injected in any component
provide(sequencerInstrumentManagerKey, sequencerInstrumentManager);
provide(sequencerTrackManagerKey, sequencerTrackManager);
provide(sequencerPlaybackManagerKey, sequencerPlaybackManager);

onMounted(() => {
    const appLevelItems = [
        new AppContextMenuItem('App Settings', { execute: () => { /* ... */ }, undo: () => { }, redo: () => { } }),
        new AppContextMenuItem('About', { execute: () => { /* ... */ }, undo: () => { }, redo: () => { } }),
    ];
    contextMenuStore.setAppLevelItems(appLevelItems);
});
</script>
