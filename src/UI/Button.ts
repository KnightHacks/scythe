import {
  ButtonInteraction,
  MessageButtonOptions,
  MessageButtonStyle,
} from 'discord.js';
import { UIComponent } from './UI';

export type ButtonHandler = (
  interaction: ButtonInteraction
) => void | Promise<void>;

export type Button = Omit<MessageButtonOptions, 'customId'> & {
  style: Exclude<MessageButtonStyle, 'LINK'>;
  onClick: ButtonHandler;
};

export type LinkButton = MessageButtonOptions & {
  style: 'LINK';
};

export function isLinkButton(options: UIComponent): options is LinkButton {
  return 'url' in options && 'style' in options && options.style === 'LINK';
}

export function isRegularButton(options: UIComponent): options is Button {
  return 'onClick' in options && 'style' in options;
}
