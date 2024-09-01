<template>
    <button @click="windowsStore.createWindow()">Open Window</button>
    <div class="relative size-full overflow-auto">
        <AppWindow v-for="[id, window] of windows" :key="id" :id="window.id" />
    </div>
</template>

<script setup lang="ts">
import AppWindow from '@/components/AppWindow.vue';
import Sequencer from '@/components/Sequencer.vue';
import { markRaw, onMounted } from 'vue';
import { useWindowsStore } from '@/stores/useWindowsStore';
import { storeToRefs } from 'pinia';

const windowsStore = useWindowsStore();
const { windows } = storeToRefs(windowsStore);

onMounted(() => {
    windowsStore.createWindow({ windowComponent: markRaw(Sequencer) });
})
</script>
