import {
  ButtonInteraction,
  MessageButtonOptions,
  MessageButtonStyle,
  MessageSelectMenuOptions,
} from 'discord.js';
import { SelectMenuHandler } from './DispatchSelectMenu';
import { getID, UIComponent } from './UI';

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
  options: UIComponent
): options is LinkButtonOptions {
  return 'url' in options && 'style' in options && options.style === 'LINK';
}

function isRegularButtonOptions(
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

export function toDiscordComponent(
  options: UIComponent,
  buttonListeners: Map<string, ButtonHandler>,
  selectMenuListeners: Map<string, SelectMenuHandler>
): MessageButtonOptions | MessageSelectMenuOptions {
  if (isLinkButtonOptions(options)) {
    return {
      ...options,
      type: 'BUTTON',
    };
  } else if (isRegularButtonOptions(options)) {
    // nonlink buttons must have a customId
    const { onClick, ...buttonOptions } = options;
    const id = getID(options.label ?? '<unlabeled>', 'button');
    buttonListeners.set(id, onClick);
    return { ...buttonOptions, type: 'BUTTON', customId: id };
  } else {
    const { onSelect, ...selectOptions } = options;
    const id = getID(selectOptions.placeholder ?? '<noplaceholder>', 'select');
    selectMenuListeners.set(id, onSelect);
    return {
      ...selectOptions,
      type: 'SELECT_MENU',
      customId: id,
    };
  }
}
