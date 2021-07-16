import {
  CommandInteraction,
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

    if (command.permissions) {
      const check = await command.permissions(interaction);
      if (!check) {
        return;
      }
    }

    await command.run(interaction);
  }
}
