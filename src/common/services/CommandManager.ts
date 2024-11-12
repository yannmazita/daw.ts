// src/common/services/CommandManager.ts

import { Command } from "@/core/interfaces/command";

/**
 * Manages the execution, undo, and redo of commands.
 */
export class CommandManager {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];

    /**
     * Creates an instance of CommandManager.
     * 
     * @param [maxStackSize=50] The maximum size of the undo and redo stacks.
     */
    constructor(private maxStackSize = 50) {
        this.maxStackSize = maxStackSize;
    }

    /**
     * Executes a command and adds it to the undo stack.
     * 
     * @param command The command to execute.
     */
    execute(command: Command): void {
        command.execute();
        this.undoStack.push(command);
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift(); // Remove the oldest command if we exceed the max size
        }
        this.redoStack = []; // Clear redo stack when a new command is executed
    }

    /**
     * Undoes the last executed command and adds it to the redo stack.
     */
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

    /**
     * Redoes the last undone command and adds it back to the undo stack.
     */
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

    /**
     * Checks if there are commands to undo.
     * 
     * @returns True if there are commands to undo, false otherwise.
     */
    canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    /**
     * Checks if there are commands to redo.
     * 
     * @returns True if there are commands to redo, false otherwise.
     */
    canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    /**
     * Sets the maximum size of the undo and redo stacks.
     * 
     * @param size The new maximum stack size.
     */
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
