import { useDragState } from './useDragState';

export function useDraggable(state: ReturnType<typeof useDragState>) {

    function startDrag(event: MouseEvent) {
        state.dragging.value = true;
        state.lastMouseX.value = event.clientX;
        state.lastMouseY.value = event.clientY;
    }

    function stopDrag() {
        state.dragging.value = false;
    }

    function handleDrag(event: MouseEvent, rootElement: HTMLDivElement) {
        const parent = rootElement.parentElement;
        const parentRect = parent?.getBoundingClientRect();

        //if (parentRect) {
        if (state.dragging.value && parentRect) {
            const dx = event.clientX - state.lastMouseX.value;
            const dy = event.clientY - state.lastMouseY.value;

            // Adjust pos.x and pos.y to consider the parent's position
            state.xPos.value = Math.max(parentRect.left, Math.min(state.xPos.value + dx, parentRect.right - state.width.value));
            state.yPos.value = Math.max(parentRect.top, Math.min(state.yPos.value + dy, parentRect.bottom - state.height.value));

            state.lastMouseX.value = event.clientX;
            state.lastMouseY.value = event.clientY;
        }
    }

    return {
        startDrag,
        stopDrag,
        handleDrag,
    }
}
