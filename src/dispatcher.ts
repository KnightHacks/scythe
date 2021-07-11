import { Interaction } from 'discord.js';

export default interface Dispatchable {
  dispatch(interaction: Interaction): void;
}
