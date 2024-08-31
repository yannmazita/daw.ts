<template>
    <button @click="windowStore.createWindow()">Open Window</button>
    <div class="relative size-full overflow-auto">
        <AppDrag v-for="window in windows" :key="window.id" :id="window.id" />
    </div>
</template>

<script setup lang="ts">
import AppDrag from '@/components/AppDrag.vue';
import { onMounted } from 'vue';
import { useWindowStore } from '@/stores/windowsStore';

const windowStore = useWindowStore();
const windows = windowStore.windows;

onMounted(() => {
    windowStore.createWindow();
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
