import { Ref } from 'vue';

export function useGridDraw(ctx: Ref<CanvasRenderingContext2D | null>, width: Ref<number>, height: Ref<number>, pixelsPerBeat: Ref<number>, pitchesToShow: Ref<number>) {
    const drawGrid = () => {
        if (!ctx.value) return;

        ctx.value.clearRect(0, 0, width.value, height.value);
        drawHorizontalLines(ctx.value);
        drawVerticalLines(ctx.value);
    };

    const drawHorizontalLines = (ctx: CanvasRenderingContext2D) => {
        for (let i = 0; i <= height.value; i += pixelsPerBeat.value) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width.value, i);
            ctx.stroke();
        }
    };

    const drawVerticalLines = (ctx: CanvasRenderingContext2D) => {
        const keyHeight = height.value / pitchesToShow.value;
        for (let i = 0; i <= pitchesToShow.value; i++) {
            ctx.beginPath();
            ctx.moveTo(i * keyHeight, 0);
            ctx.lineTo(i * keyHeight, height.value);
            ctx.stroke();
        }
    };

    return { drawGrid };
}
