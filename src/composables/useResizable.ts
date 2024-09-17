import { useWindowsStore } from "@/stores/useWindowsStore";
import { Window } from "@/utils/interfaces";
import { computed, Ref } from "vue";

export function useResizable(id: string) {
    const store = useWindowsStore();
    const currentWindow = computed(() => store.windows.get(id)) as Ref<Window>;
    let rootElement: HTMLDivElement | null = null;

    function adjustSize(dx: number, dy: number, expandRight: boolean, expandDown: boolean) {
        if (!rootElement?.parentElement) return;

        const parent = rootElement.parentElement;
        const parentRect = parent.getBoundingClientRect();

        let newWidth = currentWindow.value.width + (expandRight ? dx : -dx);
        let newHeight = currentWindow.value.height + (expandDown ? dy : -dy);
        let newX = currentWindow.value.xPos;
        let newY = currentWindow.value.yPos;

        // Handle horizontal resizing (left/right handles)
        if (!expandRight) {
            newX = Math.max(0, Math.min(currentWindow.value.xPos + dx, currentWindow.value.xPos + currentWindow.value.width - currentWindow.value.minimumWidth));
        }

        // Handle vertical resizing (top/bottom handles)
        if (!expandDown) {
            newY = Math.max(0, Math.min(currentWindow.value.yPos + dy, currentWindow.value.yPos + currentWindow.value.height - currentWindow.value.minimumHeight));

            // Adjust height to respect parent's top boundary
            newHeight = currentWindow.value.yPos - newY + currentWindow.value.height;
            if (newY + newHeight > parentRect.bottom) {
                newHeight = parentRect.bottom - newY; // Prevent window from growing from the bottom
            }
        }

        // Ensure the window stays within the parent's right and bottom boundaries
        if (newX + newWidth > parentRect.width) {
            newWidth = parentRect.width - newX;
        }
        if (newY + newHeight > parentRect.height) {
            newHeight = parentRect.height - newY;
        }

        // Constrain the dimensions within the window's max/min sizes
        newWidth = Math.min(Math.max(newWidth, currentWindow.value.minimumWidth), currentWindow.value.maximumWidth);
        newHeight = Math.min(Math.max(newHeight, currentWindow.value.minimumHeight), currentWindow.value.maximumHeight);

        // Update the window position and size
        store.updateWindow(id, {
            xPos: newX,
            yPos: newY,
            width: newWidth,
            height: newHeight
        });
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
                    adjustSize(0, dy, false, false); // Top resizing
                    break;
                case 'south':
                    adjustSize(0, dy, false, true); // Bottom resizing
                    break;
                case 'east':
                    adjustSize(dx, 0, true, true); // Right resizing
                    break;
                case 'west':
                    adjustSize(dx, 0, false, false); // Left resizing
                    break;
            }

            store.updateWindow(id, { lastMouseX: event.clientX, lastMouseY: event.clientY });
        }
    }

    function toggleResize(direction: string, event: MouseEvent, element: HTMLDivElement | null) {
        if (!element) return; // Avoid setting null elements

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
    };
}
