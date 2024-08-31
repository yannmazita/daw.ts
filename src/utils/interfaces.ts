// File: interfaces.ts
// Description: This file contains interfaces that define common structures used throughout the application.

import { AppDialogWindowItem } from "@/models/AppDialogWindowItem";
import { Component } from "vue";

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

/**
 * Describes the state and properties of a dialog instance within the application,
 * facilitating dynamic and contextual dialog management.
 */
export interface DialogInstance {
    /** A unique identifier for the dialog instance. */
    id: string;

    /** A list of items to be displayed or interacted with within the dialog. */
    items: AppDialogWindowItem[];

    /** Indicates whether the dialog is currently visible to the user. */
    visible: boolean;

    /** The Vue component that is currently active or displayed in the dialog. */
    activeComponent: Component | null;

    /** The horizontal position of the dialog on the screen. */
    xPos: number;

    /** The vertical position of the dialog on the screen. */
    yPos: number;

    /** Whether the dialog should be centered on the screen. */
    centered: boolean;

    /** The title of the dialog, typically displayed in a title bar. */
    title: string;

    /** Additional context or data associated with the dialog, which can vary based on its use. */
    context: unknown;

    /** The z-index of the dialog, used to determine its stacking order relative to other elements. */
    zIndex: number;
}

export interface Window {
    id: string;
    isVisible: boolean;
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
}
