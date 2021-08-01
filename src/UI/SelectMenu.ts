import {
  MessageSelectMenuOptions,
  MessageSelectOptionData,
  SelectMenuInteraction,
} from 'discord.js';
import { UIComponent } from './UI';

export type SelectOption = Omit<MessageSelectOptionData, 'value'> & {
  value?: string;
};

export type SelectMenu = Omit<
  MessageSelectMenuOptions,
  'customId' | 'options'
> & {
  onSelect: SelectMenuHandler;
  options: SelectOption[];
};

export type SelectMenuHandler = (
  interaction: SelectMenuInteraction
) => void | Promise<void>;

export function isSelectMenu(options: UIComponent): options is SelectMenu {
  return 'onSelect' in options;
}
