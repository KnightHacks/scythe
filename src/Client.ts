import discord, {
  ApplicationCommand,
  ApplicationCommandData,
  ApplicationCommandPermissionData,
  ButtonInteraction,
  ClientOptions,
  CommandInteraction,
  Guild,
  GuildApplicationCommandPermissionData,
  MessageActionRow,
  Snowflake,
} from 'discord.js';
import { dispatch } from './dispatch';
import { loadCommands } from './loadCommands';
import { Command } from './Command';
import { ButtonHandler } from './ButtonHandler';
import { toComponents, UIComponent } from './UI';

export default class Client extends discord.Client {
  /**
   * A map from button IDs to handler functions. This is used to implement
   * button click handlers.
   */
  buttonListeners: Map<string, ButtonHandler> = new Map();

  /**
   * Handles commands for the bot.
   */
  constructor(options: ClientOptions) {
    super(options);
  }

  async pushCommands(
    commands: Command[],
    appCommands: ApplicationCommandData[]
  ): Promise<void> {
    let guild: Guild | undefined = undefined;
    if (process.env.GUILD_ID) {
      guild = this.guilds.cache.get(process.env.GUILD_ID);
    } else {
      throw new Error('No GUILD_ID found!');
    }

    if (!guild) {
      throw new Error('Guild is not initialized, check your GUILD_ID.');
    }

    let pushedCommands: ApplicationCommand[] | undefined;

    // Guild commands propogate instantly, but application commands do not
    // so we only want to use guild commands when in development.
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'Development environment detected..., using guild commands instead of application commands.'
      );

      await this.clearAllCommands(guild);
      pushedCommands = await guild.commands
        .set(appCommands)
        .then((x) => [...x.values()]);
    } else {
      await this.clearAllCommands(guild);
      pushedCommands = await this.application?.commands
        .set(appCommands)
        .then((x) => [...x.values()]);
    }

    if (!pushedCommands) {
      throw new Error('Could not push commands to server!');
    }

    const fullPermissions: GuildApplicationCommandPermissionData[] =
      generatePermissionData(pushedCommands, commands);

    // Apply Permissions (per-guild-only)
    await guild.commands.permissions.set({ fullPermissions });
  }

  private async clearAllCommands(guild: Guild) {
    await guild.commands.set([]);
    await this.application?.commands.set([]);
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
      this.once('ready', () => this.pushCommands(commands, appCommands));
    } else {
      // If we get here the client is already ready, so we'll register immediately.
      await this.pushCommands(commands, appCommands);
    }

    // Enable dispatcher.
    this.on('interactionCreate', (interaction) => {
      if (interaction instanceof CommandInteraction) {
        dispatch(interaction, commands, this);
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
   * Generates a discord.js `MessageActionRow[]` that can be used in a
   * message reply as the `components` argument. Allows use of `onClick` and
   * `onSelect` by autogenerating and registering IDs.
   *
   * @param ui Either a single `UIComponent` or a 1D or 2D array of `UIComponent`s
   * @returns a generated `MessageActionRow[]`
   */
  registerUI = (
    ui: UIComponent | UIComponent[] | UIComponent[][]
  ): MessageActionRow[] => {
    return toComponents(ui, this.buttonListeners);
  };
}

/**
 * Converts a {@link Command} to an {@link ApplicationCommandData}.
 * @returns an {@link ApplicationCommandData}.
 */
function toAppCommand(command: Command): ApplicationCommandData {
  const defaultPermission: boolean =
    (command.allowedRoles ?? command.allowedUsers) === undefined;

  return {
    name: command.name,
    options: command.options,
    description: command.description,
    defaultPermission,
  };
}

function generatePermissionData(
  pushedCommands: ApplicationCommand[],
  commands: Command[]
): GuildApplicationCommandPermissionData[] {
  return pushedCommands.map((appCommand) => {
    const command: Command | undefined = commands.find(
      (c) => c.name === appCommand.name
    );
    const permissions = generateAllPermissions(
      command?.allowedRoles ?? [],
      command?.allowedUsers ?? []
    );
    return {
      id: appCommand.id,
      permissions,
    };
  });
}

function generateAllPermissions(
  allowedRoles: Snowflake[],
  allowedUsers: Snowflake[]
): ApplicationCommandPermissionData[] {
  const rolePermissions = generateRolePermissions(allowedRoles);
  const userPermissions = generateUserPermissions(allowedUsers);
  return rolePermissions.concat(userPermissions);
}

function generateRolePermissions(
  allowedRoles: Snowflake[]
): ApplicationCommandPermissionData[] {
  return allowedRoles.map(
    (role): ApplicationCommandPermissionData => ({
      type: 'ROLE',
      id: role,
      permission: true,
    })
  );
}

function generateUserPermissions(
  allowedUsers: Snowflake[]
): ApplicationCommandPermissionData[] {
  return allowedUsers.map(
    (user): ApplicationCommandPermissionData => ({
      type: 'USER',
      id: user,
      permission: true,
    })
  );
}
