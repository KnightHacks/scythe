import { GuildMember, Interaction, Snowflake } from 'discord.js';

// We need to get the type in this manner because discord.js doesn't export APIInteractionGuildMember.
type GuildMemberType = Interaction['member'];

/**
 * Checks if the given guild member has roles.
 * @param roles The roles IDs to check for.
 * @param member The member to check against
 * @returns true if the roles are present, false otherwise.
 */
export function hasRoles(roles: Snowflake[], member: GuildMemberType): boolean {
  let allowed = true;
  if (!member) {
    return false;
  }

  // Iterate and check if roles are present.
  if (member instanceof GuildMember) {
    allowed = !roles.some(roleID => member.roles.cache.find(role => role.id === roleID) === undefined);
  } else {
    roles.forEach(roleID => {
      allowed &&= member.roles.includes(roleID);
    });
  }

  return allowed;
}

/**
 * Checks if the given interaction is used within the given channels.
 * @param channels The channel IDs to check for.
 * @param interaction The interaction to check against.
 * @returns true if the interaction was in one of the given channels, false otherwise.
 */
export function isInChannels(channels: Snowflake[], interaction: Interaction): boolean {
  if (!interaction.channelId) {
    return false;
  }

  return channels.includes(interaction.channelId);
}
