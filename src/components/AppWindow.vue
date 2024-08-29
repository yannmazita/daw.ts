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

<template>
    <VueResizable v-if="isActiveData" style="overflow-wrap: break-word;"
        class="grid grid-rows-[30px_1fr] border border-black shadow-inner box-content text-white" :width="widthData"
        :height="heightData" :left="leftData" :top="topData" :minWidth="minWidthData" :min-height="minHeightData"
        :maxWidth="maxWidthData" :maxHeight="maxHeightData" :active="isResizingData" :fitParent="false"
        :dragSelector="'.toolbar'" :maximize="isMaximizedData" @drag:end="endDrag" @resize:end="endResize"
        @mousedown="activeMouse">
        <div :class="`toolbar grid items-center pl-1 select-none backdrop-blur-[5px] bg-black opacity-65`"
            :style="`grid-template-columns: 24px 1fr ${buttonAreaWidth}px; `">
            <div class="size-4 bg-cover justify-self-center" :style="`background-image: url('${titleIconData}');`" />
            <div>{{ titleData }}</div>
            <div class="grid h-full" :style="`grid-template-columns: repeat(${buttonsCol}, 1fr);`">
                <div v-if="isButtonMinimizedData"
                    class="flex items-center justify-center cursor-default text-sm hover:bg-[#858585] active:bg-[#5f5f5f]"
                    @click="minimize">&#9472;</div>
                <div v-if="isButtonMaximizedData" class="flex items-center justify-center cursor-default text-sm"
                    @click="maximize">&#9723;</div>
                <div class="flex items-center justify-center cursor-default text-sm hover:bg-[#e81123] active:bg-[#8b0a14]"
                    @click="close">&#10005;</div>
            </div>
        </div>
        <slot />
    </VueResizable>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineProps, defineEmits } from 'vue';
import VueResizable from 'vue-resizable';

interface Props {
    top: number;
    left: number;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    isDragging: boolean;
    isResizing: ('r' | 'rb' | 'b' | 'lb' | 'l' | 'lt' | 't' | 'rt')[];
    isActive: boolean;
    isMaximized: boolean;
    maxWidth: number;
    maxHeight: number;
    title: string;
    windowInnerWidth: number;
    windowId: string;
    titleIcon: string;
    isButtonMaximized: boolean;
    isButtonMinimized: boolean;
}
const props = defineProps<Props>();

const emits = defineEmits(['clickMin', 'clickWindow', 'clickDestroy']);

const topData = ref(props.top);
const leftData = ref(props.left);
const widthData = ref(props.width);
const heightData = ref(props.height);
const minWidthData = ref(props.minWidth);
const minHeightData = ref(props.minHeight);
const isResizingData = ref(props.isResizing);
const isActiveData = ref(props.isActive);
const isMaximizedData = ref(props.isMaximized);
const maxWidthData = ref(props.maxWidth);
const maxHeightData = ref(props.maxHeight);
const titleData = ref(props.title);
const windowInnerWidthData = ref(props.windowInnerWidth);
const windowIdData = ref(props.windowId);
const titleIconData = ref(props.titleIcon);
const isButtonMaximizedData = ref(props.isButtonMaximized);
const isButtonMinimizedData = ref(props.isButtonMinimized);
const buttonsCol = ref(1);
const buttonAreaWidth = ref(0);

const buttonCol = () => {
    buttonsCol.value = 1;
    if (isButtonMaximizedData.value) {
        buttonsCol.value++;
    }
    if (isButtonMinimizedData.value) {
        buttonsCol.value++;
    }
    buttonAreaWidth.value = buttonsCol.value * 46.6;
};

const endDrag = (data: { left: number }) => {
    leftData.value = data.left;
};

const endResize = (data: { width: number }) => {
    widthData.value = data.width;
};

const minimize = () => {
    emits('clickMin', windowIdData.value);
};

const activeMouse = () => {
    emits('clickWindow', windowIdData.value);
};

const maximize = () => {
    isMaximizedData.value = !isMaximizedData.value;
};

const close = () => {
    emits('clickDestroy', windowIdData.value);
};

// Watchers
watch(() => props.windowInnerWidth, (newValue) => {
    windowInnerWidthData.value = newValue;
    if (leftData.value + widthData.value > windowInnerWidthData.value) {
        leftData.value = windowInnerWidthData.value - widthData.value;
    }
});

onMounted(buttonCol);
</script>

<style lang="css" scoped>
@import '@/components/AppWindow/styles.css';
</style>
