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
    const { height, selectedNote, notes } = storeToRefs(store);
    const noteHeight = computed(() => height.value / store.pitchesToShow);

    function handleNoteDrag(event: MouseEvent) {
        if (!selectedNote.value) return; // No note selected

        const prevX = event.clientX - event.movementX; // Previous mouse X position
        const prevY = event.clientY - event.movementY; // Previous mouse Y position
        const deltaX = event.clientX - prevX;
        const deltaY = event.clientY - prevY;

        const note = notes.value.find(note => note.id === selectedNote.value?.id);
        if (note) {
            const newX = note.x + deltaX;
            const newY = note.y + deltaY;
            store.updateNote(selectedNote.value.id, {
                x: newX,
                y: newY,
            });

            drawGrid();
        }

        drawGrid();
    }

    /*
    function handleNoteResize(event: MouseEvent) {
        if (!store.isResizingNote.value) return; // No note being resized

        const corner = store.selectedNoteResizeCorner.value; // Get clicked corner
    }
    */

    function handleMouseDown(event: MouseEvent) {
        const rect = canvasRef.value?.getBoundingClientRect();
        const x = event.clientX - (rect?.left ?? 0);
        const y = event.clientY - (rect?.top ?? 0);

        const clickedNote: boolean = store.selectNoteByPosition(x, y);

        if (clickedNote) {
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
        if (selectedNote.value) {
            handleNoteDrag(event);
        }
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
