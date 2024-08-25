<template>
    <!-- Main grid container dividing the application into sections -->
    <div class="grid grid-cols-12">
        <!-- Context menu for providing additional options on user interaction -->
        <AppContextMenu></AppContextMenu>
        <!-- Centralized dialog window for displaying dynamic content -->
        <AppDialogWindow></AppDialogWindow>
        <!-- Full-width tab bar for navigation between different sections of the application -->
        <div class="col-span-12">
            <AppTabBar></AppTabBar>
        </div>
        <!-- Main content area that will render the different pages based on routing -->
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

// Instantiating the managers responsible for handling specific parts of the sequencer logic
const sequencerInstrumentManager = new SequencerInstrumentManager();
const sequencerPlaybackManager = new SequencerPlaybackManager(sequencerInstrumentManager);
const sequencerTrackManager = new SequencerTrackManager(sequencerPlaybackManager, sequencerInstrumentManager);

// Providing instances of sequencer managers globally so they can be injected in any component
provide(sequencerInstrumentManagerKey, sequencerInstrumentManager);
provide(sequencerTrackManagerKey, sequencerTrackManager);
provide(sequencerPlaybackManagerKey, sequencerPlaybackManager);
</script>
