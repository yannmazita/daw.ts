// File: src/composables/usePianoRollCanvas.ts
// Description: 
import { usePianoRollStore } from '@/stores/usePianoRollStore';
import { Ref } from 'vue';

export function usePianoRollCanvas(
    canvasRef: Ref<HTMLCanvasElement>,
    width: Ref<number>,
    height: Ref<number>,
    pixelsPerBeat: Ref<number>,
    pitchesToShow: Ref<number>,
) {
    const store = usePianoRollStore();

    function drawGrid() {
        const ctx = canvasRef.value?.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width.value, height.value);
        drawHorizontalLines(ctx);
        drawVerticalLines(ctx);
        drawNotes(ctx);
    }

    function drawHorizontalLines(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i <= height.value; i += pixelsPerBeat.value) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width.value, i);
            ctx.stroke();
        }
    }

    function drawVerticalLines(ctx: CanvasRenderingContext2D) {
        const keyHeight = height.value / pitchesToShow.value;
        for (let i = 0; i <= pitchesToShow.value; i++) {
            ctx.beginPath();
            ctx.moveTo(i * keyHeight, 0);
            ctx.lineTo(i * keyHeight, height.value);
            ctx.stroke();
        }
    }

    function drawNotes(ctx: CanvasRenderingContext2D) {
        store.notes.forEach((value, key) => {
            ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
            ctx.fillRect(value[0], value[1], value[2], height.value / pitchesToShow.value);
        });
    }

    return {
        drawGrid
    };
}
