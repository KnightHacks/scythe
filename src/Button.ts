import { MessageActionRow, MessageButtonOptions } from 'discord.js';
import { ButtonHandler } from './ButtonListener';
import Client from './Client';

export type Button = MessageButtonOptions & {
  onClick: ButtonHandler;
};

export function toComponents(client: Client, buttons: Button[][]): MessageActionRow[] {
  const configInRows: MessageButtonOptions[][] = buttons.map((row) =>
    row.map((button) => {
      if (!button.customId) {
        const id = getButtonID();
        const copy: MessageButtonOptions & { onClick?: ButtonHandler } = {
          customId: id,
          ...button,
        };
        if (copy.onClick) {
          client.addButtonListener(id, copy.onClick);
        }
        delete copy.onClick;
        return copy;
      } else {
        return button;
      }
    })
  );
  return configInRows.map((row) => new MessageActionRow().addComponents(row));
}

let counter = 1;
function getButtonID(): string {
  return `button_${counter++}`;
}
