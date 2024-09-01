import { useWindowsStore } from "@/stores/useWindowsStore";
import { computed } from "vue";

export function useDraggable(id: string) {
    const store = useWindowsStore();
    const currentWindow = computed(() => store.windows.get(id));
    let rootElement: HTMLDivElement | null = null;

    function handleDrag(event: MouseEvent) {
        const parent = rootElement?.parentElement;
        const parentRect = parent?.getBoundingClientRect();

        //if (parentRect) {
        if (currentWindow?.value?.dragging && parentRect) {
            const dx = event.clientX - currentWindow.value.lastMouseX;
            const dy = event.clientY - currentWindow.value.lastMouseY;

            // Adjust pos.x and pos.y to consider the parent's position
            const xPos = Math.max(parentRect.left, Math.min(currentWindow.value.xPos + dx, parentRect.right - currentWindow.value.width));
            const yPos = Math.max(parentRect.top, Math.min(currentWindow.value.yPos + dy, parentRect.bottom - currentWindow.value.height));

            store.updateWindow(id, { xPos: xPos, yPos: yPos, lastMouseX: event.clientX, lastMouseY: event.clientY });
        }
    }

    function stopDrag() {
        store.updateWindow(id, { dragging: false });
        document.removeEventListener('mousemove', handleDrag);
    }

    function toggleDrag(event: MouseEvent, element: HTMLDivElement | null) {
        rootElement = element;
        store.updateWindow(id, { dragging: true, lastMouseX: event.clientX, lastMouseY: event.clientY })
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag, { once: true });
    }

    return {
        toggleDrag,
        stopDrag,
        handleDrag,
    }
}
