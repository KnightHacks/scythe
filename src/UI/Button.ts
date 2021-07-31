import {
  ButtonInteraction,
  MessageButtonOptions,
  MessageButtonStyle,
} from 'discord.js';
import { getID } from './UI';

export type ButtonHandler = (
  interaction: ButtonInteraction
) => void | Promise<void>;

export type ButtonOptions = Omit<MessageButtonOptions, 'customId'> & {
  style: Exclude<MessageButtonStyle, 'LINK'>;
  onClick: ButtonHandler;
};

export type LinkButtonOptions = MessageButtonOptions & {
  style: 'LINK';
};

function isLinkButtonOptions(
  options: LinkButtonOptions | ButtonOptions
): options is LinkButtonOptions {
  return options.style === 'LINK';
}

export class Button {
  constructor(readonly options: ButtonOptions | LinkButtonOptions) {}

  toDiscordComponent({
    buttonListeners,
  }: {
    buttonListeners: Map<string, ButtonHandler>;
  }): MessageButtonOptions {
    if (isLinkButtonOptions(this.options)) {
      return {
        ...this.options,
        type: 'BUTTON',
      };
    } else {
      const { onClick, ...options } = this.options;
      // nonlink buttons must have a customId
      const id = getID(options.label ?? '<unlabeled>', 'button');
      buttonListeners.set(id, onClick);
      return { ...options, type: 'BUTTON', customId: id };
    }
  }
}
