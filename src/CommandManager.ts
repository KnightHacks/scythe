import { ApplicationCommandData } from 'discord.js';
import Client from './Client';
import Command from './Command';

export default class CommandManager {
  private readonly commandMap = new Map<string, Command>();

  constructor(readonly client: Client) {}

  /**
   * Registers the command for use in the bot.
   * @param command The command to register.
   */
  public register(command: Command): Map<string, Command> {
    // Add in button listeners.
    command.buttonListener.listeners
      .forEach((handler, id) => this.client.addButtonListener(id, handler));
    return this.commandMap.set(command.name, command);
  }

  /**
   * Looks up the command given the command name.
   * @param name The name of the command to lookup
   * @returns The command if found, undefined otherwise.
   */
  public lookup(name: string): Command | undefined {
    return this.commandMap.get(name);
  }

  /**
   * Converts the registered commands to an array of {@link ApplicationCommandData}.
   * @returns An array of commands normalized to {@link ApplicationCommandData}.
   */
  public toAppCommands(): ApplicationCommandData[] {
    return [...this.commandMap.values()].map((command) => ({
      name: command.name,
      options: command.options,
      description: command.description,
    }));
  }

  public get all(): Command[] {
    return [...this.commandMap.values()];
  }
}
