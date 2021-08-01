import {
  MessageSelectMenuOptions,
  MessageSelectOptionData,
  SelectMenuInteraction,
} from 'discord.js';
import { UIComponent } from './UI';

export type SelectOptionData = Omit<MessageSelectOptionData, 'value'> & {
  value?: string;
};

export type SelectMenuOptions = Omit<
  MessageSelectMenuOptions,
  'customId' | 'options'
> & {
  onSelect: SelectMenuHandler;
  options: SelectOptionData[];
};

export type SelectMenuHandler = (
  interaction: SelectMenuInteraction
) => void | Promise<void>;

export function isSelectMenuOptions(
  options: UIComponent
): options is SelectMenuOptions {
  return 'onSelect' in options;
}
