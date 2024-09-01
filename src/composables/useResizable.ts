import { useWindowsStore } from "@/stores/useWindowsStore";
import { Window } from "@/utils/interfaces";
import { computed, Ref } from "vue";

export function useResizable(id: string) {
    const store = useWindowsStore();
    const currentWindow = computed(() => store.windows.get(id)) as Ref<Window>;
    let rootElement: HTMLDivElement | null = null;

    function adjustSize(dx: number, dy: number, expandRight: boolean, expandDown: boolean) {
        // Currently there is a bug when resizing using the north handle and encountering the parent's top boundary
        // Trying to resize past the boundary will mean the component grows from the bottom.

        const parent = rootElement?.parentElement;
        const parentRect = parent?.getBoundingClientRect();

        if (currentWindow.value.resizeDirection === 'north') {
            const newHeight = Math.min(Math.max(currentWindow.value.height - dy, currentWindow.value.minimumHeight), currentWindow.value.maximumHeight);
            if (newHeight > currentWindow.value.minimumHeight) {
                const newY = currentWindow.value.yPos + dy;
                if (newY >= parentRect.top && newY + newHeight <= parentRect.bottom) {
                    store.updateWindow(id, { yPos: newY, height: newHeight });
                } else {
                    // Adjust height only to prevent moving with the mouse
                    store.updateWindow(id, { height: newHeight });
                }
            }
        } else {
            const newWidth = Math.min(Math.max(currentWindow.value.width + (expandRight ? dx : -dx), currentWindow.value.minimumWidth), currentWindow.value.maximumWidth);
            const newHeight = Math.min(Math.max(currentWindow.value.height + (expandDown ? dy : -dy), currentWindow.value.minimumHeight), currentWindow.value.maximumHeight);

            // Adjust currentWindow.value.xPos position for west resizing
            if (!expandRight && newWidth > currentWindow.value.minimumWidth) {
                const newX = currentWindow.value.xPos + dx;
                if (newX >= parentRect.left && newX + newWidth <= parentRect.right) {
                    store.updateWindow(id, { xPos: newX, width: newWidth });
                } else {
                    // Adjust width only to prevent moving with the mouse
                    store.updateWindow(id, { width: newWidth });
                }
            } else if (expandRight) {
                if (currentWindow.value.xPos + newWidth <= parentRect.right) {
                    store.updateWindow(id, { width: newWidth });
                }
            }

            // Adjust currentWindow.value.yPos position for north resizing (handled above) and south resizing
            if (!expandDown && newHeight > currentWindow.value.minimumHeight) {
                const newY = currentWindow.value.yPos + dy;
                if (newY >= parentRect.top && newY + newHeight <= parentRect.bottom) {
                    store.updateWindow(id, { yPos: newY, height: newHeight });
                } else {
                    // Adjust height only to prevent moving with the mouse
                    store.updateWindow(id, { height: newHeight });
                }
            } else if (expandDown) {
                if (currentWindow.value.yPos + newHeight <= parentRect.bottom) {
                    store.updateWindow(id, { height: newHeight });
                }
            }
        }
    }

    function handleResize(event: MouseEvent) {
        if (currentWindow.value.resizing) {
            const dx = event.clientX - currentWindow.value.lastMouseX;
            const dy = event.clientY - currentWindow.value.lastMouseY;

            switch (currentWindow.value.resizeDirection) {
                case 'se':
                    adjustSize(dx, dy, true, true);
                    break;
                case 'sw':
                    adjustSize(dx, dy, false, true);
                    break;
                case 'nw':
                    adjustSize(dx, dy, false, false);
                    break;
                case 'ne':
                    adjustSize(dx, dy, true, false);
                    break;
                case 'north':
                    adjustSize(0, dy, false, false);
                    break;
                case 'south':
                    adjustSize(0, dy, false, true);
                    break;
                case 'east':
                    adjustSize(dx, 0, true, true);
                    break;
                case 'west':
                    adjustSize(dx, 0, false, false);
                    break;
            }

            store.updateWindow(id, { lastMouseX: event.clientX, lastMouseY: event.clientY });
        }
    }

    function toggleResize(direction: string, event: MouseEvent, element: HTMLDivElement | null) {
        rootElement = element;
        store.updateWindow(id, { resizing: true, resizeDirection: direction, lastMouseX: event.clientX, lastMouseY: event.clientY });
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize, { once: true });
    }

    function stopResize() {
        store.updateWindow(id, { resizing: false, resizeDirection: '' });
        document.removeEventListener('mousemove', handleResize);
    }

    return {
        toggleResize,
        stopResize,
        handleResize,
    }
}
