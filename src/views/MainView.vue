<template>
    <AppWindow v-for="(item, index) in windowItem" :key="index" :top="item.top" :left="item.left" :width="item.width"
        :height="item.height" :min-width="item.minWidth" :min-height="item.minHeight" :is-dragging="item.isDragging"
        :is-resizing="item.isResizing" :is-maximized="item.isMaximized" :max-width="item.maxWidth"
        :max-height="item.maxHeight" :is-active="item.isActive" :window-id="`${index}`" :title="item.title"
        :title-icon="''" :window-inner-width="windowInnerWidth" :is-button-maximized="item.isButtonMaximized"
        :is-button-minimized="item.isButtonMinimized" class="absolute" :style="`z-index:${item.zindex};}`"
        @clickWindow="activeWindow" @clickDestroy="destroyWindow" @clickMin="">
        <div class="flex justify-center">
            <component :is="item.componentData" v-bind="item.componentProps"></component>
        </div>
    </AppWindow>
</template>

<script setup lang="ts">
import AppWindow from '@/components/AppWindow.vue';
import Sequencer from '@/components/Sequencer.vue';
import TestView from '@/views/TestView.vue';
import { ref, onMounted, markRaw } from 'vue';

interface WindowItem {
    top: number;
    left: number;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    isDragging: boolean;
    isResizing: ('r' | 'rb' | 'b' | 'lb' | 'l' | 'lt' | 't' | 'rt')[];
    isMaximized: boolean;
    maxWidth: number;
    maxHeight: number;
    isActive: boolean;
    title: string;
    zindex: number;
    componentData: unknown;
    componentProps: object;
    isButtonMaximized: boolean;
    isButtonMinimized: boolean;
}

const windowInnerWidth = ref<number>(0);
const activeWindowId = ref<number[]>([]);
const windowItem = ref<Record<number, WindowItem>>({});
const displayWindowArea = ref<number>(0);

const sequencerWindow: WindowItem = {
    isActive: true,
    zindex: 0,
    top: 0,
    left: 0,
    width: 800,
    height: 400,
    minWidth: 500,
    minHeight: 500,
    isDragging: true,
    isResizing: ['r', 'rb', 'b', 'lb', 'l', 'lt', 't', 'rt'],
    isMaximized: false,
    maxWidth: 1000,
    maxHeight: 1000,
    isButtonMaximized: true,
    isButtonMinimized: true,
    componentData: markRaw(Sequencer),
    componentProps: {},
    title: "Sequencer",
}
const testWindow: WindowItem = {
    isActive: true,
    zindex: 0,
    top: 200,
    left: 200,
    width: 800,
    height: 400,
    minWidth: 500,
    minHeight: 500,
    isDragging: true,
    isResizing: ['r', 'rb', 'b', 'lb', 'l', 'lt', 't', 'rt'],
    isMaximized: false,
    maxWidth: 1000,
    maxHeight: 1000,
    isButtonMaximized: true,
    isButtonMinimized: true,
    componentData: markRaw(TestView),
    componentProps: {},
    title: "TEST",
}

onMounted(() => {
    windowItem.value[0] = sequencerWindow;
    windowItem.value[1] = testWindow;
    loadItems();
});

function loadItems() {
    windowInnerWidth.value = window.innerWidth;
    displayWindowArea.value = window.innerHeight - 50;
    console.log(displayWindowArea.value);
}

function activeWindow(data: number) {
    const index = activeWindowId.value.indexOf(data);
    if (index !== -1) {
        activeWindowId.value.splice(index, 1);
    }
    activeWindowId.value.push(data);
    activeWindowId.value.forEach((element, index) => {
        windowItem.value[element].zindex = index;
    });
}

function destroyWindow(windowId: number) {
    windowItem.value[windowId].isActive = false;
}
</script>
