import { Command } from '@/utils/interfaces';
import { useDialogStore } from '@/stores/dialogStore';
import { Component } from 'vue';

export class ShowActiveComponentCommand implements Command {
    constructor(private id: string, private activeComponent: Component) { }

    execute() {
        const dialogStore = useDialogStore();
        dialogStore.setActiveComponent(this.id, this.activeComponent);
    }
    undo() { }
    redo() { }
}
