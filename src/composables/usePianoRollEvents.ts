// File: src/composables/usePianoRollEvents.ts
// Description: 
import { PianoRollPlaybackManager } from '@/services/PianoRollPlaybackManager';
import { usePianoRollStore } from '@/stores/usePianoRollStore';
import { Ref } from 'vue';

export function usePianoRollEvents(canvasRef: Ref<HTMLCanvasElement>, height: Ref<number>, pianoManager: PianoRollPlaybackManager, drawGrid: () => void) {
    const store = usePianoRollStore();

    function handleMouseDown(event: MouseEvent) {
        const rect = canvasRef.value?.getBoundingClientRect();
        const x = event.clientX - (rect?.left ?? 0);
        const y = event.clientY - (rect?.top ?? 0);
        const noteLength = store.pixelsPerBeat;  // Default note length is 1 beat
        const keyHeight = height.value / store.pitchesToShow;
        const pitch = Math.floor(y / keyHeight);
        const startTime = x / store.pixelsPerBeat;

        store.addNote(Date.now(), [x, y, noteLength]);
        drawGrid();

        pianoManager.playNote(pitch);
    }

    function handleMouseMove(event: MouseEvent) {
        // todo
    }

    function handleMouseUp(event: MouseEvent) {
        // todo
    }

    return {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    };
}
