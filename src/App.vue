<template>
    <div class="grid grid-cols-12">
        <AppContextMenu></AppContextMenu>
        <AppDialogWindow></AppDialogWindow>
        <div class="col-span-12">
            <AppTabBar></AppTabBar>
        </div>
        <main class="col-span-12 p-3 overflow-auto">
            <router-view></router-view>
        </main>
    </div>
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

const sequencerInstrumentManager = new SequencerInstrumentManager();
const sequencerPlaybackManager = new SequencerPlaybackManager(sequencerInstrumentManager);
const sequencerTrackManager = new SequencerTrackManager(sequencerPlaybackManager, sequencerInstrumentManager);

provide(sequencerInstrumentManagerKey, sequencerInstrumentManager);
provide(sequencerTrackManagerKey, sequencerTrackManager);
provide(sequencerPlaybackManagerKey, sequencerPlaybackManager);
</script>
