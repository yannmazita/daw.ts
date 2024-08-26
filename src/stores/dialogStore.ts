// File: dialogStore.ts
// Description: Provides state management for dialog components using Pinia.

import { defineStore } from 'pinia';
import { Component, ref, Ref } from 'vue';
import { AppDialogWindowItem } from '@/models/AppDialogWindowItem';
import { DialogInstance } from '@/utils/interfaces';

let highestZIndex = 100;

/**
 * A store for managing dialog windows within the application.
 */
export const useDialogStore = defineStore('dialog', () => {
    const dialogs: Ref<DialogInstance[]> = ref([]);
    const activeDialogId: Ref<string | null> = ref(null);

    /**
     * Opens a new dialog window with specified properties.
     * @param id Unique identifier for the dialog.
     * @param dialogTitle Title of the dialog.
     * @param dialogItems Items to be displayed within the dialog.
     * @param x The x-coordinate for the dialog position.
     * @param y The y-coordinate for the dialog position.
     * @param shouldBeCentered Boolean indicating if the dialog should be centered.
     * @param context Context or additional data associated with the dialog.
     */
    function openDialog(id: string, dialogTitle: string, dialogItems: AppDialogWindowItem[], x: number, y: number, shouldBeCentered: boolean, context: unknown): void {
        const angle = dialogs.value.length * 0.5;   // Spiral angle increment per dialog
        const distance = 20 * dialogs.value.length; // Distance from center increases
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        dialogs.value.push({
            id,
            title: dialogTitle,
            items: dialogItems,
            visible: true,
            activeComponent: null,
            xPos: shouldBeCentered ? window.innerWidth / 2 + offsetX : x,
            yPos: shouldBeCentered ? window.innerHeight / 2 + offsetY : y,
            centered: shouldBeCentered,
            context,
            zIndex: highestZIndex++,
        });
    }

    /**
     * Closes the dialog with the specified identifier.
     * @param id The unique identifier of the dialog to be closed.
     */
    function closeDialog(id: string) {
        const index = dialogs.value.findIndex(d => d.id === id);
        if (index !== -1) {
            dialogs.value.splice(index, 1);
        }
    }

    /**
     * Sets the active component for a specific dialog.
     * @param id The unique identifier of the dialog.
     * @param component The Vue component to be activated within the dialog.
     */
    function setActiveComponent(id: string, component: Component) {
        const dialog = dialogs.value.find(d => d.id === id);
        if (dialog) {
            dialog.activeComponent = component;
        }
    }

    function setActiveDialog(id: string): void {
        activeDialogId.value = id;
        const dialog = dialogs.value.find(d => d.id === id);
        if (dialog) {
            dialog.zIndex = highestZIndex++;
        }
    }

    return {
        dialogs,
        openDialog,
        closeDialog,
        setActiveComponent,
        setActiveDialog,
    };
});
