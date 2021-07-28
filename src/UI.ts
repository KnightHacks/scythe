import {
  EmojiIdentifierResolvable,
  MessageActionRow,
  MessageButtonOptions,
  MessageButtonStyleResolvable,
} from 'discord.js';
import { ButtonHandler } from './ButtonHandler';
import { v4 as uuidv4 } from 'uuid';

export type UIComponent = DispatchButton | DispatchLinkButton;

export type ButtonOptions = {
  disabled?: boolean;
  emoji?: EmojiIdentifierResolvable;
  label?: string;
  style: Exclude<MessageButtonStyleResolvable, 'LINK'>;
  onClick: ButtonHandler;
};

export type LinkButtonOptions = {
  disabled?: boolean;
  emoji?: EmojiIdentifierResolvable;
  label?: string;
  url: string;
};

export class DispatchButton {
  constructor(readonly options: ButtonOptions) {}
}

export class DispatchLinkButton {
  constructor(readonly options: LinkButtonOptions) {}
}

export function toComponents(
  components: UIComponent[][],
  buttonListeners: Map<string, ButtonHandler>,
): MessageActionRow[] {
  const configInRows: MessageButtonOptions[][] = components.map(
    (row) =>
      row.map((component) => {
        if (component instanceof DispatchButton) {
          const { onClick, ...options } = component.options;
          // nonlink buttons must have a customId
          const id = getID(
            component.options.label ?? '<unlabeled>',
            'button'
          );
          buttonListeners.set(id, onClick);
          return { ...options, type: 'BUTTON', customId: id };
        } else if (component instanceof DispatchLinkButton) {
          // we override style in case the user omitted it
          return {
            ...component.options,
            type: 'BUTTON',
            style: 'LINK'
          };
        } else {
          throw new Error('No such component type!');
        }
      })
  );
  return configInRows.map((row) =>
    new MessageActionRow().addComponents(...row)
  );
}

function getID(label: string, componentType: string): string {
  const uuid: string = uuidv4();
  return `${label}$${componentType}$${uuid}`;
}
