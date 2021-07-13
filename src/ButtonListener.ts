import { ButtonInteraction } from 'discord.js';

export type ButtonHandler = (interaction: ButtonInteraction) => void | Promise<void>;

/**
 * A listner used for button interactions.
 */
export class ButtonListener {
  /**
   * All of the registered listeners  
   */  
  public readonly listeners = new Map<string, ButtonHandler>();

  /**
   * Registers an event handler when a button with the given id is pressed.
   * @param interactionID The custom_id associated with the button component.
   * @param handler The code to run when the button is pressed.
   */
  public on(interactionID: string, handler: ButtonHandler): void {
    this.listeners.set(interactionID, handler);
  }
}
