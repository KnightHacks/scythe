import discord, {
  ApplicationCommandData,
  ClientOptions,
  CommandInteraction,
  Guild,
} from 'discord.js';
import { dispatch } from './dispatch';
import { loadCommands } from './loadCommands';
import { Command } from './Command';

export default class Client extends discord.Client {
  /**
   * Handles commands for the bot.
   */
  constructor(options: ClientOptions) {
    super(options);
  }

  async pushCommands(commands: ApplicationCommandData[]): Promise<void> {
    let guild: Guild | undefined = undefined;
    if (process.env.GUILD_ID) {
      guild = this.guilds.cache.get(process.env.GUILD_ID);
    }

    // Guild commands propogate instantly, but application commands do not
    // so we only want to use guild commands when in development.
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'Development environment detected..., using guild commands instead of application commands.'
      );
      // Clear app commands
      await this.application?.commands.set([]);
      await guild?.commands.set(commands);
    } else {
      // Clear guild commands
      await guild?.commands.set([]);
      await this.application?.commands.set(commands);
    }
  }

  /**
   * Registers the commands to be used by this client.
   * @param dir The directory to load commands from.
   */
  async registerCommands(dir: string): Promise<void> {
    // Load all of the commands in.
    const commands = await loadCommands(dir);

    // Get discord-compatible commands.
    const appCommands = commands.map(toAppCommand);

    if (!this.readyAt) {
      // Register commands to the discord API, once the client is ready.
      this.once('ready', () => this.pushCommands(appCommands));
    } else {
      // If we get here the client is already ready, so we'll register immediately.
      await this.pushCommands(commands);
    }

    // Enable dispatcher.
    this.on('interactionCreate', (interaction) => {
      if (interaction instanceof CommandInteraction) {
        dispatch(interaction, commands);
      }

      // FIXME figure out a button/select menu api that
      /*
      if (interaction instanceof ButtonInteraction) {
        const handler = client.buttonListeners.get(interaction.customId);

        if (!handler) {
          return;
        }

        // Run handler.
        handler(interaction);
      }
      */
    });
  }
}

/**
 * Converts a {@link Command} to an {@link ApplicationCommandData}.
 * @returns an {@link ApplicationCommandData}.
 */
function toAppCommand(command: Command): ApplicationCommandData {
  return {
    name: command.name,
    options: command.options,
    description: command.description,
  };
}
