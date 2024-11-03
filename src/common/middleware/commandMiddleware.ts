// src/common/middleware/commandMiddleware.ts

import { Middleware, UnknownAction } from 'redux';
import { commandManager } from '../services/commandManagerInstance';
import { Command } from '@/core/interfaces/command';
import { SerializableMenuItem, createMenuItemWithCommand } from '@/core/interfaces/contextMenu';

/**
 * Factory function to create Command objects based on the commandType.
 * 
 * @param commandType The type of the command to create.
 * @param payload The payload to pass to the command.
 * @returns The created Command object.
 * @throws Throws an error if the commandType is unknown.
 */
const createCommand = (commandType: string, payload: unknown): Command => {
  switch (commandType) {
    case 'OpenSettingsCommand':
      return {
        execute: () => console.log('Opening settings', payload),
        undo: () => console.log('Closing settings'),
        redo: () => console.log('Reopening settings', payload),
      };
    case 'OpenHelpCommand':
      return {
        execute: () => console.log('Opening help', payload),
        undo: () => console.log('Closing help'),
        redo: () => console.log('Reopening help', payload),
      };
    default:
      throw new Error(`Unknown command type: ${commandType}`);
  }
};

interface ExecuteContextMenuItemAction extends UnknownAction {
  type: 'EXECUTE_CONTEXT_MENU_ITEM';
  payload: SerializableMenuItem;
}

interface UndoRedoAction extends UnknownAction {
  type: 'UNDO_COMMAND' | 'REDO_COMMAND';
}

/**
 * Redux middleware to handle command execution, undo, and redo actions.
 * 
 * @returns The middleware function.
 */
export const commandMiddleware: Middleware = () => (next) => (action: unknown) => {
  if (isExecuteContextMenuItemAction(action)) {
    const itemWithCommand = createMenuItemWithCommand(action.payload, createCommand);
    commandManager.execute(itemWithCommand.command);
  } else if (isUndoRedoAction(action)) {
    if (action.type === 'UNDO_COMMAND') {
      commandManager.undo();
    } else {
      commandManager.redo();
    }
  }

  return next(action);
};

/**
 * Type guard to check if an action is ExecuteContextMenuItemAction.
 * 
 * @param action The action to check.
 * @returns True if the action is ExecuteContextMenuItemAction, false otherwise.
 */
function isExecuteContextMenuItemAction(action: UnknownAction): action is ExecuteContextMenuItemAction {
  return action.type === 'EXECUTE_CONTEXT_MENU_ITEM' && 'payload' in action;
}

/**
 * Type guard to check if an action is UndoRedoAction.
 * 
 * @param action The action to check.
 * @returns True if the action is UndoRedoAction, false otherwise.
 */
function isUndoRedoAction(action: UnknownAction): action is UndoRedoAction {
  return action.type === 'UNDO_COMMAND' || action.type === 'REDO_COMMAND';
}
