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
        // It's not gauranted that an interaction will be responded to,
        // by the permission handlers, if it isn't, provide a default 
        // error message, so the interaction is acknowledged.
        if (!interaction.replied) {
          interaction.reply({ content: 'You do not have permission to execute this command.', ephemeral: true });
        }
        return;
      }
    }

    await command.run(interaction);
  }
}
