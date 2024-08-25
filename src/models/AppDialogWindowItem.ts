// File: AppDialogWindowItem.ts
// Description: Defines the structure of items used in application dialog windows, encapsulating a command and optional icon.

import { Command } from "@/utils/interfaces";

/**
 * Represents an item in a dialog window, containing a label, an associated command, and optionally an icon.
 */
export class AppDialogWindowItem {
    /**
     * Initializes a new instance of the AppDialogWindowItem class.
     * @param label - The display text for the item.
     * @param command - The command to execute when this item is selected.
     * @param icon - An optional icon to display alongside the label.
     */
    constructor(public label: string, private command: Command, public icon: string | null = null) {
        this.label = label;
        this.command = command;
        this.icon = icon;
    }

    /**
     * Executes the command associated with this dialog window item.
     */
    public performAction(): void {
        this.command.execute();
    }
}
