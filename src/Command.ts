import {
  ApplicationCommandOptionData,
  CommandInteraction,
} from 'discord.js';
import { ButtonListener } from './ButtonListener';

export type PermissionHandler = (interaction: CommandInteraction) => boolean | Promise<boolean>;

/**
 * Represents a the blueprint for a slash commands.
 */
export default interface Command {
  /**
   * The name of the command.
   */
  get name(): string;

  /**
   * The description of the command.
   */
  get description(): string;

  /**
   * The options available for this command.
   */
  readonly options?: ApplicationCommandOptionData[];

  /**
   * The function that gets executed after the command
   * is invoked.
   */
  run(interaction: CommandInteraction): Promise<void> | void;
  readonly buttonListener?: ButtonListener;

  /**
   * The {@link PermissionHandler} that handles the permissions for this command.
   */
  readonly permissions?: PermissionHandler;
}

/**
 * Returns whether an object of unknown type is a Command.
 * @param maybeCommand The denormalized command type to check.
 * @returns true if it's a true instance of Command, false otherwise.
 */
export function isCommand(maybeCommand: unknown): maybeCommand is Command {
  // if we're not an object, property accesses will throw
  if (typeof maybeCommand !== 'object') {
    return false;
  }

  // Iterate through required command properties
  const requiredProps = ['name', 'run'];

  let retVal = true;
  requiredProps.forEach((prop) => {
    if (!(prop in (maybeCommand as Command))) {
      retVal = false;
    }
  });

  return retVal;
}
