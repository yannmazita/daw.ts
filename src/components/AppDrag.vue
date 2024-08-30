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
        <div class="">
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
import { ref, reactive, watchEffect, Ref, onMounted } from 'vue';

interface Props {
    minimumWidth?: number;
    maximumWidth?: number;
    minimumHeight?: number;
    maximumHeight?: number;
    initialWidth?: number;
    initialHeight?: number;
}
const props = withDefaults(defineProps<Props>(), {
    minimumWidth: 320,
    maximumWidth: 1000,
    minimumHeight: 240,
    maximumHeight: 1000,
    initialWidth: 800,
    initialHeight: 600,
});

const pos = reactive({
    x: 0,
    y: 0,
    width: Math.min(Math.max(props.initialWidth, props.minimumWidth), props.maximumWidth),
    height: Math.min(Math.max(props.initialHeight, props.minimumHeight), props.maximumHeight),
});

const componentRef: Ref<HTMLDivElement | null> = ref(null);
const isVisible = ref(true);
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

function closeComponent() {
    isVisible.value = false;
}

function componentDebug() {
    const parent = componentRef.value?.parentElement;
    const parentRect = parent?.getBoundingClientRect();
    console.log(`Parent width: ${parentRect?.width}, height: ${parentRect?.height}`);
    console.log(`Component width: ${pos.width}, height: ${pos.height}`);
    console.log(`Component position: x: ${pos.x}, y: ${pos.y}`);
    console.log(`Component style: ${styleObject.width}, ${styleObject.height}`);
}

onMounted(() => {
    const parent = componentRef.value?.parentElement;
    const parentRect = parent?.getBoundingClientRect();

    document.addEventListener('mousemove', (event) => {
        if (dragging.value && parentRect) {
            const dx = event.clientX - lastMouseX;
            const dy = event.clientY - lastMouseY;

            // Adjust pos.x and pos.y to consider the parent's position
            pos.x = Math.max(parentRect.left, Math.min(pos.x + dx, parentRect.right - pos.width));
            pos.y = Math.max(parentRect.top, Math.min(pos.y + dy, parentRect.bottom - pos.height));

            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
        }

        if (resizing.value) {
            let dx = event.clientX - lastMouseX;
            let dy = event.clientY - lastMouseY;

            switch (resizeDirection.value) {
                case 'se':
                    adjustSize(dx, dy, true, true);
                    break;
                case 'sw':
                    adjustSize(dx, dy, false, true);
                    break;
                case 'nw':
                    adjustSize(dx, dy, false, false);
                    break;
                case 'ne':
                    adjustSize(dx, dy, true, false);
                    break;
                case 'north':
                    adjustSize(0, dy, false, false);
                    break;
                case 'south':
                    adjustSize(0, dy, true, true);
                    break;
                case 'east':
                    adjustSize(dx, 0, true, true);
                    break;
                case 'west':
                    adjustSize(dx, 0, false, false);
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

    function adjustSize(dx: number, dy: number, expandRight: boolean, expandDown: boolean) {
        // Currently there is a bug when resizing using the north handle and encountering the parent's top boundary
        // Trying to resize past the boundary will mean the component grows from the bottom.

        if (resizeDirection.value === 'north') {
            const newHeight = Math.min(Math.max(pos.height - dy, props.minimumHeight), props.maximumHeight);
            if (newHeight > props.minimumHeight) {
                const newY = pos.y + dy;
                if (newY >= parentRect.top && newY + newHeight <= parentRect.bottom) {
                    pos.y = newY;
                    pos.height = newHeight;
                } else {
                    // Adjust height only to prevent moving with the mouse
                    pos.height = newHeight;
                }
            }
        } else {
            const newWidth = Math.min(Math.max(pos.width + (expandRight ? dx : -dx), props.minimumWidth), props.maximumWidth);
            const newHeight = Math.min(Math.max(pos.height + (expandDown ? dy : -dy), props.minimumHeight), props.maximumHeight);

            // Adjust x position for west resizing
            if (!expandRight && newWidth > props.minimumWidth) {
                const newX = pos.x + dx;
                if (newX >= parentRect.left && newX + newWidth <= parentRect.right) {
                    pos.x = newX;
                    pos.width = newWidth;
                } else {
                    // Adjust width only to prevent moving with the mouse
                    pos.width = newWidth;
                }
            } else if (expandRight) {
                if (pos.x + newWidth <= parentRect.right) {
                    pos.width = newWidth;
                }
            }

            // Adjust y position for north resizing (handled above) and south resizing
            if (!expandDown && newHeight > props.minimumHeight) {
                const newY = pos.y + dy;
                if (newY >= parentRect.top && newY + newHeight <= parentRect.bottom) {
                    pos.y = newY;
                    pos.height = newHeight;
                } else {
                    // Adjust height only to prevent moving with the mouse
                    pos.height = newHeight;
                }
            } else if (expandDown) {
                if (pos.y + newHeight <= parentRect.bottom) {
                    pos.height = newHeight;
                }
            }
        }
    }
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
