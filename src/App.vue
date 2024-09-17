<template>
    <main class="h-screen w-full overflow-hidden">
        <AppContextMenu></AppContextMenu>
        <AppTabBar></AppTabBar>
        <router-view></router-view>
    </main>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { PianoRollPlaybackManager } from '@/services/PianoRollPlaybackManager';
import {
    sequencerInstrumentManagerKey,
    sequencerPlaybackManagerKey,
    sequencerTrackManagerKey,
    pianoRollPlaybackManagerKey,
} from '@/utils/injection-keys.ts';
import AppContextMenu from '@/components/AppContextMenu.vue';
import AppTabBar from '@/components/AppTabBar.vue';

// Instantiating step sequencer managers
const sequencerInstrumentManager = new SequencerInstrumentManager();
const sequencerPlaybackManager = new SequencerPlaybackManager(sequencerInstrumentManager);
const sequencerTrackManager = new SequencerTrackManager(sequencerPlaybackManager, sequencerInstrumentManager);

// Instantiating piano roll managers
const pianoRollPlaybackManager = new PianoRollPlaybackManager();

// Providing instances of sequencer managers globally so they can be injected in any component
provide(sequencerInstrumentManagerKey, sequencerInstrumentManager);
provide(sequencerTrackManagerKey, sequencerTrackManager);
provide(sequencerPlaybackManagerKey, sequencerPlaybackManager);

// Providing instance of piano roll manager
provide(pianoRollPlaybackManagerKey, pianoRollPlaybackManager);
</script>
