import {
  MessageActionRow,
  MessageButtonOptions,
  MessageSelectMenuOptions,
} from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import {
  ButtonHandler,
  ButtonOptions,
  isLinkButtonOptions,
  isRegularButtonOptions,
  LinkButtonOptions,
} from './Button';
import { SelectMenuHandler, SelectMenuOptions } from './SelectMenu';

export type UIComponent = ButtonOptions | LinkButtonOptions | SelectMenuOptions;

export function toDiscordUI(
  components: UIComponent | UIComponent[] | UIComponent[][],
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
  // validate row constraints
  configInRows.forEach((row) => {
    validateSelectMenuAlone(row);
    validateMaxLength(row);
  });
  return configInRows.map((row) =>
    new MessageActionRow().addComponents(...row)
  );
}

function validateSelectMenuAlone(
  row: (MessageButtonOptions | MessageSelectMenuOptions)[]
) {
  if (row.find((config) => config.type === 'SELECT_MENU') && row.length > 1) {
    throw new Error('Rows with select menus cannot contain other elements!');
  }
}

function validateMaxLength(
  row: (MessageSelectMenuOptions | MessageSelectMenuOptions)[]
) {
  if (row.length > 5) {
    throw new Error(
      'Rows cannot have more than 5 elements!\n' +
        // this cast should be safe as validateSelectMenuAlone covers select menus in rows
        `Row containing "${row
          .map((x) => (x as MessageButtonOptions).label)
          .join(' ')}" is invalid.`
    );
  }
}

function getID(label: string, componentType: string): string {
  const uuid: string = uuidv4();
  return `${label}$${componentType}$${uuid}`;
}

function normalizeUI(
  ui: UIComponent | UIComponent[] | UIComponent[][]
): UIComponent[][] {
  /*
   * We allow the user to pass in a single UI element, a row of elements, or
   * multiple rows of elements.
   */
  if (!Array.isArray(ui)) {
    // single item, so we need to wrap in [][] because toComponents expects a UIComponent[][]
    return [[ui]];
  } else {
    const maybeArray: UIComponent | UIComponent[] | undefined = ui[0];
    if (maybeArray === undefined) {
      // we had an empty single array
      return [[]];
    } else if (Array.isArray(maybeArray)) {
      // we cast because it must be a 2d array
      return ui as UIComponent[][];
    } else {
      // only a 1d array, so wrap in an array once
      return [ui as UIComponent[]];
    }
  }
}

function toDiscordComponent(
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
