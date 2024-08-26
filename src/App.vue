<template>
    <main class="h-screen w-full overflow-hidden">
        <AppContextMenu></AppContextMenu>
        <AppDialogWindow></AppDialogWindow>
        <AppTabBar></AppTabBar>
        <router-view></router-view>
    </main>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { sequencerInstrumentManagerKey, sequencerPlaybackManagerKey, sequencerTrackManagerKey } from '@/utils/injection-keys.ts';
import AppContextMenu from '@/components/AppContextMenu.vue';
import AppDialogWindow from '@/components/AppDialogWindow.vue';
import AppTabBar from '@/components/AppTabBar.vue';

// Instantiating the managers responsible for handling specific parts of the sequencer logic
const sequencerInstrumentManager = new SequencerInstrumentManager();
const sequencerPlaybackManager = new SequencerPlaybackManager(sequencerInstrumentManager);
const sequencerTrackManager = new SequencerTrackManager(sequencerPlaybackManager, sequencerInstrumentManager);

// Providing instances of sequencer managers globally so they can be injected in any component
provide(sequencerInstrumentManagerKey, sequencerInstrumentManager);
provide(sequencerTrackManagerKey, sequencerTrackManager);
provide(sequencerPlaybackManagerKey, sequencerPlaybackManager);
</script>
