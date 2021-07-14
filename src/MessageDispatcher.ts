import {
  CommandInteraction,
} from 'discord.js';
import CommandManager from './CommandManager';
import Dispatchable from './Dispatchable';
import { hasRoles, isInChannels } from './util';

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
      if (!isInChannels(command.allowedChannels, interaction)) {
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
      if (!hasRoles(command.allowedRoles, interaction.member)) {
        const errMsg =
      'You must have one of the following roles to run this command:\n'.concat(
        ...command.allowedRoles.map((role) => `- <@&${role}>\n`)
      );
        interaction.reply({ content: errMsg, ephemeral: true });
        return;
      }
    }

    await command.run(interaction);
  }
}
