import {
  ButtonInteraction,
  MessageButtonOptions,
  MessageButtonStyle,
} from 'discord.js';
import { Simplify } from '../utils/Simplify';
import { UIComponent } from './UI';

export type ButtonHandler = (
  interaction: ButtonInteraction
) => void | Promise<void>;

export type Button = Simplify<
  Omit<MessageButtonOptions, 'customId' | 'type'> & {
    style: Simplify<Exclude<MessageButtonStyle, 'LINK'>>;
    onClick: ButtonHandler;
  }
>;

export type LinkButton = Simplify<
  Omit<MessageButtonOptions, 'customId' | 'type'> & {
    style: 'LINK';
    url: string;
  }
>;

export function isLinkButton(options: UIComponent): options is LinkButton {
  return 'url' in options && 'style' in options && options.style === 'LINK';
}

export function isRegularButton(
  options: UIComponent
): options is Button {
  return 'onClick' in options && 'style' in options;
}
