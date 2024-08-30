<template>
    <button @click="windowStore.createWindow()">Open Window</button>
    <div class="bg-blue-700 h-14">boudary test</div>
    <div class="size-3/4 bg-green-700" v-for="win in windows" :key="win.id">
        <AppDrag :id="win.id"></AppDrag>
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
