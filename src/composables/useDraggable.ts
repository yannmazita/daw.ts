import { useWindowsStore } from "@/stores/useWindowsStore";
import { computed, ref } from "vue";

export function useDraggable(id: string) {
    const store = useWindowsStore();
    const currentWindow = computed(() => store.windows.get(id));
    const rootElement = ref<HTMLDivElement | null>(null);
    const heightOffset = ref(0);

    function handleDrag(event: MouseEvent) {
        const parent = rootElement.value?.parentElement;
        if (!parent || !currentWindow?.value?.dragging) return;

        const parentRect = parent.getBoundingClientRect();
        const dx = event.clientX - currentWindow.value.lastMouseX;
        const dy = event.clientY - currentWindow.value.lastMouseY;

        // Calculate the new position relative to the parent
        const newXPos = currentWindow.value.xPos + dx;
        const newYPos = currentWindow.value.yPos + dy;

        // Constrain the new position within the parent boundaries, accounting for status bar height at the bottom
        const xPos = Math.max(0, Math.min(newXPos, parentRect.width - currentWindow.value.width));
        const yPos = Math.max(0, Math.min(newYPos, parentRect.height - currentWindow.value.height - heightOffset.value));

        store.updateWindow(id, {
            xPos,
            yPos,
            lastMouseX: event.clientX,
            lastMouseY: event.clientY
        });
    }

    function stopDrag() {
        store.updateWindow(id, { dragging: false });
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
        document.addEventListener('mouseup', stopDrag, { once: true });
    }

    return {
        toggleDrag,
        stopDrag,
        handleDrag,
    }
}
