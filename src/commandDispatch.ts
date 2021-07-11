import { CommandInteraction } from 'discord.js';
import CommandManager from './commandManager';
import Dispatchable from './dispatcher';

export default class MessageDispatcher implements Dispatchable {

  constructor(private readonly manager: CommandManager) {}
      
  public async dispatch(interaction: CommandInteraction): Promise<void> {
    const command = this.manager.lookup(interaction.commandName);
    await command?.run(interaction);
  }
} 
