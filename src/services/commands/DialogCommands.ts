// File: DialogCommands.ts
// Description: Contains commands related to dialog interaction within the application.

import { Command } from '@/utils/interfaces';
import { useDialogStore } from '@/stores/dialogStore';
import { Component } from 'vue';

/**
 * Command to display an active component within a dialog.
 */
export class ShowActiveComponentCommand implements Command {
    /**
     * Creates an instance of ShowActiveComponentCommand.
     * @param id The unique identifier for the dialog.
     * @param activeComponent The Vue component to be activated within the dialog.
     */
    constructor(private id: string, private activeComponent: Component) { }

    /**
     * Executes the command to set the active component in the specified dialog.
     */
    execute(): void {
        const dialogStore = useDialogStore();
        dialogStore.setActiveComponent(this.id, this.activeComponent);
    }

    /**
     * Placeholder for undo functionality.
     */
    undo(): void { /* Undo logic if required */ }

    /**
     * Placeholder for redo functionality.
     */
    redo(): void { /* Redo logic if required */ }
}
