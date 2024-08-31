<template>
    <button @click="windowsStore.createWindow()">Open Window</button>
    <div class="relative size-full overflow-auto">
        <AppDrag v-for="[id, window] of windows" :key="id" :id="window.id" />
    </div>
</template>

<script setup lang="ts">
import AppDrag from '@/components/AppDrag.vue';
import { onMounted } from 'vue';
import { useWindowsStore } from '@/stores/useWindowsStore';
import { storeToRefs } from 'pinia';

const windowsStore = useWindowsStore();
const { windows } = storeToRefs(windowsStore);

onMounted(() => {
    windowsStore.createWindow();
})
</script>

<style>
.window-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
}
</style>
