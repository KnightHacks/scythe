import {
  MessageActionRow,
  MessageButtonOptions,
  MessageSelectMenuOptions,
} from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { ButtonHandler, Button } from './Button';
import { DispatchSelectMenu, SelectMenuHandler } from './DispatchSelectMenu';

export type UIComponent = Button | DispatchSelectMenu;

export function toComponents(
  components: UIComponent | UIComponent[] | UIComponent[][],
  buttonListeners: Map<string, ButtonHandler>,
  selectMenuListeners: Map<string, SelectMenuHandler>
): MessageActionRow[] {
  const normalizedUI = normalizeUI(components);
  const configInRows: (MessageButtonOptions | MessageSelectMenuOptions)[][] =
    normalizedUI.map((row) =>
      row.map((component) =>
        component.toDiscordComponent({ buttonListeners, selectMenuListeners })
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

export function getID(label: string, componentType: string): string {
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
