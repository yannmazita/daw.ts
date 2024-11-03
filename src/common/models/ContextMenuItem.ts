// src/common/models/ContextMenuItem.ts

import { Command } from "@/core/interfaces/command";

/**
 * Represents an item in a context menu, containing a label, an associated command, and optionally an icon.
 */
export class ContextMenuItem {
  /**
   * Initializes a new instance of the AppContextMenuItem class.
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
   * Executes the command associated with this context menu item.
   */
  public performAction(): void {
    this.command.execute();
  }
}
