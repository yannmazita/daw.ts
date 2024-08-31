import { Window } from "@/utils/interfaces";

export function useResizable(currentWindow: Window) {

    function startResize(direction: string, event: MouseEvent) {
        currentWindow.resizing = true;
        currentWindow.resizeDirection = direction;
        currentWindow.lastMouseX = event.clientX;
        currentWindow.lastMouseY = event.clientY;
    }

    function stopResize() {
        currentWindow.resizing = false;
        currentWindow.resizeDirection = '';
    }

    function adjustSize(rootElement: HTMLDivElement, dx: number, dy: number, expandRight: boolean, expandDown: boolean) {
        // Currently there is a bug when resizing using the north handle and encountering the parent's top boundary
        // Trying to resize past the boundary will mean the component grows from the bottom.

        const parent = rootElement.parentElement;
        const parentRect = parent?.getBoundingClientRect();
        const { width, height, minimumWidth, maximumWidth, minimumHeight, maximumHeight } = currentWindow;

        if (currentWindow.resizeDirection === 'north') {
            const newHeight = Math.min(Math.max(currentWindow.height - dy, currentWindow.minimumHeight), currentWindow.maximumHeight);
            if (newHeight > currentWindow.minimumHeight) {
                const newY = currentWindow.yPos + dy;
                if (newY >= parentRect.top && newY + newHeight <= parentRect.bottom) {
                    currentWindow.yPos = newY;
                    currentWindow.height = newHeight;
                } else {
                    // Adjust height only to prevent moving with the mouse
                    currentWindow.height = newHeight;
                }
            }
        } else {
            const newWidth = Math.min(Math.max(width + (expandRight ? dx : -dx), minimumWidth), maximumWidth);
            const newHeight = Math.min(Math.max(height + (expandDown ? dy : -dy), minimumHeight), maximumHeight);

            // Adjust currentWindow.xPos position for west resizing
            if (!expandRight && newWidth > minimumWidth) {
                const newX = currentWindow.xPos + dx;
                if (newX >= parentRect.left && newX + newWidth <= parentRect.right) {
                    currentWindow.xPos = newX;
                    currentWindow.width = newWidth;
                } else {
                    // Adjust width only to prevent moving with the mouse
                    currentWindow.width = newWidth;
                }
            } else if (expandRight) {
                if (currentWindow.xPos + newWidth <= parentRect.right) {
                    currentWindow.width = newWidth;
                }
            }

            // Adjust currentWindow.yPos position for north resizing (handled above) and south resizing
            if (!expandDown && newHeight > minimumHeight) {
                const newY = currentWindow.yPos + dy;
                if (newY >= parentRect.top && newY + newHeight <= parentRect.bottom) {
                    currentWindow.yPos = newY;
                    currentWindow.height = newHeight;
                } else {
                    // Adjust height only to prevent moving with the mouse
                    currentWindow.height = newHeight;
                }
            } else if (expandDown) {
                if (currentWindow.yPos + newHeight <= parentRect.bottom) {
                    currentWindow.height = newHeight;
                }
            }
        }
    }

    function handleResize(event: MouseEvent, rootElement: HTMLDivElement) {
        if (currentWindow.resizing) {
            const dx = event.clientX - currentWindow.lastMouseX;
            const dy = event.clientY - currentWindow.lastMouseY;

            switch (currentWindow.resizeDirection) {
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

        currentWindow.lastMouseX = event.clientX;
        currentWindow.lastMouseY = event.clientY;
    }

    return {
        startResize,
        stopResize,
        handleResize,
    }
}
