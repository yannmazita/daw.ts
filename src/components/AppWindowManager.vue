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
    <AppResizableContainer v-if="isActiveData" style=" overflow-wrap: break-word;"
        class="grid grid-rows-[30px_1fr] border border-black shadow-inner box-content text-white"
        :dragSelector="'.toolbar'" :top=topData :left=leftData :width=widthData :height=heightData :maxWidth=maxWidthData
        :maxHeight=maxHeightData :minWidth=minWidthData :min-height=minHeightData :active=isResizingData
        :maximize=isMaximizedData :fitParent=true @drag:end="endDrag" @resize:end="endResize" @mousedown="activeMouse">
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
    </AppResizableContainer>
</template>

<script>
import {
    defineComponent,
    toRefs,
    ref,
    watch,
    onMounted,
} from "vue";
import AppResizableContainer from '@/components/AppResizableContainer.vue';
export default defineComponent({
    components: { AppResizableContainer },
    props: {
        top: {
            type: Number,
        },
        left: {
            type: Number,
        },
        width: {
            type: Number,
        },
        height: {
            type: Number,
        },
        minWidth: {
            type: Number,
        },
        minHeight: {
            type: Number,
        },
        isResizing: {
            type: Array,
        },
        isActive: {
            type: Boolean,
        },
        titleIcon: {
            type: String,
        },
        isMaximized: {
            type: Boolean,
        },
        maxWidth: {
            type: Number,
        },
        maxHeight: {
            type: Number,
        },
        title: {
            type: String,
        },
        windowInnerWidth: {
            type: Number,
        },
        windowId: {
            type: String,
        },
        isButtonMaximized: {
            type: Boolean,
        },
        isButtonMinimized: {
            type: Boolean,
        },
    },
    setup(props, ctx) {
        const {
            top,
            left,
            width,
            height,
            minWidth,
            minHeight,
            isResizing,
            isActive,
            maxWidth,
            maxHeight,
            title,
            titleIcon,
            windowInnerWidth,
            windowId,
            isMaximized,
            isButtonMaximized,
            isButtonMinimized,
        } = toRefs(props);
        const topData = ref(top.value);
        const leftData = ref(left.value);
        const widthData = ref(width.value);
        const heightData = ref(height.value);
        const minWidthData = ref(minWidth.value);
        const minHeightData = ref(minHeight.value);
        const isResizingData = ref(isResizing.value);
        const isActiveData = ref(isActive.value);
        const isMaximizedData = ref(isMaximized.value);
        const maxWidthData = ref(maxWidth.value);
        const maxHeightData = ref(maxHeight.value);
        const titleData = ref(title.value);
        const windowInnerWidthData = ref(windowInnerWidth.value);
        const windowIdData = ref(windowId.value);
        const titleIconData = ref(titleIcon.value);
        const isButtonMaximizedData = ref(isButtonMaximized.value);
        const isButtonMinimizedData = ref(isButtonMinimized.value);
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
        const endDrag = (data) => {
            leftData.value = data.left;
        };
        const endResize = (data) => {
            widthData.value = data.width;
        };
        const minimize = () => {
            ctx.emit("clickMin", windowIdData.value);
        };
        const activeMouse = () => {
            ctx.emit("clickWindow", windowIdData.value);
        };
        const maximize = () => {
            if (isMaximizedData.value) {
                isMaximizedData.value = false;
            } else {
                isMaximizedData.value = true;
            }
        };
        const close = () => {
            ctx.emit("clickDestroy", windowIdData.value);
        };
        watch(windowInnerWidth, (newValue) => {
            windowInnerWidthData.value = newValue;
            if (leftData.value + widthData.value > windowInnerWidthData.value) {
                leftData.value = windowInnerWidthData.value - widthData.value;
            }
        });
        watch(top, (newValue) => {
            topData.value = newValue;
        });
        watch(left, (newValue) => {
            leftData.value = newValue;
        });
        watch(width, (newValue) => {
            widthData.value = newValue;
        });
        watch(height, (newValue) => {
            heightData.value = newValue;
        });
        watch(minWidth, (newValue) => {
            minWidthData.value = newValue;
        });
        watch(minHeight, (newValue) => {
            minHeightData.value = newValue;
        });
        watch(isResizing, (newValue) => {
            isResizingData.value = newValue;
        });
        watch(isActive, (newValue) => {
            isActiveData.value = newValue;
        });
        watch(isMaximized, (newValue) => {
            isMaximizedData.value = newValue;
        });
        watch(maxWidth, (newValue) => {
            maxWidthData.value = newValue;
        });
        watch(maxHeight, (newValue) => {
            maxHeightData.value = newValue;
        });
        watch(title, (newValue) => {
            titleData.value = newValue;
        });
        watch(titleIcon, (newValue) => {
            titleIconData.value = newValue;
        }),
            watch(windowId, (newValue) => {
                windowIdData.value = newValue;
            });
        watch(isButtonMaximized, (newValue) => {
            isButtonMaximizedData.value = newValue;
            buttonCol();
        });
        watch(isButtonMinimized, (newValue) => {
            isButtonMinimizedData.value = newValue;
            buttonCol();
        });
        onMounted(() => {
            buttonCol();
        });
        return {
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
            isButtonMaximizedData,
            isButtonMinimizedData,
            buttonsCol,
            buttonAreaWidth,
            titleIconData,
            buttonCol,
            endDrag,
            endResize,
            minimize,
            activeMouse,
            maximize,
            close,
        };
    },
});
</script>
<style lang="css" scoped>
@import '@/css/windows10.css';
</style>
