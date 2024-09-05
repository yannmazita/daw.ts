// File: interfaces.ts
// Description: This file contains interfaces that define common structures used throughout the application.

/**
 * Defines the methods necessary for implementing command actions within the application,
 * supporting the execution, undo, and redo functionalities as part of the Command pattern.
 */
export interface Command {
    /** Executes the command's main action. */
    execute(): void;

    /** Reverts the action previously executed by the command. */
    undo(): void;

    /** Re-executes the action previously undone. */
    redo(): void;
}

/**
 * Represents a specific position within a sequencer, which could correspond to a particular
 * track and step in a musical sequence.
 */
export interface StepPosition {
    /** The index of the track within the sequencer, or null if not applicable. */
    trackIndex: number | null;

    /** The index of the step within the track, or null if not applicable. */
    stepIndex: number | null;
}

export interface Window {
    id: string;
    isMinimized: boolean;
    isMaximized: boolean;
    windowComponent: unknown;
    windowComponentKey: string;    // To force re-rendering if needed
    xPos: number;
    yPos: number;
    minimumWidth: number;
    maximumWidth: number;
    minimumHeight: number;
    maximumHeight: number;
    initialWidth: number;
    initialHeight: number;
    restoreSize: { width: number, height: number, xPos: number, yPos: number };
    windowProps: object;
    dragging: boolean;
    resizing: boolean;
    resizeDirection: string;
    lastMouseX: number;
    lastMouseY: number;
    width: number;
    height: number;
    zIndex: number;
}

export interface WindowDualPaneContent {
    label: string;
    component: unknown;
}

