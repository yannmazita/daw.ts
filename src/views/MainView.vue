<template>
    <button @click="windowsStore.createWindow()">Open Window</button>
    <div class="relative size-full overflow-hidden">
        <AppWindow v-for="[id, window] of windows" :key="id" :id="window.id" />
    </div>
</template>

<script setup lang="ts">
import AppWindow from '@/components/AppWindow.vue';
import Sequencer from '@/components/Sequencer.vue';
import PianoRoll from '@/components/PianoRoll.vue';
import { markRaw, onMounted } from 'vue';
import { useWindowsStore } from '@/stores/useWindowsStore';
import { storeToRefs } from 'pinia';

const windowsStore = useWindowsStore();
const { windows } = storeToRefs(windowsStore);

onMounted(() => {
    windowsStore.createWindow({ windowComponent: markRaw(Sequencer) });
    windowsStore.createWindow({ width: 1024, height: 768, initialWidth: 1024, initialHeight: 768, maximumWidth: 2560, maximumHeight: 1440, windowComponent: markRaw(PianoRoll) });
})
</script>
