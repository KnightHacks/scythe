import {
  ApplicationCommandOptionData,
  CommandInteraction,
  Snowflake,
} from 'discord.js';
import { ButtonListener } from './ButtonListener';

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
  options?: ApplicationCommandOptionData[];

  /**
   * The function that gets executed after the command
   * is invoked.
   */
  run(interaction: CommandInteraction): Promise<void> | void;

  /**
   * The channel IDs that this command is allowed in.
   * If a value is not provided, this command is allowed to be
   * used in any channel.
   */
  allowedChannels?: Snowflake[];

  /**
   * An array of role IDs that are allowed to use this {@link Command}. If a
   * value is not provided, any role will be allowed to use the command.
   */
  allowedRoles?: Snowflake[];
  buttonListener?: ButtonListener;
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
