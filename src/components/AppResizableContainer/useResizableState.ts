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


import { ref, Ref } from 'vue';
import { ResizableProps } from './types';

export function useResizableState(props: ResizableProps) {
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

    return {
        parent, w, h, minW, minH, maxW, maxH, l, t, mouseX, mouseY,
        offsetX, offsetY, parentSize, resizeState, dragElements,
        dragState, calcMap, prevState
    };
}
