/*
* This file is part of daw.ts.
*
* Copyright (c) 2024 Yann Mazita
*
* Daw.ts is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* any later version.
*
* Daw.ts is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Project X. If not, see https://www.gnu.org/licenses/.
*/

/*
* Original code derived from vue-resizable,
* licensed under the MIT License.
*
* Copyright (c) 2018 nikitasnv
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/


<template>
    <div ref="parent" class="resizable-component" :style="style">
        <slot />
        <div v-for="el in active" v-show="!maximize" :key="el" :class="'resizable-' + el" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

type ResizeHandle = 'r' | 'rb' | 'b' | 'lb' | 'l' | 'lt' | 't' | 'rt';
type ElementAttributes = 'l' | 't' | 'w' | 'h';

interface Props {
    width?: number | string;
    minWidth?: number;
    maxWidth?: number;
    height?: number | string;
    minHeight?: number;
    maxHeight?: number;
    left?: number | string;
    top?: number | string;
    active?: ResizeHandle[];
    fitParent?: boolean;
    dragSelector?: string;
    maximize?: boolean;
    disableAttributes?: ElementAttributes[];
}

const props = withDefaults(defineProps<Props>(), {
    minWidth: 0,
    minHeight: 0,
    left: 0,
    top: 0,
    active: ['r', 'rb', 'b', 'lb', 'l', 'lt', 't', 'rt'] as ResizeHandle[],
    fitParent: false,
    maximize: false,
    disableAttributes: [] as ElementAttributes[],
});

const emit = defineEmits<{
    (e: 'resize:start' | 'resize:move' | 'resize:end' | 'drag:start' | 'drag:move' | 'drag:end', data: any): void,
    (e: 'maximize', data: { state: boolean }): void
}>();

const parent = ref<HTMLElement | null>(null);
const state = ref({
    width: props.width,
    height: props.height,
    minWidth: props.minWidth,
    minHeight: props.minHeight,
    maxWidth: props.maxWidth,
    maxHeight: props.maxHeight,
    left: props.left,
    top: props.top,
    mouseX: 0,
    mouseY: 0,
    offsetX: 0,
    offsetY: 0,
    parentSize: { width: 0, height: 0 },
    resizeState: 0,
    dragElements: [] as HTMLElement[],
    dragState: false,
    calcMap: 0b1111 as number,
    prevState: null as { width: number | string; height: number | string; left: number | string; top: number | string; } | null
});

const style = computed(() => ({
    width: typeof state.value.width === 'number' ? `${state.value.width}px` : state.value.width,
    height: typeof state.value.height === 'number' ? `${state.value.height}px` : state.value.height,
    left: typeof state.value.left === 'number' ? `${state.value.left}px` : state.value.left,
    top: typeof state.value.top === 'number' ? `${state.value.top}px` : state.value.top,
}));

function applyDimensionConstraints() {
    const { width, height, minWidth, minHeight, maxWidth, maxHeight } = state.value;

    // Apply minimum width and height
    if (minWidth && width < minWidth) {
        state.value.width = minWidth;
    }
    if (minHeight && height < minHeight) {
        state.value.height = minHeight;
    }

    // Apply maximum width and height
    if (maxWidth && width > maxWidth) {
        state.value.width = maxWidth;
    }
    if (maxHeight && height > maxHeight) {
        state.value.height = maxHeight;
    }

    // Ensure the component fits within the parent if `fitParent` is true
    if (props.fitParent) {
        if (width + state.value.left > parentEl.clientWidth) {
            state.value.width = parentEl.clientWidth - state.value.left;
        }
        if (height + state.value.top > parentEl.clientHeight) {
            state.value.height = parentEl.clientHeight - state.value.top;
        }
    }
}

function setupReactiveWatchers() {
    // Setup watchers on props to re-apply constraints when they change
    watch(() => props.width, (newWidth) => {
        state.value.width = newWidth;
        applyDimensionConstraints();
    });
    watch(() => props.height, (newHeight) => {
        state.value.height = newHeight;
        applyDimensionConstraints();
    });
    watch(() => props.left, (newLeft) => {
        state.value.left = newLeft;
    });
    watch(() => props.top, (newTop) => {
        state.value.top = newTop;
    });
}

function setupComponent() {
    // Ensure the component adheres to the initial props values
    const parentEl = parent.value?.parentElement;
    if (!parentEl) return;

    // Set initial width and height based on props or parent element's dimensions
    if (props.width === undefined || props.width === 'auto') {
        state.value.width = parentEl.clientWidth;
    } else if (typeof props.width === 'string') {
        state.value.width = parseFloat(props.width) || parentEl.clientWidth;
    }

    if (props.height === undefined || props.height === 'auto') {
        state.value.height = parentEl.clientHeight;
    } else if (typeof props.height === 'string') {
        state.value.height = parseFloat(props.height) || parentEl.clientHeight;
    }

    // Set initial positions based on props or calculate based on element's current position
    if (typeof props.left !== 'number') {
        state.value.left = parent.value!.offsetLeft - parentEl.offsetLeft;
    }

    if (typeof props.top !== 'number') {
        state.value.top = parent.value!.offsetTop - parentEl.offsetTop;
    }

    // Check and apply constraints to width and height
    applyDimensionConstraints();

    // Setup reactive watchers if properties change
    setupReactiveWatchers();

    // Setup initial drag elements if a selector is provided
    setupDragElements(props.dragSelector);
}

function teardownComponent() {
    // Remove event listeners from the document or window
    document.documentElement.removeEventListener('mousemove', handleMove, true);
    document.documentElement.removeEventListener('mousedown', handleDown, true);
    document.documentElement.removeEventListener('mouseup', handleUp, true);
    document.documentElement.removeEventListener('touchmove', handleMove, true);
    document.documentElement.removeEventListener('touchstart', handleDown, true);
    document.documentElement.removeEventListener('touchend', handleUp, true);

    // Emit a custom event if necessary, to notify of component teardown
    emit('destroy');
}


onMounted(() => {
    setupComponent();
    document.documentElement.addEventListener("mousemove", handleMove, true);
    document.documentElement.addEventListener("mousedown", handleDown, true);
    document.documentElement.addEventListener("mouseup", handleUp, true);
    document.documentElement.addEventListener("touchmove", handleMove, true);
    document.documentElement.addEventListener("touchstart", handleDown, true);
    document.documentElement.addEventListener("touchend", handleUp, true);
    emit('mount');
});

onBeforeUnmount(() => {
    teardownComponent();
    emit('destroy');
});

function setMaximize(value: boolean) {
    const parentEl = parent.value!.parentElement!;
    if (value) {
        prevState.value = { w: w.value, h: h.value, l: l.value, t: t.value };
        t.value = l.value = 0;
        w.value = parentEl.clientWidth;
        h.value = parentEl.clientHeight;
    } else {
        restoreSize();
    }
}

function restoreSize() {
    if (prevState.value) {
        l.value = prevState.value.l;
        t.value = prevState.value.t;
        h.value = prevState.value.h;
        w.value = prevState.value.w;
    }
}

function setupDragElements(selector?: string) {
    if (!selector) return;
    const oldList = parent.value!.querySelectorAll(".drag-el");
    oldList.forEach((el) => {
        el.classList.remove("drag-el");
    });

    const nodeList = parent.value!.querySelectorAll(selector);
    nodeList.forEach((el) => {
        el.classList.add("drag-el");
    });
    dragElements.value = Array.from(nodeList) as HTMLElement[];
}

function emitEvent(eventName: string, additionalOptions?: object) {
    emit(eventName as any, {
        eventName,
        left: l.value,
        top: t.value,
        width: w.value,
        height: h.value,
        cmp: parent.value,
        ...additionalOptions,
    });
}

function handleMove(event: MouseEvent | TouchEvent) {
    if (resizeState.value !== 0) {
        if (!dragState.value) {
            if (typeof w.value === 'string') {
                w.value = parent.value!.clientWidth;
            }
            if (typeof h.value === 'string') {
                h.value = parent.value!.clientHeight;
            }
        }

        let eventY: number, eventX: number;
        if ('touches' in event && event.touches.length >= 1) {
            eventY = event.touches[0].clientY;
            eventX = event.touches[0].clientX;
        } else if ('clientY' in event && 'clientX' in event) {
            eventY = event.clientY;
            eventX = event.clientX;
        } else {
            return; // Exit if we can't determine the event coordinates
        }

        if (props.maximize && prevState.value) {
            const parentWidth = parentSize.value.width;
            const parentHeight = parentSize.value.height;
            restoreSize();
            prevState.value = null;
            t.value = eventY > parentHeight / 2 ? parentHeight - Number(h.value) : 0;
            l.value = eventX > parentWidth / 2 ? parentWidth - Number(w.value) : 0;
            emitEvent("maximize", { state: false });
        }

        let diffX = eventX - mouseX.value + offsetX.value;
        let diffY = eventY - mouseY.value + offsetY.value;

        if (parent.value!.getBoundingClientRect()) {
            const rect = parent.value!.getBoundingClientRect();
            const scaleX = rect.width / parent.value!.offsetWidth || 1;
            const scaleY = rect.height / parent.value!.offsetHeight || 1;
            diffX /= scaleX;
            diffY /= scaleY;
        }

        offsetX.value = offsetY.value = 0;

        if (resizeState.value & ELEMENT_MASK["resizable-r"].bit) {
            if (!dragState.value && Number(w.value) + diffX < minW.value) {
                offsetX.value = diffX - (diffX = minW.value - Number(w.value));
            } else if (
                !dragState.value &&
                maxW.value &&
                Number(w.value) + diffX > maxW.value &&
                (!props.fitParent || Number(w.value) + Number(l.value) < parentSize.value.width)
            ) {
                offsetX.value = diffX - (diffX = maxW.value - Number(w.value));
            } else if (
                props.fitParent &&
                Number(l.value) + Number(w.value) + diffX > parentSize.value.width
            ) {
                offsetX.value = diffX - (diffX = parentSize.value.width - Number(l.value) - Number(w.value));
            }

            if (calcMap.value & CALC_MASK.w) {
                w.value = Number(w.value) + (dragState.value ? 0 : diffX);
            }
        }

        if (resizeState.value & ELEMENT_MASK["resizable-b"].bit) {
            if (!dragState.value && Number(h.value) + diffY < minH.value) {
                offsetY.value = diffY - (diffY = minH.value - Number(h.value));
            } else if (
                !dragState.value &&
                maxH.value &&
                Number(h.value) + diffY > maxH.value &&
                (!props.fitParent || Number(h.value) + Number(t.value) < parentSize.value.height)
            ) {
                offsetY.value = diffY - (diffY = maxH.value - Number(h.value));
            } else if (
                props.fitParent &&
                Number(t.value) + Number(h.value) + diffY > parentSize.value.height
            ) {
                offsetY.value = diffY - (diffY = parentSize.value.height - Number(t.value) - Number(h.value));
            }

            if (calcMap.value & CALC_MASK.h) {
                h.value = Number(h.value) + (dragState.value ? 0 : diffY);
            }
        }

        if (resizeState.value & ELEMENT_MASK["resizable-l"].bit) {
            if (!dragState.value && Number(w.value) - diffX < minW.value) {
                offsetX.value = diffX - (diffX = Number(w.value) - minW.value);
            } else if (
                !dragState.value &&
                maxW.value &&
                Number(w.value) - diffX > maxW.value &&
                Number(l.value) >= 0
            ) {
                offsetX.value = diffX - (diffX = Number(w.value) - maxW.value);
            } else if (props.fitParent && Number(l.value) + diffX < 0) {
                offsetX.value = diffX - (diffX = -Number(l.value));
            }

            if (calcMap.value & CALC_MASK.l) {
                l.value = Number(l.value) + diffX;
            }
            if (calcMap.value & CALC_MASK.w) {
                w.value = Number(w.value) - (dragState.value ? 0 : diffX);
            }
        }

        if (resizeState.value & ELEMENT_MASK["resizable-t"].bit) {
            if (!dragState.value && Number(h.value) - diffY < minH.value) {
                offsetY.value = diffY - (diffY = Number(h.value) - minH.value);
            } else if (
                !dragState.value &&
                maxH.value &&
                Number(h.value) - diffY > maxH.value &&
                Number(t.value) >= 0
            ) {
                offsetY.value = diffY - (diffY = Number(h.value) - maxH.value);
            } else if (props.fitParent && Number(t.value) + diffY < 0) {
                offsetY.value = diffY - (diffY = -Number(t.value));
            }

            if (calcMap.value & CALC_MASK.t) {
                t.value = Number(t.value) + diffY;
            }
            if (calcMap.value & CALC_MASK.h) {
                h.value = Number(h.value) - (dragState.value ? 0 : diffY);
            }
        }

        mouseX.value = eventX;
        mouseY.value = eventY;

        const eventName = !dragState.value ? "resize:move" : "drag:move";
        emitEvent(eventName);
    }
}

function handleDown(event: MouseEvent | TouchEvent) {
    const target = event.target as HTMLElement;

    if (target.closest && target.closest(".resizable-component") !== parent.value) {
        return;
    }

    for (const elClass in ELEMENT_MASK) {
        if (Object.prototype.hasOwnProperty.call(ELEMENT_MASK, elClass)) {
            if (
                parent.value!.contains(target) &&
                ((target.closest && target.closest(`.${elClass}`)) ||
                    target.classList.contains(elClass))
            ) {
                if (elClass === "drag-el") {
                    dragState.value = true;
                }

                document.body.style.cursor = ELEMENT_MASK[elClass as keyof typeof ELEMENT_MASK].cursor;

                if ('touches' in event && event.touches.length >= 1) {
                    mouseX.value = event.touches[0].clientX;
                    mouseY.value = event.touches[0].clientY;
                } else if ('clientX' in event && 'clientY' in event) {
                    event.preventDefault?.();
                    mouseX.value = event.clientX;
                    mouseY.value = event.clientY;
                } else {
                    return; // Exit if we can't determine the event coordinates
                }

                offsetX.value = 0;
                offsetY.value = 0;
                resizeState.value = ELEMENT_MASK[elClass as keyof typeof ELEMENT_MASK].bit;

                if (parent.value?.parentElement) {
                    parentSize.value = {
                        height: parent.value.parentElement.clientHeight,
                        width: parent.value.parentElement.clientWidth
                    };
                }

                const eventName = !dragState.value ? "resize:start" : "drag:start";
                emitEvent(eventName);
                break;
            }
        }
    }
}

function handleUp() {
    if (resizeState.value !== 0) {
        resizeState.value = 0;
        document.body.style.cursor = '';

        const eventName = !dragState.value ? "resize:end" : "drag:end";
        emitEvent(eventName);

        dragState.value = false;
    }
}
</script>

<style scoped>
.resizable-component {
    position: relative;
}

.resizable-component>.resizable-r {
    display: block;
    position: absolute;
    z-index: 90;
    touch-action: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    cursor: e-resize;
    width: 12px;
    right: -6px;
    top: 0;
    height: 100%;
}

.resizable-component>.resizable-rb {
    display: block;
    position: absolute;
    touch-action: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    cursor: se-resize;
    width: 12px;
    height: 12px;
    right: -6px;
    bottom: -6px;
    z-index: 91;
}

.resizable-component>.resizable-b {
    display: block;
    position: absolute;
    z-index: 90;
    touch-action: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    cursor: s-resize;
    height: 12px;
    bottom: -6px;
    width: 100%;
    left: 0;
}

.resizable-component>.resizable-lb {
    display: block;
    position: absolute;
    touch-action: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    cursor: sw-resize;
    width: 12px;
    height: 12px;
    left: -6px;
    bottom: -6px;
    z-index: 91;
}

.resizable-component>.resizable-l {
    display: block;
    position: absolute;
    z-index: 90;
    touch-action: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    cursor: w-resize;
    width: 12px;
    left: -6px;
    height: 100%;
    top: 0;
}

.resizable-component>.resizable-lt {
    display: block;
    position: absolute;
    touch-action: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    cursor: nw-resize;
    width: 12px;
    height: 12px;
    left: -6px;
    top: -6px;
    z-index: 91;
}

.resizable-component>.resizable-t {
    display: block;
    position: absolute;
    z-index: 90;
    touch-action: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    cursor: n-resize;
    height: 12px;
    top: -6px;
    width: 100%;
    left: 0;
}

.resizable-component>.resizable-rt {
    display: block;
    position: absolute;
    touch-action: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    cursor: ne-resize;
    width: 12px;
    height: 12px;
    right: -6px;
    top: -6px;
    z-index: 91;
}
</style>
