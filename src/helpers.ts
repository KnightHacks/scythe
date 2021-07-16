import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { PermissionHandler } from './Command';

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
      if (!await func(interaction)) {
        return false;
      }
    }

    return true;
  };
}

/**
 * A helper function to check if the given roles are present from an interaction.
 * @param roles The roles to check for.
 * @returns A permission handler function.
 */
export function hasRoles(...roles: string[]): PermissionHandler {
  return async function check(interaction: CommandInteraction): Promise<boolean> {
    let allowed = true;
    const member = interaction.member as GuildMember;
    if (!member) {
      return false;
    }

    // Iterate and check if roles are present.
    const roleIDs = roles.map(roleName => interaction.guild?.roles.cache.find(role => {
      return role.name === roleName;
    }));

    roleIDs.forEach(role => {
      allowed &&= member.roles.cache.find(curRole => curRole.id === role?.id) !== undefined;
    });
  
    if (!allowed) {
      const errMsg =
        'You must have one of the following roles to run this command:\n'.concat(
          ...roleIDs.map((role) => `- ${role}\n`)
        );
      await interaction.reply({ content: errMsg, ephemeral: true });
    }
  
    return allowed;
  };
}

/**
 * A helper function to check if the interaction was sent in the given channel(s).
 * @param roles The channels to check for.
 * @returns A permission handler function.
 */
export function checkChannels(...channelNames: string[]): PermissionHandler {
  return async (interaction: CommandInteraction): Promise<boolean> => {
    // Resolve each of the channel names
    const channels = channelNames.map(channelName => interaction.client.channels.cache.find(channel => (<TextChannel>channel).name === channelName)?.id);
    if (!channels || !interaction.channel) {
      console.log('No channels were found');
      return false;
    }
  
    const valid = channels.includes(interaction.channelId);
      
    if (!valid) {
      const errMsg =
            'Please use this command in an allowed channel:\n'.concat(
              ...channels.map((channel) => `- <#${channel}>\n`)
            );
        
      console.log('got here');    
      // Send error message.
      await interaction.reply({ content: errMsg, ephemeral: true });
    }
  
    return valid;
  };
}
