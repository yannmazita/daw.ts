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
import { useResizable } from '@/components/AppResizableContainer/useResizable';
import { ResizableProps, ResizeEventData } from '@/components/AppResizableContainer/types';

const props = withDefaults(defineProps<ResizableProps>(), {
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

const {
    parent,
    style,
    emitEvent,
} = useResizable(props, emit);

// Expose events
defineExpose({
    onMount: () => emitEvent('mount'),
    onDestroy: () => emitEvent('destroy'),
});
</script>

<style src="@/components/AppResizableContainer/styles.css" scoped></style>
