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

import { ref } from 'vue';
import { WindowProps } from './types';

export function useWindowState(props: WindowProps) {
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
        titleIconData,
        isButtonMaximizedData,
        isButtonMinimizedData,
        buttonsCol,
        buttonAreaWidth,
    };
}
