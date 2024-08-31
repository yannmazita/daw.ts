import { useDragState } from './useDragState';

export function useResizable(state: ReturnType<typeof useDragState>) {

    function startResize(direction: string, event: MouseEvent) {
        const { resizing, resizeDirection, lastMouseX, lastMouseY } = state;
        resizing.value = true;
        resizeDirection.value = direction;
        lastMouseX.value = event.clientX;
        lastMouseY.value = event.clientY;
    }

    function stopResize() {
        const { resizing, resizeDirection } = state;
        resizing.value = false;
        resizeDirection.value = '';
    }

    function adjustSize(rootElement: HTMLDivElement, dx: number, dy: number, expandRight: boolean, expandDown: boolean) {
        // Currently there is a bug when resizing using the north handle and encountering the parent's top boundary
        // Trying to resize past the boundary will mean the component grows from the bottom.

        const parent = rootElement.parentElement;
        const parentRect = parent?.getBoundingClientRect();
        const { xPos, yPos, width, height, minimumWidth, maximumWidth, minimumHeight, maximumHeight } = state;

        if (state.resizeDirection.value === 'north') {
            const newHeight = Math.min(Math.max(state.height.value - dy, state.minimumHeight.value), state.maximumHeight.value);
            if (newHeight > state.minimumHeight.value) {
                const newY = state.yPos.value + dy;
                if (newY >= parentRect.top && newY + newHeight <= parentRect.bottom) {
                    yPos.value = newY;
                    height.value = newHeight;
                } else {
                    // Adjust height only to prevent moving with the mouse
                    height.value = newHeight;
                }
            }
        } else {
            const newWidth = Math.min(Math.max(width.value + (expandRight ? dx : -dx), minimumWidth.value), maximumWidth.value);
            const newHeight = Math.min(Math.max(height.value + (expandDown ? dy : -dy), minimumHeight.value), maximumHeight.value);

            // Adjust xPos.value position for west resizing
            if (!expandRight && newWidth > minimumWidth.value) {
                const newX = xPos.value + dx;
                if (newX >= parentRect.left && newX + newWidth <= parentRect.right) {
                    xPos.value = newX;
                    width.value = newWidth;
                } else {
                    // Adjust width only to prevent moving with the mouse
                    width.value = newWidth;
                }
            } else if (expandRight) {
                if (xPos.value + newWidth <= parentRect.right) {
                    width.value = newWidth;
                }
            }

            // Adjust yPos.value position for north resizing (handled above) and south resizing
            if (!expandDown && newHeight > minimumHeight.value) {
                const newY = yPos.value + dy;
                if (newY >= parentRect.top && newY + newHeight <= parentRect.bottom) {
                    yPos.value = newY;
                    height.value = newHeight;
                } else {
                    // Adjust height only to prevent moving with the mouse
                    height.value = newHeight;
                }
            } else if (expandDown) {
                if (yPos.value + newHeight <= parentRect.bottom) {
                    height.value = newHeight;
                }
            }
        }
    }

    function handleResize(event: MouseEvent, rootElement: HTMLDivElement) {
        const { lastMouseX, lastMouseY, resizing, resizeDirection } = state;

        if (resizing.value) {
            const dx = event.clientX - lastMouseX.value;
            const dy = event.clientY - lastMouseY.value;

            switch (resizeDirection.value) {
                case 'se':
                    adjustSize(rootElement, dx, dy, true, true);
                    break;
                case 'sw':
                    adjustSize(rootElement, dx, dy, false, true);
                    break;
                case 'nw':
                    adjustSize(rootElement, dx, dy, false, false);
                    break;
                case 'ne':
                    adjustSize(rootElement, dx, dy, true, false);
                    break;
                case 'north':
                    adjustSize(rootElement, 0, dy, false, false);
                    break;
                case 'south':
                    adjustSize(rootElement, 0, dy, true, true);
                    break;
                case 'east':
                    adjustSize(rootElement, dx, 0, true, true);
                    break;
                case 'west':
                    adjustSize(rootElement, dx, 0, false, false);
                    break;
            }
        }

        lastMouseX.value = event.clientX;
        lastMouseY.value = event.clientY;
    }

    return {
        startResize,
        stopResize,
        handleResize,
    }
}
