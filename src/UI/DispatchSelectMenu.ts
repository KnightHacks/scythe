import { MessageSelectMenuOptions, SelectMenuInteraction } from 'discord.js';
import { getID } from './UI';

export type SelectMenuOptions = Omit<MessageSelectMenuOptions, 'customId'> & {
  onSelect: SelectMenuHandler;
};

export type SelectMenuHandler = (
  interaction: SelectMenuInteraction
) => void | Promise<void>;

export class DispatchSelectMenu {
  constructor(readonly options: SelectMenuOptions) {}

  toDiscordComponent({
    selectMenuListeners,
  }: {
    selectMenuListeners: Map<string, SelectMenuHandler>;
  }): MessageSelectMenuOptions {
    const { onSelect, ...options } = this.options;
    const id = getID(this.options.placeholder ?? '<noplaceholder>', 'select');
    selectMenuListeners.set(id, onSelect);
    return {
      ...options,
      type: 'SELECT_MENU',
      customId: id,
    };
  }
}
