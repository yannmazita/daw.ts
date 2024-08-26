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


export const ELEMENT_MASK = {
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

export const CALC_MASK = {
    l: 0b0001,
    t: 0b0010,
    w: 0b0100,
    h: 0b1000,
} as const;
