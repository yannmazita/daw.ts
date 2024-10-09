import { Command } from "@/utils/interfaces";

export class CommandManager {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];

    constructor(private maxStackSize = 50) {
        this.maxStackSize = maxStackSize;
    }

    execute(command: Command): void {
        command.execute();
        this.undoStack.push(command);
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift(); // Remove the oldest command if we exceed the max size
        }
        this.redoStack = []; // Clear redo stack when a new command is executed
    }

    undo(): void {
        if (this.undoStack.length > 0) {
            const command = this.undoStack.pop();
            if (command) {
                command.undo();
                this.redoStack.push(command);
            }
            if (this.redoStack.length > this.maxStackSize) {
                this.redoStack.shift(); // Remove the oldest command if we exceed the max size
            }
        }
    }

    redo(): void {
        if (this.redoStack.length > 0) {
            const command = this.redoStack.pop();
            if (command) {
                command.redo();
                this.undoStack.push(command);
            }
            if (this.undoStack.length > this.maxStackSize) {
                this.undoStack.shift(); // Remove the oldest command if we exceed the max size
            }
        }
    }

    canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    setMaxStackSize(size: number): void {
        this.maxStackSize = size;
        // Trim existing stacks if they exceed the new max size
        while (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
        while (this.redoStack.length > this.maxStackSize) {
            this.redoStack.shift();
        }
    }
}
