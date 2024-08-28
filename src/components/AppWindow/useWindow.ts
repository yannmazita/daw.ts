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
* Original code derived from Vue-Window-Manager,
* licensed under the MIT License.
*
* Copyright (c) 2023 YUMA OBATA
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

import { onMounted, watch } from "vue";
import { useWindowState } from '@/components/AppWindow/useWindowState.ts';
import { WindowProps } from "@/components/AppWindow/types";

export function useWindow(props: WindowProps, emit: (event: string, ...args: unknown[]) => void) {
    const {
        topData,
        leftData,
        widthData,
        heightData,
        minWidthData,
        minHeightData,
        isResizingData,
        isActiveData,
        isMaximizedData,
        maxWidthData,
        maxHeightData,
        titleData,
        windowInnerWidthData,
        windowIdData,
        titleIconData,
        isButtonMaximizedData,
        isButtonMinimizedData,
        buttonsCol,
        buttonAreaWidth,
    } = useWindowState(props);


    function buttonCol(): void {
        buttonsCol.value = 1;
        if (isButtonMaximizedData.value) {
            buttonsCol.value++;
        }
        if (isButtonMinimizedData.value) {
            buttonsCol.value++;
        }
        buttonAreaWidth.value = buttonsCol.value * 46.6;
    };

    function endDrag(data: { left: number }): void {
        leftData.value = data.left;
    };

    function endResize(data: { width: number }): void {
        widthData.value = data.width;
    };

    function minimize(): void {
        emit("clickMin", windowIdData.value);
    };

    function activeMouse(): void {
        emit("clickWindow", windowIdData.value);
    };

    function maximize(): void {
        isMaximizedData.value = !isMaximizedData.value;
    };

    function close(): void {
        emit("clickDestroy", windowIdData.value);
    };

    watch(() => props.windowInnerWidth, (newValue) => {
        windowInnerWidthData.value = newValue;
        if (windowInnerWidthData.value !== null) {
            if (leftData.value + widthData.value > windowInnerWidthData.value) {
                leftData.value = windowInnerWidthData.value - widthData.value;
            }
        }
    }, { immediate: true });
    watch(() => props.top, (newValue) => {
        topData.value = newValue;
    }, { immediate: true });
    watch(() => props.left, (newValue) => {
        leftData.value = newValue;
    }, { immediate: true });
    watch(() => props.width, (newValue) => {
        widthData.value = newValue;
    }, { immediate: true });
    watch(() => props.height, (newValue) => {
        heightData.value = newValue;
    }, { immediate: true });
    watch(() => props.minWidth, (newValue) => {
        minWidthData.value = newValue;
    }, { immediate: true });
    watch(() => props.minHeight, (newValue) => {
        minHeightData.value = newValue;
    }, { immediate: true });
    watch(() => props.maxWidth, (newValue) => {
        maxWidthData.value = newValue;
    }, { immediate: true });
    watch(() => props.maxHeight, (newValue) => {
        maxHeightData.value = newValue;
    }, { immediate: true });
    watch(() => props.isResizing, (newValue) => {
        isResizingData.value = newValue;
    }, { immediate: true });
    watch(() => props.isActive, (newValue) => {
        isActiveData.value = newValue;
    }, { immediate: true });
    watch(() => props.isMaximized, (newValue) => {
        isMaximizedData.value = newValue;
    }, { immediate: true });
    watch(() => props.title, (newValue) => {
        titleData.value = newValue;
    }, { immediate: true });
    watch(() => props.titleIcon, (newValue) => {
        titleIconData.value = newValue;
    }, { immediate: true });
    watch(() => props.isButtonMaximized, (newValue) => {
        isButtonMaximizedData.value = newValue;
        buttonCol();
    }, { immediate: true });
    watch(() => props.isButtonMinimized, (newValue) => {
        isButtonMinimizedData.value = newValue;
        buttonCol();
    }, { immediate: true });

    onMounted(() => {
        buttonCol();
    });

    return {
        isActiveData,
        heightData,
        leftData,
        endDrag,
        widthData,
        endResize,
        minimize,
        activeMouse,
        maximize,
        close,
        topData,
        minWidthData,
        minHeightData,
        maxWidthData,
        maxHeightData,
        isResizingData,
        isMaximizedData,
        isButtonMinimizedData,
        isButtonMaximizedData,
        buttonAreaWidth,
        titleIconData,
        titleData,
        buttonsCol,
    }
};
