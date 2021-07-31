import { MessageSelectMenuOptions, SelectMenuInteraction } from 'discord.js';
import { UIComponent } from './UI';

export type SelectMenuOptions = Omit<MessageSelectMenuOptions, 'customId'> & {
  onSelect: SelectMenuHandler;
};

export type SelectMenuHandler = (
  interaction: SelectMenuInteraction
) => void | Promise<void>;

export function isSelectMenuOptions(
  options: UIComponent
): options is SelectMenuOptions {
  return 'onSelect' in options;
}
