<template>
    <div v-show="!currentWindow?.isMinimized" ref="componentRef" class="draggable-resizable bg-yellow-300"
        :style="styleObject">
        <div class="flex justify-between bg-[#f0f0f0] p-1.5 cursor-move" @mousedown="startDrag">
            <div class="w-fit">
                Drag Me Up!
            </div>
            <div class="w-fit">
                <button class="mx-2" @click="minimizeComponent">Minimize</button>
                <button class="mx-2" @click="maximizeComponent">{{ currentWindow.isMaximized ? 'Restore' : 'Maximize'
                    }}</button>
                <button class="mx-2" @click="closeComponent">Close</button>
            </div>
        </div>
        <div>
            <component :is="currentWindow.windowComponent" :key="currentWindow.windowComponentKey"
                v-bind="currentWindow.windowProps"></component>
        </div>
        <!-- Corner resizers -->
        <div class="resizer se" @mousedown="event => startResize('se', event)"></div>
        <div class="resizer sw" @mousedown="event => startResize('sw', event)"></div>
        <div class="resizer nw" @mousedown="event => startResize('nw', event)"></div>
        <div class="resizer ne" @mousedown="event => startResize('ne', event)"></div>
        <!-- Border resizers -->
        <div class="resizer north" @mousedown="event => startResize('north', event)"></div>
        <div class="resizer south" @mousedown="event => startResize('south', event)"></div>
        <div class="resizer east" @mousedown="event => startResize('east', event)"></div>
        <div class="resizer west" @mousedown="event => startResize('west', event)"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, onUnmounted, computed } from 'vue';
import { useWindowsStore } from '@/stores/useWindowsStore';
import { useDraggable } from '@/composables/useDraggable';
import { useResizable } from '@/composables/useResizable';

const props = defineProps<{
    id: string;
}>();

const componentRef: Ref<HTMLDivElement | null> = ref(null);

const windowsStore = useWindowsStore();
const currentWindow = computed(() => windowsStore.windows.get(props.id));
const { startResize, stopResize, handleResize } = useResizable(props.id);
const { startDrag, stopDrag, handleDrag } = useDraggable(props.id);

const styleObject = computed(() => ({
    top: currentWindow.value?.isMaximized ? '0' : `${currentWindow.value?.yPos}px`,
    left: currentWindow.value?.isMaximized ? '0' : `${currentWindow.value?.xPos}px`,
    width: currentWindow.value?.isMaximized ? '100%' : `${currentWindow.value?.width}px`,
    height: currentWindow.value?.isMaximized ? '100%' : `${currentWindow.value?.height}px`,
    //position: currentWindow.value?.isMaximized ? 'fixed' : 'absolute' // Use fixed to cover the whole viewport
}));

function closeComponent() {
    windowsStore.closeWindow(props.id);
}

function maximizeComponent() {
    windowsStore.maximizeWindow(props.id);
}

function minimizeComponent() {
    windowsStore.minimizeWindow(props.id);
}

onMounted(() => {
    document.addEventListener('mousemove', (event) => {
        if (componentRef.value !== null) {
            handleDrag(event, componentRef.value);
        }

        if (componentRef.value !== null && currentWindow.value?.resizing) {
            handleResize(event, componentRef.value);
        }
    });

    document.addEventListener('mouseup', () => {
        stopDrag();
        stopResize();
    });
});

onUnmounted(() => {
    document.removeEventListener('mousemove', (event) => {
        if (componentRef.value !== null) {
            handleDrag(event, componentRef.value);
        }

        if (componentRef.value !== null && currentWindow.value?.resizing) {
            handleResize(event, componentRef.value);
        }
    });
    document.removeEventListener('mouseup', () => {
        stopDrag();
        stopResize();
    });
});
</script>

<style scoped>
.draggable-resizable {
    position: absolute;
    border: 1px solid black;
}

.resizer {
    position: absolute;
    background-color: red;
    cursor: pointer;
}

.se,
.sw,
.nw,
.ne {
    width: 10px;
    height: 10px;
}

.se {
    right: 0;
    bottom: 0;
    cursor: se-resize;
}

.sw {
    left: 0;
    bottom: 0;
    cursor: sw-resize;
}

.nw {
    left: 0;
    top: 0;
    cursor: nw-resize;
}

.ne {
    right: 0;
    top: 0;
    cursor: ne-resize;
}

.north,
.south,
.east,
.west {
    background-color: transparent;
}

.north,
.south {
    left: 0;
    right: 0;
    height: 5px;
}

.north {
    top: 0;
    cursor: n-resize;
}

.south {
    bottom: 0;
    cursor: s-resize;
}

.east,
.west {
    top: 0;
    bottom: 0;
    width: 5px;
}

.east {
    right: 0;
    cursor: e-resize;
}

.west {
    left: 0;
    cursor: w-resize;
}
</style>
