import discord, { ApplicationCommandData, ButtonInteraction, ClientOptions, CommandInteraction } from 'discord.js';
import MessageDispatcher from './MessageDispatcher';
import { loadCommands } from './loadCommands';
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
    const commands = await loadCommands(dir);

    // Register all commands.
    commands.forEach((command) => this.commands.register(command));

    // Get discord-compatible commands.
    const appCommands = this.commands.toAppCommands();

    if (!this.readyAt) {
      // Register commands to the discord API, once the client is ready.
      this.once('ready', () => this.pushCommands(appCommands));
    } else {
      // If we get here the client is already ready, so we'll register immediately.
      await this.pushCommands(commands);
    }
  }

  private async pushCommands(commands: ApplicationCommandData[]) {
    // Guild commands propogate instantly, but application commands do not
    // so we only want to use guild commands when in development.
    if (process.env.NODE_ENV === 'development' && process.env.GUILD_ID) {
      console.log(
        'Development environment detected..., using guild commands instead of application commands.'
      );
      const guild = this.guilds.cache.get(process.env.GUILD_ID);
      // Clear app commands
      await this.application?.commands.set([]);
      await guild?.commands.set(commands);
    } else {
      await this.application?.commands.set(commands);
    }
  }

  public addButtonListener(interactionID: string, handler: ButtonHandler): void {
    this.buttonListeners.set(interactionID, handler);
  }
}
