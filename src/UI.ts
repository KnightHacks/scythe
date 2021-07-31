import {
  MessageActionRow,
  MessageButtonOptions,
  MessageButtonStyleResolvable,
  MessageSelectMenuOptions,
  SelectMenuInteraction,
} from 'discord.js';
import { ButtonHandler } from './ButtonHandler';
import { v4 as uuidv4 } from 'uuid';

export type UIComponent =
  | DispatchButton
  | DispatchLinkButton
  | DispatchSelectMenu;

export type ButtonOptions = Omit<
  MessageButtonOptions,
  'customId' | 'style' | 'url'
> & {
  style: Exclude<MessageButtonStyleResolvable, 'LINK'>;
  onClick: ButtonHandler;
};

export type LinkButtonOptions = Omit<
  MessageButtonOptions,
  'customId' | 'style' | 'url'
> & {
  url: string;
};

export class DispatchButton {
  constructor(readonly options: ButtonOptions) {}

  toDiscordComponent({
    buttonListeners,
  }: {
    buttonListeners: Map<string, ButtonHandler>;
  }): MessageButtonOptions {
    const { onClick, ...options } = this.options;
    // nonlink buttons must have a customId
    const id = getID(this.options.label ?? '<unlabeled>', 'button');
    buttonListeners.set(id, onClick);
    return { ...options, type: 'BUTTON', customId: id };
  }
}

export class DispatchLinkButton {
  constructor(readonly options: LinkButtonOptions) {}

  toDiscordComponent(): MessageButtonOptions {
    // we override style in case the user omitted it
    return {
      ...this.options,
      type: 'BUTTON',
      style: 'LINK',
    };
  }
}

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
