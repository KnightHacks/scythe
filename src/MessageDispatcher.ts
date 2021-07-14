import {
  CommandInteraction, GuildMember
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

    // Check allowed roles.
    if (command.allowedRoles) {
      let allowedRole = true;
      const { member } = interaction;

      // If there's no member associated this is not a normal message.
      if (!member) {
        return;
      }

      // Iterate and check if roles are present.
      if (member instanceof GuildMember) {
        command.allowedRoles?.forEach(roleID => {
          allowedRole = member.roles.cache.find(role => role.id === roleID) !== undefined;
        });
      } else {
        command.allowedRoles?.forEach(roleID => {
          allowedRole = member.roles.includes(roleID);
        });
      }
    
      // Send error if roles could not be found on user.
      if (!allowedRole) {
        const errMsg =
      'You must have to following roles to run this command:\n'.concat(
        ...command.allowedRoles.map((role) => `- <@&${role}>\n`)
      );
        interaction.reply({ content: errMsg, ephemeral: true });
        return;
      }
    }

    await command.run(interaction);
  }
}
