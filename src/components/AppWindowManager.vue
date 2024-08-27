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
        :maxWidth="maxWidthData" :maxHeight="maxHeightData" :active="isResizingData" :fitParent="true"
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
import { defineProps, defineEmits } from 'vue';
import { useWindow } from '@/components/AppWindowManager/useWindow'
import { WindowProps } from '@/components/AppWindowManager/types';
import VueResizable from 'vue-resizable';

const props = defineProps<WindowProps>();
const emit = defineEmits<{
    (e: 'clickMin'): void
    (e: 'clickWindow'): void
    (e: 'clickDestroy'): void
}>();

const {
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
} = useWindow(props, emit);

</script>

<style lang="css" scoped>
@import '@/components/AppWindowManager/styles.css';
</style>
