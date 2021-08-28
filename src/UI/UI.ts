import {
  MessageActionRow,
  MessageButtonOptions,
  MessageSelectMenuOptions,
  MessageSelectOptionData,
} from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import {
  Button,
  ButtonHandler,
  isLinkButton,
  isRegularButton,
  LinkButton,
} from './Button';
import { SelectMenu, SelectMenuHandler, SelectOption } from './SelectMenu';

export type UI = UIComponent | Row | [Row, Row?, Row?, Row?, Row?];

export type Row =
  | [
      Button | LinkButton,
      (Button | LinkButton)?,
      (Button | LinkButton)?,
      (Button | LinkButton)?,
      (Button | LinkButton)?
    ]
  | [SelectMenu];

export type UIComponent = Button | LinkButton | SelectMenu;

export function toDiscordUI(
  components: UI,
  buttonListeners: Map<string, ButtonHandler>,
  selectMenuListeners: Map<string, SelectMenuHandler>
): MessageActionRow[] {
  const normalizedUI = normalizeUI(components);
  const configInRows: (MessageButtonOptions | MessageSelectMenuOptions)[][] =
    normalizedUI.map((row) =>
      row.map((component) =>
        toDiscordComponent(component, buttonListeners, selectMenuListeners)
      )
    );
  return configInRows.map((row) =>
    new MessageActionRow().addComponents(...row)
  );
}

function toDiscordComponent(
  options: UIComponent,
  buttonListeners: Map<string, ButtonHandler>,
  selectMenuListeners: Map<string, SelectMenuHandler>
): MessageButtonOptions | MessageSelectMenuOptions {
  if (isLinkButton(options)) {
    return {
      ...options,
      type: 'BUTTON',
    };
  } else if (isRegularButton(options)) {
    // nonlink buttons must have a customId
    const { onClick, ...buttonOptions } = options;
    const id = getID(options.label ?? '<unlabeled>', 'button');
    buttonListeners.set(id, onClick);
    return { ...buttonOptions, type: 'BUTTON', customId: id };
  } else {
    const { onSelect, options: optionOptions, ...selectOptions } = options;
    const discordOptionOptions: MessageSelectOptionData[] = optionOptions.map(
      toDiscordSelectOptionData
    );
    const id = getID(selectOptions.placeholder ?? '<noplaceholder>', 'select');
    selectMenuListeners.set(id, onSelect);
    return {
      ...selectOptions,
      options: discordOptionOptions,
      type: 'SELECT_MENU',
      customId: id,
    };
  }
}

function getID(label: string, componentType: string): string {
  const uuid: string = uuidv4();
  return `${label}$${componentType}$${uuid}`;
}

function normalizeUI(ui: UI): UIComponent[][] {
  /*
   * We allow the user to pass in a single UI element, a row of elements, or
   * multiple rows of elements.
   */
  if (!Array.isArray(ui)) {
    // single item, so we need to wrap in [][] because toComponents expects a UIComponent[][]
    return [[ui]];
  } else {
    const maybeArray: UIComponent | Row = ui[0];
    if (Array.isArray(maybeArray)) {
      // we cast because it must be a 2d array
      return ui as UIComponent[][];
    } else {
      // only a 1d array, so wrap in an array once
      return [ui as UIComponent[]];
    }
  }
}

function toDiscordSelectOptionData(
  option: SelectOption
): MessageSelectOptionData {
  const { value, ...rest } = option;
  if (value === undefined) {
    return {
      ...rest,
      value: rest.label,
    };
  }
  return {
    ...rest,
    value,
  };
}
