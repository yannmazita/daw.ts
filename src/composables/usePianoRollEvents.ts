// File: src/composables/usePianoRollEvents.ts
// Description: This composable provides event handling for the piano roll canvas.
import { PianoRollPlaybackManager } from '@/services/PianoRollPlaybackManager';
import { usePianoRollStore } from '@/stores/usePianoRollStore';
import { storeToRefs } from 'pinia';
import { Ref, computed } from 'vue';

export function usePianoRollEvents(
    canvasRef: Ref<HTMLCanvasElement>,
    playbackManager: PianoRollPlaybackManager,
    drawGrid: () => void
) {
    const store = usePianoRollStore();
    const { height } = storeToRefs(store);
    const noteHeight = computed(() => height.value / store.pitchesToShow);

    function handleMouseDown(event: MouseEvent) {
        const rect = canvasRef.value?.getBoundingClientRect();
        const x = event.clientX - (rect?.left ?? 0);
        const y = event.clientY - (rect?.top ?? 0);

        store.selectNoteByPosition(x, y);

        if (store.selectNoteByPosition(x, y)) {
            // Handle note selection or dragging logic
        } else {
            // Add a new note
            const noteLength = store.pixelsPerBeat;
            const pitch = Math.floor(y / noteHeight.value);
            const startTime = x / store.pixelsPerBeat;

            store.addNote({ x, y: pitch * noteHeight.value, length: noteLength });
            drawGrid();

            playbackManager.playNote(pitch);
        }
    }

    function handleMouseMove(event: MouseEvent) {
        // todo
    }

    function handleMouseUp(event: MouseEvent) {
        store.deselectNote();
        drawGrid();
    }

    function handleRightClick(event: MouseEvent) {
        const rect = canvasRef.value?.getBoundingClientRect();
        const x = event.clientX - (rect?.left ?? 0);
        const y = event.clientY - (rect?.top ?? 0);

        const clickedNote = store.notes.find(note =>
            x >= note.x && x <= note.x + note.length &&
            y >= note.y && y <= note.y + noteHeight.value
        );

        if (clickedNote) {
            store.removeNote(clickedNote.id);
            drawGrid();
        }
    }

    return {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleRightClick,
    };
}
