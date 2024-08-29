<template>
    <div ref="component" class="draggable-resizable" :style="styleObject">
        <div class="title-bar" @mousedown="startDrag">
            Drag Me
        </div>
        <div class="content">
            <slot></slot>
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
import { ref, reactive, watchEffect } from 'vue';

const pos = reactive({
    x: 100,
    y: 100,
    width: 200,
    height: 150,
});

const dragging = ref(false);
const resizing = ref(false);
const resizeDirection = ref('');
let lastMouseX = 0;
let lastMouseY = 0;

const styleObject = reactive({
    top: `${pos.y}px`,
    left: `${pos.x}px`,
    width: `${pos.width}px`,
    height: `${pos.height}px`,
});

watchEffect(() => {
    styleObject.top = `${pos.y}px`;
    styleObject.left = `${pos.x}px`;
    styleObject.width = `${pos.width}px`;
    styleObject.height = `${pos.height}px`;
});

function startDrag(event: MouseEvent) {
    dragging.value = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function startResize(direction: string, event: MouseEvent) {
    resizing.value = true;
    resizeDirection.value = direction;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

document.addEventListener('mousemove', (event) => {
    if (dragging.value) {
        const dx = event.clientX - lastMouseX;
        const dy = event.clientY - lastMouseY;
        pos.x += dx;
        pos.y += dy;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }

    if (resizing.value) {
        const dx = event.clientX - lastMouseX;
        const dy = event.clientY - lastMouseY;
        switch (resizeDirection.value) {
            case 'se':
                pos.width += dx;
                pos.height += dy;
                break;
            case 'sw':
                pos.width -= dx;
                pos.x += dx;
                pos.height += dy;
                break;
            case 'nw':
                pos.width -= dx;
                pos.height -= dy;
                pos.x += dx;
                pos.y += dy;
                break;
            case 'ne':
                pos.width += dx;
                pos.height -= dy;
                pos.y += dy;
                break;
            case 'north':
                pos.height -= dy;
                pos.y += dy;
                break;
            case 'south':
                pos.height += dy;
                break;
            case 'east':
                pos.width += dx;
                break;
            case 'west':
                pos.width -= dx;
                pos.x += dx;
                break;
        }
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});

document.addEventListener('mouseup', () => {
    dragging.value = false;
    resizing.value = false;
    resizeDirection.value = '';
});
</script>

<style scoped>
.draggable-resizable {
    position: absolute;
    border: 1px solid black;
}

.title-bar {
    background-color: #f0f0f0;
    padding: 5px;
    cursor: move;
}

.content {
    padding: 10px;
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
    /* Makes it less intrusive */
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
