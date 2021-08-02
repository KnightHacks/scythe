import {
  MessageSelectMenuOptions,
  MessageSelectOptionData,
  SelectMenuInteraction,
} from 'discord.js';
import { Simplify } from '../utils/Simplify';
import { UIComponent } from './UI';

export type SelectOption = Simplify<
  Omit<MessageSelectOptionData, 'value'> & {
    value?: string;
  }
>;

export type SelectMenu = Simplify<
  Omit<MessageSelectMenuOptions, 'customId' | 'options' | 'type'> & {
    onSelect: SelectMenuHandler;
    options: SelectOption[];
  }
>;

export type SelectMenuHandler = (
  interaction: SelectMenuInteraction
) => void | Promise<void>;

export function isSelectMenu(options: UIComponent): options is SelectMenu {
  return 'onSelect' in options;
}
