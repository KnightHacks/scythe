import {
  CommandInteraction,
  GuildMemberRoleManager,
  RoleManager,
  Snowflake,
  Role,
  MessagePayload,
} from 'discord.js';
import CommandManager from './CommandManager';
import Dispatchable from './Dispatchable';

export default class MessageDispatcher implements Dispatchable {
  constructor(private readonly manager: CommandManager) {}

  public async dispatch(interaction: CommandInteraction): Promise<void> {
    const command = this.manager.lookup(interaction.commandName);

    // This should ideally never happen.
    if (!command) {
      interaction.reply('Error finding that command');
      return;
    }

    // Check channel permissions
    if (command.allowedChannels) {
      if (!command.allowedChannels.includes(interaction.channelId)) {
        const errMsg =
          'Please use this command in an allowed channel:\n'.concat(
            ...command.allowedChannels.map((channel) => `- <#${channel}>\n`)
          );

        // Send error message.
        interaction.reply({ content: errMsg, ephemeral: true });
        return;
      }
    }

    // Check role permissions
    const allowedRoles = command.allowedRoles;
    if (allowedRoles) {
      const userRoles = getUserRoles(interaction);
      if (userRoles === null) {
        interaction.reply({
          content: 'There was a problem checking user permissions!',
          ephemeral: true,
        });
        return;
      } else {
        const isAllowed = userRoles.reduce((acc: boolean, cur: Snowflake) => {
          return acc || allowedRoles.includes(cur);
        }, false);
        if (!isAllowed) {
          const guild = interaction.guild;
          if (guild === null) {
            interaction.reply({
              content: 'There was a problem fetching the guild!',
              ephemeral: true,
            });
            return;
          }
          const roleManager = new RoleManager(guild);
          const roles: Role[] = allowedRoles
            .map(roleManager.resolve)
            .filter(isNonNull);
          const errorMessage =
            `Sorry, you don't have permission to run \`/${command.name}\` ` +
            `Allowed roles include: ${allowedRoles}`;
          const reply = new MessagePayload(interaction, {
            content: errorMessage,
            allowedMentions: {
              users: [],
            },
          });
          interaction.reply({
            content: errorMessage,
            ephemeral: true,
          });
          return;
        }
      }
    }

    await command.run(interaction);
  }
}

function getUserRoles(interaction: CommandInteraction): Snowflake[] | null {
  const roleManagerOrSnowFlakes = interaction.member?.roles;
  if (roleManagerOrSnowFlakes === undefined) {
    return null;
  } else if (roleManagerOrSnowFlakes instanceof GuildMemberRoleManager) {
    const userRoles: Snowflake[] = [...roleManagerOrSnowFlakes.cache.keys()];
    return userRoles;
  } else {
    return roleManagerOrSnowFlakes;
  }
}

function isNonNull<T>(thing: T | null): thing is T {
  return thing !== null;
}
