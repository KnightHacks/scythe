import { GuildMember, Snowflake, TextChannel, ThreadChannel } from 'discord.js';
import { PermissionHandler } from '../Command';
import { resolveRoleID } from './role';

const hasID = (member: GuildMember, id: Snowflake) => member.roles.cache.has(id);

/**
 * A helper function to check if the given roles are present from an interaction.
 * @param roles The roles names to check for.
 * @returns A permission handler function.
 */
export function allRoleNames(...roles: string[]): PermissionHandler {
  return async (interaction) => {
    let allowed = true;
    // FIXME is this cast safe?
    const member = interaction.member as GuildMember;
    if (!member) {
      return false;
    }

    roles.forEach(
      (roleName) =>
        (allowed &&= member.roles.cache.some((role) => role.name === roleName))
    );

    // Iterate and check if roles are present.
    if (!allowed) {
      const guild = interaction.guild;
      if (!guild) {
        console.log(new Error('Could not find guild'));
        return false;
      }
      const roleIDs = roles.map((role) => resolveRoleID(guild, role));
      const errMsg =
      'You must have the following roles to run this command:\n'.concat(
        ...roleIDs.map((role) => `- <@&${role}>\n`)
      );
      await interaction.reply({ content: errMsg, ephemeral: true });
    }

    return allowed;
  };
}

/**
 * A helper function to check if the sender has one of the given roles.
 * @param roles The roles names to check for.
 * @returns A permission handler function.
 */
export function inRoleNames(...roles: string[]): PermissionHandler {
  return async (interaction) => {
    // FIXME is this cast safe?
    const member = interaction.member as GuildMember;
    const allowed = roles.some((roleName) =>
      member.roles.cache.find((role) => role.name === roleName)
    );

    if (!allowed) {
      const guild = interaction.guild;
      if (!guild) {
        console.log(new Error('Could not find guild!'));
        return false;
      }
      const roleIDs = roles.map((role) => resolveRoleID(guild, role));
      const errMsg =
      'You must have one of the following roles to run this command:\n'.concat(
        ...roleIDs.map((role) => `- <@&${role}>\n`)
      );
      await interaction.reply({ content: errMsg, ephemeral: true });
    }

    return allowed;
  };
}

/**
 * A helper function to check if the given roles are present from an interaction.
 * @param roles The roles IDs to check for.
 * @returns A permission handler function.
 */
export function allRoles(...roleIDs: Snowflake[]): PermissionHandler {
  return async (interaction) => {
    const member = interaction.member as GuildMember;
    let allowed = true;
    if (!member) {
      return false;
    }

    roleIDs.forEach(roleID => allowed &&= hasID(member, roleID));

    if (!allowed) {
      const errMsg =
      'You must have the following roles to run this command:\n'.concat(
        ...roleIDs.map((role) => `- <@&${role}>\n`)
      );
      await interaction.reply({ content: errMsg, ephemeral: true });
    }
    
    return allowed;
  };
}

/**
 * A helper function to check if the sender has one of the given roles.
 * @param roles The roles IDs to check for.
 * @returns A permission handler function.
 */
export function inRoles(...roleIDs: Snowflake[]): PermissionHandler {
  return async (interaction) => {
    const member = interaction.member as GuildMember;
    if (!member) {
      return false;
    }

    const allowed = member.roles.cache.some(role => roleIDs.includes(role.id));

    if (!allowed) {
      const errMsg =
      'You must have one of the following roles to run this command:\n'.concat(
        ...roleIDs.map((role) => `- <@&${role}>\n`)
      );
      
      await interaction.reply({ content: errMsg, ephemeral: true });
    }

    return allowed;
  };
}

/**
 * A helper function used to aggregate permission handlers.
 * @param handlers The handlers to aggregate.
 * @returns A permission handler created from all of the inputs.
 */
export function checkAll(...handlers: PermissionHandler[]): PermissionHandler {
  return async (interaction) => {
    // Await all of the promises, and complete each of the partial applications.
    // This is a for-of because we need the functions to execute in series, rather
    // than concurrently.
    for (const func of handlers) {
      if (!(await func(interaction))) {
        return false;
      }
    }

    return true;
  };
}

/**
 * A helper function to check if the interaction was sent in the given channel(s).
 * @param channels The channels names to check for.
 * @returns A permission handler function.
 */
export function inChannelNames(...channels: string[]): PermissionHandler {
  return async (interaction) => {
    // Resolve each of the channel names
    const channelIDs = channels.map(
      (channelName) =>
        interaction.client.channels.cache.find(
          (channel) =>
            (<TextChannel | ThreadChannel>channel).name === channelName
        )?.id
    );
    if (!channelIDs || !interaction.channel) {
      console.log('No channels were found!');
      return false;
    }

    const valid = channelIDs.includes(interaction.channelId);

    if (!valid) {
      const errMsg = 'Please use this command in an allowed channel:\n'.concat(
        ...channelIDs.map((channel) => `- <#${channel}>\n`)
      );

      // Send error message.
      await interaction.reply({ content: errMsg, ephemeral: true });
    }

    return valid;
  };
}

/**
 * A helper function to check if the interaction was sent in the given channel(s).
 * @param channels The channels IDs to check for.
 * @returns A permission handler function.
 */
export function inChannels(...channelIDs: Snowflake[]): PermissionHandler {
  return async (interaction) => {

    if (!interaction.channel) {
      console.log('No channels found');
    }

    const allowed = channelIDs.includes(interaction.channelId);

    if (!allowed) {
      const errMsg = 'Please use this command in an allowed channel:\n'.concat(
        ...channelIDs.map((channel) => `- <#${channel}>\n`)
      );

      // Send error message.
      await interaction.reply({ content: errMsg, ephemeral: true });
    }

    return allowed;
  };
}

/**
 * Checks if a given interaction is created in an allowed category.
 * @param categories The categories names to check for
 * @returns A permission handler.
 */
export function inCategoryNames(...categories: string[]): PermissionHandler {
  return async (interaction) => {
    if (!(interaction.channel instanceof TextChannel)) {
      return false;
    }

    const category = interaction.channel.parent?.name;
    if (!category) {
      return false;
    }

    const allowed = categories.includes(category);

    if (!allowed) {
      const content =
      'Please use the command in the following categories:\n'.concat(
        ...categories.map((cur) => `- ${cur}\n`)
      );
      await interaction.reply({ content, ephemeral: true });
    }

    return allowed;
  };
}

/**
 * Checks if a given interaction is created in an allowed category.
 * @param categories The categories IDs to check for
 * @returns A permission handler.
 */
export function inCategories(...categoryIDs: Snowflake[]): PermissionHandler {
  return async (interaction) => {
    if (!(interaction.channel instanceof TextChannel)) {
      return false;
    }

    const category = interaction.channel.parent;

    if (!category) {
      return false;
    }

    const allowed = categoryIDs.includes(category.id);

    if (!allowed) {
      const content = 'This command is not allowed in this category';
      await interaction.reply({ content, ephemeral: true });
    }

    return allowed;
  };
}
