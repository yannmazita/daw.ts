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
* along with daw.ts. If not, see https://www.gnu.org/licenses/.
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

const ELEMENT_MASK = {
    "resizable-r": { bit: 0b0001, cursor: "e-resize" },
    "resizable-rb": { bit: 0b0011, cursor: "se-resize" },
    "resizable-b": { bit: 0b0010, cursor: "s-resize" },
    "resizable-lb": { bit: 0b0110, cursor: "sw-resize" },
    "resizable-l": { bit: 0b0100, cursor: "w-resize" },
    "resizable-lt": { bit: 0b1100, cursor: "nw-resize" },
    "resizable-t": { bit: 0b1000, cursor: "n-resize" },
    "resizable-rt": { bit: 0b1001, cursor: "ne-resize" },
    "drag-el": { bit: 0b1111, cursor: "pointer" },
} as const;

const CALC_MASK = {
    l: 0b0001,
    t: 0b0010,
    w: 0b0100,
    h: 0b1000,
} as const;

interface Props {
    width?: number | string;
    minWidth?: number;
    maxWidth?: number;
    height?: number | string;
    minHeight?: number;
    maxHeight?: number;
    left?: number | string;
    top?: number | string;
    active?: Array<"r" | "rb" | "b" | "lb" | "l" | "lt" | "t" | "rt">;
    fitParent?: boolean;
    dragSelector?: string;
    maximize?: boolean;
    disableAttributes?: Array<"l" | "t" | "w" | "h">;
}

const props = withDefaults(defineProps<Props>(), {
    width: undefined,
    minWidth: 0,
    maxWidth: undefined,
    height: undefined,
    minHeight: 0,
    maxHeight: undefined,
    left: 0,
    top: 0,
    active: () => ["r", "rb", "b", "lb", "l", "lt", "t", "rt"],
    fitParent: false,
    dragSelector: undefined,
    maximize: false,
    disableAttributes: () => [],
});

const emit = defineEmits<{
    (e: 'mount'): void
    (e: 'destroy'): void
    (e: 'resize:start', data: ResizeEventData): void
    (e: 'resize:move', data: ResizeEventData): void
    (e: 'resize:end', data: ResizeEventData): void
    (e: 'drag:start', data: ResizeEventData): void
    (e: 'drag:move', data: ResizeEventData): void
    (e: 'drag:end', data: ResizeEventData): void
    (e: 'maximize', data: { state: boolean }): void
}>();

const parent = ref<HTMLElement | null>(null);
const w = ref<number | string>(props.width ?? 0);
const h = ref<number | string>(props.height ?? 0);
const minW = ref(props.minWidth);
const minH = ref(props.minHeight);
const maxW = ref(props.maxWidth);
const maxH = ref(props.maxHeight);
const l = ref<number | string>(props.left);
const t = ref<number | string>(props.top);
const mouseX = ref(0);
const mouseY = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);
const parentSize = ref({ width: 0, height: 0 });
const resizeState = ref(0);
const dragElements = ref<HTMLElement[]>([]);
const dragState = ref(false);
const calcMap = ref(0b1111);
const prevState = ref<{ w: number | string; h: number | string; l: number | string; t: number | string; } | null>(null);

interface ResizeEventData {
    eventName: string;
    left: number | string;
    top: number | string;
    width: number | string;
    height: number | string;
    cmp: any;
}

const style = computed(() => ({
    ...(calcMap.value & CALC_MASK.w && {
        width: typeof w.value === "number" ? `${w.value}px` : w.value,
    }),
    ...(calcMap.value & CALC_MASK.h && {
        height: typeof h.value === "number" ? `${h.value}px` : h.value,
    }),
    ...(calcMap.value & CALC_MASK.l && {
        left: typeof l.value === "number" ? `${l.value}px` : l.value,
    }),
    ...(calcMap.value & CALC_MASK.t && {
        top: typeof t.value === "number" ? `${t.value}px` : t.value,
    }),
}));

watch(() => props.maxWidth, (value) => { maxW.value = value; });
watch(() => props.maxHeight, (value) => { maxH.value = value; });
watch(() => props.minWidth, (value) => { minW.value = value; });
watch(() => props.minHeight, (value) => { minH.value = value; });
watch(() => props.width, (value) => { if (typeof value === "number") w.value = value; });
watch(() => props.height, (value) => { if (typeof value === "number") h.value = value; });
watch(() => props.left, (value) => { if (typeof value === "number") l.value = value; });
watch(() => props.top, (value) => { if (typeof value === "number") t.value = value; });
watch(() => props.dragSelector, (selector) => { setupDragElements(selector); });
watch(() => props.maximize, (value) => {
    setMaximize(value);
    emitEvent("maximize", { state: value });
});

onMounted(() => {
    if (!props.width) {
        w.value = parent.value!.parentElement!.clientWidth;
    } else if (props.width !== "auto") {
        if (typeof props.width !== "number") w.value = parent.value!.clientWidth;
    }
    if (!props.height) {
        h.value = parent.value!.parentElement!.clientHeight;
    } else if (props.height !== "auto") {
        if (typeof props.height !== "number") h.value = parent.value!.clientHeight;
    }
    if (typeof props.left !== "number") {
        l.value = parent.value!.offsetLeft - parent.value!.parentElement!.offsetLeft;
    }
    if (typeof props.top !== "number") {
        t.value = parent.value!.offsetTop - parent.value!.parentElement!.offsetTop;
    }

    const wNum = typeof w.value === 'number' ? w.value : parseFloat(w.value);
    const hNum = typeof h.value === 'number' ? h.value : parseFloat(h.value);

    if (minW.value && wNum < minW.value) w.value = minW.value;
    if (minH.value && hNum < minH.value) h.value = minH.value;
    if (maxW.value && wNum > maxW.value) w.value = maxW.value;
    if (maxH.value && hNum > maxH.value) h.value = maxH.value;

    setMaximize(props.maximize);
    setupDragElements(props.dragSelector);

    props.disableAttributes.forEach((attr) => {
        switch (attr) {
            case "l":
                calcMap.value &= ~CALC_MASK.l;
                break;
            case "t":
                calcMap.value &= ~CALC_MASK.t;
                break;
            case "w":
                calcMap.value &= ~CALC_MASK.w;
                break;
            case "h":
                calcMap.value &= ~CALC_MASK.h;
        }
    });

    document.documentElement.addEventListener("mousemove", handleMove, true);
    document.documentElement.addEventListener("mousedown", handleDown, true);
    document.documentElement.addEventListener("mouseup", handleUp, true);
    document.documentElement.addEventListener("touchmove", handleMove, true);
    document.documentElement.addEventListener("touchstart", handleDown, true);
    document.documentElement.addEventListener("touchend", handleUp, true);
    emit("mount");
});

onBeforeUnmount(() => {
    document.documentElement.removeEventListener("mousemove", handleMove, true);
    document.documentElement.removeEventListener("mousedown", handleDown, true);
    document.documentElement.removeEventListener("mouseup", handleUp, true);
    document.documentElement.removeEventListener("touchmove", handleMove, true);
    document.documentElement.removeEventListener("touchstart", handleDown, true);
    document.documentElement.removeEventListener("touchend", handleUp, true);
    emit("destroy");
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
