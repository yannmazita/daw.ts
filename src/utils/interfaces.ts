import { AppDialogWindowItem } from "@/models/AppDialogWindowItem";
import { Component } from "vue";

export interface Command {
    execute(): void;
    undo(): void;
    redo(): void;
}

export interface StepPosition {
    trackIndex: number | null;
    stepIndex: number | null;
}

export interface DialogInstance {
    id: string;
    items: AppDialogWindowItem[];
    visible: boolean;
    activeComponent: Component | null;
    xPos: number;
    yPos: number;
    centered: boolean;
    title: string;
    context: unknown;
}
