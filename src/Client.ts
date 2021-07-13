import discord, { ButtonInteraction, ClientOptions, CommandInteraction } from 'discord.js';
import MessageDispatcher from './MessageDispatcher';
import { CommandLoader } from './CommandLoader';
import CommandManager from './CommandManager';
import { ButtonHandler } from './ButtonListener';

export default class Client extends discord.Client {
  /**
   * Handles commands for the bot.
   */
  public readonly commands: CommandManager;
  private readonly commandDispatch: MessageDispatcher;
  private readonly buttonListeners: Map<string, ButtonHandler> = new Map(); 

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new CommandManager(this);
    this.commandDispatch = new MessageDispatcher(this.commands);

    // Register commands on connection
    this.once('ready', async () => {
      // Convert commands.
      const appCommands = this.commands.toAppCommands();

      // Guild commands propogate instantly, but application commands do not
      // so we only want to use guild commands when in development.
      if (process.env.NODE_ENV === 'development' && process.env.GUILD_ID) {
        console.log(
          'Development environment detected, using guild commands instead of application commands.'
        );
        const guild = this.guilds.cache.get(process.env.GUILD_ID);
        await guild?.commands.set(appCommands);
      } else {
        await this.application?.commands.set(appCommands);
      }
    });

    // Enable dispatcher.
    this.on('interactionCreate', (interaction) => {
      if (interaction instanceof CommandInteraction) {
        this.commandDispatch.dispatch(interaction);
      }

      if (interaction instanceof ButtonInteraction) {
        const handler = this.buttonListeners.get(interaction.customId);

        if (!handler) {
          return;
        }

        // Run handler.
        handler(interaction);
      }
      
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

  public addButtonListener(interactionID: string, handler: ButtonHandler): void {
    this.buttonListeners.set(interactionID, handler);
  }
}
