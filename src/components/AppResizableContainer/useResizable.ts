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

import { onMounted, watch } from 'vue';
import { ResizableProps } from './types';
import { useResizableState } from './useResizableState';
import { useResizableStyle } from './useResizableStyle';
import { useResizableEvents } from './useResizableEvents';
import { useResizableActions } from './useResizableActions';
import { ELEMENT_MASK, CALC_MASK } from './constants';

export function useResizable(props: ResizableProps, emit: (event: string, ...args: any[]) => void) {
    const state = useResizableState(props);
    const style = useResizableStyle(state);
    const { emitEvent } = useResizableEvents(props, state, emit, handleMove, handleDown, handleUp);
    const { setMaximize, restoreSize, setupDragElements } = useResizableActions(props, state, emitEvent);
    const { parent, w, h, minW, minH, maxW, maxH, l, t, mouseX, mouseY, offsetX, offsetY, parentSize, resizeState, dragElements, dragState, calcMap, prevState } = state;

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

    function handleRightResize(diffX: number) {
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

    function handleBottomResize(diffY: number) {
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

    function handleLeftResize(diffX: number) {
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

    function handleTopResize(diffY: number) {
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
                handleRightResize(diffX);
            }

            if (resizeState.value & ELEMENT_MASK["resizable-b"].bit) {
                handleBottomResize(diffY);
            }

            if (resizeState.value & ELEMENT_MASK["resizable-l"].bit) {
                handleLeftResize(diffX);
            }

            if (resizeState.value & ELEMENT_MASK["resizable-t"].bit) {
                handleTopResize(diffY);
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
    });

    return {
        // Refs
        parent,
        w,
        h,
        minW,
        minH,
        maxW,
        maxH,
        l,
        t,
        mouseX,
        mouseY,
        offsetX,
        offsetY,
        parentSize,
        resizeState,
        dragElements,
        dragState,
        calcMap,
        prevState,

        // Computed
        style,

        // Event handlers
        handleMove,
        handleDown,
        handleUp,

        // Helper functions
        setMaximize,
        restoreSize,
        setupDragElements,
        emitEvent,
    };
}
