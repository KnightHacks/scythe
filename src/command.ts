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