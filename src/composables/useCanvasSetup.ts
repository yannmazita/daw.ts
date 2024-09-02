import { ref, onMounted, onUnmounted, watch } from 'vue';

export function useCanvasSetup(width: number, height: number) {
  const canvas = ref<HTMLCanvasElement | null>(null);
  const ctx = ref<CanvasRenderingContext2D | null>(null);

  onMounted(() => {
    if (canvas.value) {
      ctx.value = canvas.value.getContext('2d');
    }
  });

  watch([width, height], () => {
    if (canvas.value) {
      canvas.value.width = width;
      canvas.value.height = height;
    }
  });

  return { canvas, ctx };
}
