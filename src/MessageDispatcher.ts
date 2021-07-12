import { CommandInteraction } from 'discord.js';
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
        const errMsg = 'Please use this command in an allowed channel:\n'
          .concat(...command.allowedChannels.map(channel => `- <#${channel}>\n`));

        // Send error message.
        interaction.reply({ content: errMsg, ephemeral: true });
        return;
      }
    }

    await command.run(interaction);
  }
}
