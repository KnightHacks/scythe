import discord, {
  ApplicationCommand,
  ApplicationCommandData,
  ApplicationCommandPermissionData,
  ClientOptions,
  Collection,
  CommandInteraction,
  Guild,
  GuildApplicationCommandPermissionData,
  Snowflake,
} from 'discord.js';
import { dispatch } from './dispatch';
import { loadCommands } from './loadCommands';
import { Command } from './Command';
import { commandEquals, toData } from './utils/command';


export default class Client extends discord.Client {

  private commands = new Collection<string, Command>();

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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const rawCommands = process.env.NODE_ENV === 'development' ?  await this.guilds.cache.get(process.env.GUILD_ID!)?.commands.fetch() : await this.application.commands.fetch();

    if (!rawCommands) {
      throw new Error('Could not fetch remote commands!');
    }

    const appCommands = rawCommands.map(toData);
    const clientCommands = commands.map(toData);

    const push = async () => {
      console.log('Local commands differ from remote commands, syncing now...');
      await this.pushCommands(commands);
      console.log('Finished syncing');
    };

    // If the length is not the same it's obvious that the commands aren't the same.
    if (appCommands.length !== commands.length) {
      await push();
      return;
    }
    const diff = appCommands.every((appCommand, i) => commandEquals(clientCommands[i], appCommand));

    if (diff) {
      console.log('Commands are already in sync, nothing to push...');
      return;
    }

    await push();
  }

  async pushCommands(
    appCommands: ApplicationCommandData[],
  ): Promise<void> {
    let guild: Guild | undefined = undefined;
    if (process.env.GUILD_ID) {
      guild = this.guilds.cache.get(process.env.GUILD_ID);
    } else {
      throw new Error('No GUILD_ID found!');
    }

    if (!guild) {
      throw new Error(
        'Guild is not initialized, check your GUILD_ID.'
      );
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
      generatePermissionData(pushedCommands, this.commands.array());

    // Apply Permissions (per-guild-only)
    await guild.commands.permissions.set({ fullPermissions });
  }

  /**
   * Registers the commands to be used by this client.
   * @param dir The directory to load commands from.
   */
  async registerCommands(dir: string): Promise<void> {
    // Load all of the commands in.
    const commands = await loadCommands(dir);

    commands.forEach(command => {
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
