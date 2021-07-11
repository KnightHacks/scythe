import { CommandInteraction, Interaction } from 'discord.js';
import CommandManager from './commandManager';

export default interface Dispatchable {
  dispatch(interaction: Interaction): void;
}
