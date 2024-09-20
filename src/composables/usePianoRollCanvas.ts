// File: src/composables/usePianoRollCanvas.ts
import { usePianoRollStore } from '@/stores/usePianoRollStore';
import { storeToRefs } from 'pinia';
import { Ref, computed } from 'vue';

export function usePianoRollCanvas(
    canvasRef: Ref<HTMLCanvasElement>,
) {
    const pianoRollStore = usePianoRollStore();
    const { width, height, pixelsPerBeat, pitchesToShow } = storeToRefs(pianoRollStore);
    const noteHeight = computed(() => height.value / pitchesToShow.value);

    function drawGrid() {
        const ctx = canvasRef.value.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width.value, height.value);
        drawHorizontalLines(ctx);
        drawVerticalLines(ctx);
        drawNotes();
    }

    function drawHorizontalLines(ctx: CanvasRenderingContext2D) {
        for (let yPos = 0; yPos <= height.value; yPos += noteHeight.value) {
            ctx.beginPath();
            ctx.moveTo(0, yPos);
            ctx.lineTo(width.value, yPos);
            ctx.strokeStyle = yPos % (noteHeight.value * 12) === 0 ? '#888' : '#ddd';
            ctx.stroke();
        }
    }

    function drawVerticalLines(ctx: CanvasRenderingContext2D) {
        for (let xPos = 0; xPos <= width.value; xPos += pixelsPerBeat.value) {
            ctx.beginPath();
            ctx.moveTo(xPos, 0);
            ctx.lineTo(xPos, height.value);
            ctx.strokeStyle = xPos % (pixelsPerBeat.value * 4) === 0 ? '#888' : '#ddd';
            ctx.stroke();
        }
    }

    function drawNotes() {
        const ctx = canvasRef.value.getContext('2d');
        if (!ctx) return;

        pianoRollStore.notes.forEach((note) => {
            ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
            ctx.fillRect(note.x, note.y, note.length, noteHeight.value);
        });
    }

    return {
        drawGrid,
        drawNotes,
    };
}
