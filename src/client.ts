import discord, { ClientOptions, CommandInteraction } from 'discord.js';
import MessageDispatcher from './commandDispatch';
import { CommandLoader } from './commandLoader';
import CommandManager from './commandManager';
import { normalizeCommand } from './util';

export default class Client extends discord.Client {

  /**
   * Handles commands for the bot.
   */
  public readonly commands: CommandManager;
  private readonly commandDispatch: MessageDispatcher;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new CommandManager(this);
    this.commandDispatch = new MessageDispatcher(this.commands);

    // Register commands on connection
    this.once('ready', async () => {
      if (process.env.GUILD_ID) {
        const guild = this.guilds.cache.get(process.env.GUILD_ID);
        const jsonCommands = this.commands.all.map(normalizeCommand);

        await guild?.commands.set(jsonCommands);
      }
    });

    // Enable dispatcher.
    this.on('interactionCreate', (interaction) => {
      if (!(interaction instanceof CommandInteraction)) {
        return;
      }

      this.commandDispatch.dispatch(interaction);
    });
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
