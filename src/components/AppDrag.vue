<template>
    <div v-if="isVisible" ref="componentRef" class="draggable-resizable bg-yellow-300" :style="styleObject">
        <div class="flex justify-between bg-[#f0f0f0] p-1.5 cursor-move" @mousedown="startDrag">
            <div class="w-fit">
                Drag Me Up!
            </div>
            <div class="w-fit">
                <button class="" @click="closeComponent">X</button>
            </div>
        </div>
        <div>
            <component :is="windowComponent" :key="windowComponentKey" v-bind="windowProps"></component>
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
import { ref, reactive, watchEffect, Ref, onMounted, onUnmounted } from 'vue';
import { useDragState } from '@/composables/useDragState';
import { useDraggable } from '@/composables/useDraggable';
import { useResizable } from '@/composables/useResizable';

const props = defineProps<{
    id: string;
}>();

const componentRef: Ref<HTMLDivElement | null> = ref(null);

const dragState = useDragState();
const { isVisible, windowComponent, windowComponentKey, xPos, yPos, windowProps, resizing, width, height } = dragState;
const { startResize, stopResize, handleResize } = useResizable(dragState);
const { startDrag, stopDrag, handleDrag } = useDraggable(dragState);

const styleObject = reactive({
    top: `${yPos.value}px`,
    left: `${xPos.value}px`,
    width: `${width.value}px`,
    height: `${height.value}px`,
});

watchEffect(() => {
    styleObject.top = `${yPos.value}px`;
    styleObject.left = `${xPos.value}px`;
    styleObject.width = `${width.value}px`;
    styleObject.height = `${height.value}px`;
});

function closeComponent() {
    isVisible.value = false;
}

function componentDebug() {
    const parent = componentRef.value?.parentElement;
    const parentRect = parent?.getBoundingClientRect();
    console.log(`Parent width: ${parentRect?.width}, height: ${parentRect?.height}`);
    console.log(`Component width: ${width.value}, height: ${height.value}`);
    console.log(`Component position: x: ${xPos.value}, y: ${yPos.value}`);
    console.log(`Component style: ${styleObject.width}, ${styleObject.height}`);
}

onMounted(() => {
    document.addEventListener('mousemove', (event) => {
        if (componentRef.value !== null) {
            handleDrag(event, componentRef.value);
        }

        if (componentRef.value !== null && resizing.value) {
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

        if (componentRef.value !== null && resizing.value) {
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
