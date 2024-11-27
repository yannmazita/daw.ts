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
