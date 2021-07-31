import {
  ButtonInteraction,
  MessageButtonOptions,
  MessageButtonStyleResolvable,
} from 'discord.js';
import { getID } from './UI';

export type ButtonHandler = (
  interaction: ButtonInteraction
) => void | Promise<void>;

export type ButtonOptions = Omit<
  MessageButtonOptions,
  'customId' | 'style' | 'url'
> & {
  style: Exclude<MessageButtonStyleResolvable, 'LINK'>;
  onClick: ButtonHandler;
};

export class DispatchButton {
  constructor(readonly options: ButtonOptions) {}

  toDiscordComponent({
    buttonListeners,
  }: {
    buttonListeners: Map<string, ButtonHandler>;
  }): MessageButtonOptions {
    const { onClick, ...options } = this.options;
    // nonlink buttons must have a customId
    const id = getID(this.options.label ?? '<unlabeled>', 'button');
    buttonListeners.set(id, onClick);
    return { ...options, type: 'BUTTON', customId: id };
  }
}
