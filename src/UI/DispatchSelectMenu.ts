import { MessageSelectMenuOptions, SelectMenuInteraction } from 'discord.js';

export type SelectMenuOptions = Omit<MessageSelectMenuOptions, 'customId'> & {
  onSelect: SelectMenuHandler;
};

export type SelectMenuHandler = (
  interaction: SelectMenuInteraction
) => void | Promise<void>;
