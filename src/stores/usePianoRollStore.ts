// File: usePianoRollStore.ts
// Description: Provides a store for managing the state of the piano roll in the application.
import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export const usePianoRollStore = defineStore('pianoRoll', () => {
    const notes = reactive(new Map<number, [number, number, number]>); // The key is timestamp, value is [x, y, noteLength]
    const pixelsPerBeat = ref(100);
    const pitchesToShow = ref(88);

    function addNote(key: number, noteData: [number, number, number]): void {
        notes.set(key, noteData);
    }

    function removeNote(key: number): void {
        notes.delete(key);
    }

    function clearNotes(): void {
        notes.clear();
    }

    return {
        notes,
        addNote,
        removeNote,
        clearNotes,
        pixelsPerBeat,
        pitchesToShow,
    };
});
