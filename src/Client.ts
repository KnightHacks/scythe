import discord, {
  ApplicationCommand,
  ApplicationCommandData,
  ApplicationCommandPermissionData,
  ClientOptions,
  Collection,
  Guild,
  GuildApplicationCommandPermissionData,
  Snowflake,
} from 'discord.js';
import { isEqual } from 'lodash';
import { Command, isCommand } from './Command';
import { loadStructures } from './loaders';
import { EventHandler } from './EventHandler';
import { toData } from './utils/command';

export default class Client extends discord.Client {
  private commands = new Collection<string, Command>();
  public onError?: (command: Command, error: Error) => void;
  eventHandler: EventHandler = new EventHandler(this);

  /**
   * Handles commands for the bot.
   */
  constructor(options: ClientOptions) {
    super(options);
  }

  async syncCommands(commands: Command[]): Promise<void> {
    if (!this.isReady()) {
      throw new Error('This must be used after the client is ready.');
    }

    if (!process.env.GUILD_ID) {
      throw new Error('Please set the GUILD_ID in your .env file.');
    }

    // Fetch the commands from the server.
    const rawCommands =
      process.env.NODE_ENV === 'development'
        ? await this.guilds.cache.get(process.env.GUILD_ID)?.commands.fetch()
        : await this.application.commands.fetch();

    if (!rawCommands) {
      throw new Error('Could not fetch remote commands!');
    }

    // Normalize all of the commands.

    const appCommands = new Collection<string, ApplicationCommandData>();
    rawCommands.map(toData).forEach((data) => appCommands.set(data.name, data));

    const clientCommands = new Collection<string, ApplicationCommandData>();
    commands.map(toData).forEach((data) => clientCommands.set(data.name, data));

    // Helper for whenever there's a diff.
    const push = async () => {
      console.log('Local commands differ from remote commands, syncing now...');
      await this.pushCommands(commands);
      console.log('Finished syncing');
    };

    // If the length is not the same it's obvious that the commands aren't the same.
    if (appCommands.size !== clientCommands.size) {
      console.log({
        appCommands: appCommands.size,
        commands: clientCommands.size,
      });
      await push();
      return;
    }

    // Calculate if theres a diff between the local and remote commands.
    const diff = !appCommands.every((appCommand) => {
      // Get the name, and get the corresponding command with the same name.
      const clientCommand = clientCommands.get(appCommand.name);

      // Check if the commands are equal.
      return isEqual(clientCommand, appCommand);
    });

    // There's no diff then the commands are in sync.
    if (!diff) {
      console.log('Commands are already in sync, nothing to push...');
      return;
    }

    await push();
  }

  async pushCommands(appCommands: ApplicationCommandData[]): Promise<void> {
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

      pushedCommands = await guild.commands
        .set(appCommands)
        .then((x) => [...x.values()]);
    } else {
      pushedCommands = await this.application?.commands
        .set(appCommands)
        .then((x) => [...x.values()]);
    }

    if (!pushedCommands) {
      return;
    }

    const fullPermissions: GuildApplicationCommandPermissionData[] =
      generatePermissionData(pushedCommands, [...this.commands.values()]);

    // Apply Permissions (per-guild-only)
    await guild.commands.permissions.set({ fullPermissions });
  }

  /**
   * Registers the commands to be used by this client.
   * @param dir The directory to load commands from.
   * @param recursive Whether or not to look for commands recursively.
   */
  async registerCommands(dir: string, recursive = true): Promise<void> {
    // Load all of the commands in.
    const commands = await loadStructures(dir, isCommand, recursive);

    commands.forEach((command) => {
      this.commands.set(command.name, command);
    });

    if (!this.isReady()) {
      // Register commands to the discord API, once the client is ready.
      this.once('ready', async () => {
        await this.syncCommands(commands);
      });
    } else {
      // If we get here the client is already ready, so we'll register immediately.
      await this.syncCommands(commands);
    }
    this.eventHandler.commands = commands;
  }

  registerMessageFilters = this.eventHandler.registerMessageFilters;
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
