import { Interaction } from 'discord.js';

/**
 * Represents an object than can handle various {@link Interaction}'s
 */
export default interface Dispatchable {
  dispatch(interaction: Interaction): void;
}
