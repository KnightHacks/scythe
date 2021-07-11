import { Client } from 'discord.js';
import Command from './command';

export default class CommandManager {
  private readonly commandMap = new Map<string, Command>();

  constructor(readonly client: Client) {}

  /**
   * Registers the command for use in the bot.
   * @param command The command to register.
   */
  public register(command: Command): Map<string, Command> {
    return this.commandMap.set(command.name, command);
  }

  public lookup(name: string): Command | undefined {
    return this.commandMap.get(name);
  }

  public get all(): Command[] {
    return [...this.commandMap.values()];
  }
}
