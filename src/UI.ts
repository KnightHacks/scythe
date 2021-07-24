import {
  MessageActionRow,
  MessageButtonOptions,
} from 'discord.js';
import { ButtonHandler } from './ButtonHandler';
import Client from './Client';
import { v4 as uuidv4 } from 'uuid';

export type UIComponent = DispatchButton;

export type ButtonOptions = MessageButtonOptions & {
  onClick?: ButtonHandler;
};

export class DispatchButton {
  constructor(readonly options: ButtonOptions) {}
}

export function toComponents(
  client: Client,
  components: UIComponent[][]
): MessageActionRow[] {
  const configInRows: ButtonOptions[][] = components.map(
    (row) =>
      row.map((component) => {
        if (component instanceof DispatchButton) {
          if (component.options.onClick) {
            const id = getID(
              component.options.label ?? '<unlabeled>',
              'button'
            );
            const copy: ButtonOptions = {
              ...component.options,
              customId: id,
              type: 'BUTTON',
            };
            delete copy.onClick;
            client.buttonListeners.set(id, component.options.onClick);
            return copy;
          } else {
            return component.options;
          }
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
