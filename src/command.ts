import { CommandInteraction } from 'discord.js';

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
   * The function that gets executed after the command
   * is invoked.
   */
  run(interaction: CommandInteraction): Promise<void> | void;
}

/**
 * Returns whether an object of unknown type is a Command.
 * @param maybeCommand The denormalized command type to check.
 * @returns true if it's a true instance of Command, false otherwise.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isCommand(maybeCommand: any): maybeCommand is Command {
  // Iterate through required command properties
  const requiredProps = ['name', 'run'];

  let retVal = true;
  requiredProps.forEach((prop) => {
    if (!(prop in maybeCommand)) {
      retVal = false;
    }
  });

  return retVal;
}
