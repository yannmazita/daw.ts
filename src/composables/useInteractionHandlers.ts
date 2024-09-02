import { Ref } from 'vue';

export function useInteractionHandlers(canvas: Ref<HTMLCanvasElement | null>) {
    const handleZoom = (event: WheelEvent) => {
    };

    const handleScroll = (event: WheelEvent) => {
    };

    const setupEventListeners = () => {
        canvas.value?.addEventListener('wheel', handleZoom);
    };

    const cleanupEventListeners = () => {
        canvas.value?.removeEventListener('wheel', handleZoom);
    };

    return { setupEventListeners, cleanupEventListeners };
}
