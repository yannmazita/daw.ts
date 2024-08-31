import { ref } from 'vue';

export function useDragState() {
    const isVisible = ref(true);
    const windowComponent = ref(null);
    const windowComponentKey = ref('');
    const xPos = ref(100);
    const yPos = ref(100);
    const minimumWidth = ref(320);
    const maximumWidth = ref(1024);
    const minimumHeight = ref(240);
    const maximumHeight = ref(768);
    const initialWidth = ref(640);
    const initialHeight = ref(480);
    const windowProps = ref({});
    const dragging = ref(false);
    const resizing = ref(false);
    const resizeDirection = ref('');
    const lastMouseX = ref(0);
    const lastMouseY = ref(0);
    const width = ref(Math.min(Math.max(initialWidth.value, minimumWidth.value), maximumWidth.value));
    const height = ref(Math.min(Math.max(initialHeight.value, minimumHeight.value), maximumHeight.value));

    return {
        isVisible,
        windowComponent,
        windowComponentKey,
        xPos,
        yPos,
        minimumWidth,
        maximumWidth,
        minimumHeight,
        maximumHeight,
        initialWidth,
        initialHeight,
        windowProps,
        dragging,
        resizing,
        resizeDirection,
        lastMouseX,
        lastMouseY,
        width,
        height,
    };
}
