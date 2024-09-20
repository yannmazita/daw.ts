// File: usePianoRollStore.ts
// Description: Provides a store for managing the state of the piano roll in the application.
import { v4 as uuidv4 } from 'uuid';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { PianoRollNote } from '@/utils/interfaces';

export const usePianoRollStore = defineStore('pianoRoll', () => {
    const isPlaying = ref(false);
    const notes = ref<PianoRollNote[]>([]);
    const pixelsPerBeat = ref(100);
    const pitchesToShow = ref(88);
    const playbackPosition = ref(0);
    const width = ref(800);
    const height = ref(600);
    const selectedNoteId = ref<string | null>(null);

    const totalBeats = computed(() => {
        if (notes.value.length === 0) return 0;
        return Math.ceil(Math.max(...notes.value.map(note => (note.x + note.length) / pixelsPerBeat.value)));
    });

    function addNote(initState?: Partial<PianoRollNote>) {
        const id = uuidv4();
        const newNote: PianoRollNote = {
            id,
            x: 0,
            y: 0,
            length: pixelsPerBeat.value,
            ...initState,
        };
        notes.value.push(newNote);
    }

    function removeNote(id: string) {
        notes.value = notes.value.filter(n => n.id !== id);
        if (selectedNoteId.value === id) {
            selectedNoteId.value = null;
        }
    }

    function updateNote(id: string, updates: Partial<PianoRollNote>) {
        const noteIndex = notes.value.findIndex(n => n.id === id);
        if (noteIndex !== -1) {
            notes.value[noteIndex] = { ...notes.value[noteIndex], ...updates };
        }
    }

    function clearNotes() {
        notes.value = [];
        selectedNoteId.value = null;
    }

    function setPlaybackPosition(position: number) {
        playbackPosition.value = position;
    }

    function selectNoteByPosition(x: number, y: number): boolean {
        const clickedNote = notes.value.find(note =>
            x >= note.x && x <= note.x + note.length &&
            y >= note.y && y <= note.y + height.value / pitchesToShow.value
        );
        if (clickedNote) {
            selectedNoteId.value = clickedNote.id;
            return true;
        }
        return false;
    }

    function deselectNote() {
        selectedNoteId.value = null;
    }

    return {
        isPlaying,
        notes,
        addNote,
        removeNote,
        clearNotes,
        pixelsPerBeat,
        pitchesToShow,
        playbackPosition,
        setPlaybackPosition,
        updateNote,
        width,
        height,
        totalBeats,
        selectedNoteId,
        selectNoteByPosition,
        deselectNote,
    };
});
