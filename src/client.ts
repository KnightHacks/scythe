import discord, { ClientOptions } from 'discord.js';
import { CommandLoader } from './commandLoader';
import CommandManager from './commandManager';

export default class Client extends discord.Client {

  /**
   * Handles commands for the bot.
   */
  public readonly commands: CommandManager;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new CommandManager(this);
  }

  /**
   * Registers the commands to be used by this client.
   * @param dir The directory to load commands from.
   */
  public async registerCommands(dir: string): Promise<void> {
    // Load all of the commands in.
    const commands = await CommandLoader.loadCommands(dir);

    // Register all commands.
    commands.forEach((command) => this.commands.register(command));
  }
}
