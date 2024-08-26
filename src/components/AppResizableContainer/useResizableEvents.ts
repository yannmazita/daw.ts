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


import { onMounted, onBeforeUnmount } from 'vue';
import { useResizableState } from './useResizableState';
import { ResizableProps } from './types';

export function useResizableEvents(
    props: ResizableProps,
    state: ReturnType<typeof useResizableState>,
    emit: (event: string, ...args: any[]) => void,
    handleMove: (event: MouseEvent | TouchEvent) => void,
    handleDown: (event: MouseEvent | TouchEvent) => void,
    handleUp: () => void
) {
    function emitEvent(eventName: string, additionalOptions?: object) {
        const { l, t, w, h, parent } = state;
        emit(eventName, {
            eventName,
            left: l.value,
            top: t.value,
            width: w.value,
            height: h.value,
            cmp: parent.value,
            ...additionalOptions,
        });
    }

    onMounted(() => {
        document.documentElement.addEventListener("mousemove", handleMove, true);
        document.documentElement.addEventListener("mousedown", handleDown, true);
        document.documentElement.addEventListener("mouseup", handleUp, true);
        document.documentElement.addEventListener("touchmove", handleMove, true);
        document.documentElement.addEventListener("touchstart", handleDown, true);
        document.documentElement.addEventListener("touchend", handleUp, true);
        emitEvent("mount");
    });

    onBeforeUnmount(() => {
        document.documentElement.removeEventListener("mousemove", handleMove, true);
        document.documentElement.removeEventListener("mousedown", handleDown, true);
        document.documentElement.removeEventListener("mouseup", handleUp, true);
        document.documentElement.removeEventListener("touchmove", handleMove, true);
        document.documentElement.removeEventListener("touchstart", handleDown, true);
        document.documentElement.removeEventListener("touchend", handleUp, true);
        emitEvent("destroy");
    });

    return { emitEvent };
}
