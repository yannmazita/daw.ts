// src/core/interfaces/contextMenu.ts

import { Command } from "@/core/interfaces/command";

/**
 * Interface representing a menu item.
 */
export interface MenuItem {
  id: string;
  label: string;
  icon: string | null;
  actionType: string;
  payload?: any;
}

/**
 * Interface representing a serializable menu item, which includes a command type.
 */
export interface SerializableMenuItem extends MenuItem {
  commandType: string; // This will be used to recreate the Command object
}

/**
 * Interface representing a menu item with an associated command.
 */
export interface MenuItemWithCommand extends MenuItem {
  command: Command;
}

/**
 * Converts a MenuItemWithCommand to a SerializableMenuItem.
 * 
 * @param item The menu item with a command to serialize.
 * @returns The serialized menu item.
 */
export function createSerializableMenuItem(item: MenuItemWithCommand): SerializableMenuItem {
  return {
    ...item,
    commandType: item.command.constructor.name, // Assuming each Command class has a unique name
  };
}

/**
 * Converts a SerializableMenuItem back to a MenuItemWithCommand using a command factory.
 * 
 * @param item The serializable menu item to convert.
 * @param commandFactory The factory function to create commands.
 * @returns The menu item with an associated command.
 */
export function createMenuItemWithCommand(
  item: SerializableMenuItem,
  commandFactory: (type: string, payload: any) => Command
): MenuItemWithCommand {
  const { commandType, ...rest } = item;
  return {
    ...rest,
    command: commandFactory(commandType, item.payload),
  };
}

export interface ContextMenuState {
  appLevelItems: Record<string, SerializableMenuItem>;
  contextualItems: Record<string, SerializableMenuItem[]>;
  visible: boolean;
  xPos: number;
  yPos: number;
  setAppLevelItems: (items: Record<string, SerializableMenuItem>) => void;
  addContextualItems: (groupId: string, items: SerializableMenuItem[]) => void;
  clearContextualItems: () => void;
  openContextMenu: (x: number, y: number) => void;
  closeContextMenu: () => void;
}
