<template>
    <main class="h-screen w-full overflow-hidden">
        <AppContextMenu></AppContextMenu>
        <AppTabBar></AppTabBar>
        <router-view></router-view>
    </main>
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { sequencerInstrumentManagerKey, sequencerPlaybackManagerKey, sequencerTrackManagerKey } from '@/utils/injection-keys.ts';
import AppContextMenu from '@/components/AppContextMenu.vue';
import AppTabBar from '@/components/AppTabBar.vue';
import { AppContextMenuItem } from './models/AppContextMenuItem';
import { useContextMenuStore } from './stores/contextMenuStore';
import { CommandManager } from './services/CommandManager';
import { SequencerInstrumentManager } from './services/SequencerInstrumentManager';

const contextMenuStore = useContextMenuStore();
const commandManager = new CommandManager();
const sequencerInstrumentManager = new SequencerInstrumentManager(commandManager);
const sequencerPlaybackManager = new SequencerPlaybackManager(commandManager);
const sequencerTrackManager = new SequencerTrackManager(sequencerPlaybackManager, sequencerInstrumentManager, commandManager);

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
