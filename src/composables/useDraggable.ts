import { useWindowsStore } from "@/stores/useWindowsStore";
import { computed, ref, watch } from "vue";

export function useDraggable(id: string) {
    const store = useWindowsStore();
    const currentWindow = computed(() => store.windows.get(id));
    const rootElement = ref<HTMLDivElement | null>(null);
    const heightOffset = ref(0);

    const updateRootElement = (element: HTMLDivElement | null) => {
        rootElement.value = element;
        if (element) {
            heightOffset.value = (element.parentElement?.offsetTop ?? 0);
        }
    };

    function handleDrag(event: MouseEvent) {
        const parent = rootElement.value?.parentElement;

        if (!parent || !currentWindow?.value?.dragging) return;
        if (currentWindow.value.isMaximized) return;
        if (currentWindow.value.isMinimized) return;

        const parentRect = parent.getBoundingClientRect();
        const dx = event.clientX - currentWindow.value.lastMouseX;
        const dy = event.clientY - currentWindow.value.lastMouseY;

        // Calculate the new position relative to the parent
        let newXPos = currentWindow.value.xPos + dx;
        let newYPos = currentWindow.value.yPos + dy;

        // Constrain the new position within the parent boundaries, accounting for status bar height at the bottom
        newXPos = Math.max(0, Math.min(newXPos, parentRect.width - currentWindow.value.width));
        newYPos = Math.max(0, Math.min(newYPos, parentRect.height - currentWindow.value.height - heightOffset.value));

        store.updateWindow(id, {
            xPos: newXPos,
            yPos: newYPos,
            lastMouseX: event.clientX,
            lastMouseY: event.clientY
        });
    }

    function stopDrag(event: MouseEvent) {
        store.updateWindow(id, {
            dragging: false,
            lastMouseX: event.clientX,
            lastMouseY: event.clientY
        });
        document.removeEventListener('mousemove', handleDrag);
    }


    function toggleDrag(event: MouseEvent, element: HTMLDivElement | null) {
        rootElement.value = element;

        // Calculate and store the status bar height
        if (element) {
            heightOffset.value = (element.parentElement?.offsetTop ?? 0);
        }

        store.updateWindow(id, {
            dragging: true,
            lastMouseX: event.clientX,
            lastMouseY: event.clientY
        });
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', (event) => stopDrag(event), { once: true });
    }

    // Watch for changes in the root element's parent dimensions
    watch(() => rootElement.value?.parentElement?.getBoundingClientRect(), (newRect, oldRect) => {
        if (newRect && oldRect && (newRect.width !== oldRect.width || newRect.height !== oldRect.height)) {
            console.log('Parent dimensions changed', newRect);
        }
    }, { deep: true });

    return {
        toggleDrag,
        stopDrag,
        handleDrag,
        updateRootElement,
    }
}
