import {
  ButtonInteraction,
  MessageButtonOptions,
  MessageButtonStyle
} from 'discord.js';
import {UIComponent} from './UI';

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

export function isLinkButtonOptions(
  options: UIComponent
): options is LinkButtonOptions {
  return 'url' in options && 'style' in options && options.style === 'LINK';
}

export function isRegularButtonOptions(
  options: UIComponent
): options is ButtonOptions {
  return 'onClick' in options && 'style' in options;
}

/* for future use if more types are needed
function isSelectMenuOptions(
  options: UIComponent
): options is SelectMenuOptions {
  return 'onSelect' in options;
}
*/
