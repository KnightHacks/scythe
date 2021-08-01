import {
  ButtonInteraction,
  Client,
  CommandInteraction,
  MessageActionRow,
  SelectMenuInteraction,
} from 'discord.js';
import { bindAll } from 'lodash';
import { Command } from './Command';
import { dispatch } from './dispatch';
import {
  ButtonHandler,
  SelectMenuHandler,
  toDiscordUI,
  UIComponent,
} from './UI';

export function registerInteractionListener(
  client: Client,
  commands: Command[]
): void {
  const buttonListeners: Map<string, ButtonHandler> = new Map();
  const selectMenuListeners: Map<string, SelectMenuHandler> = new Map();

  /**
   * Generates a discord.js `MessageActionRow[]` that can be used in a
   * message reply as the `components` argument. Allows use of `onClick` and
   * `onSelect` by autogenerating and registering IDs.
   *
   * @param ui Either a single `UIComponent` or a 1D or 2D array of `UIComponent`s
   * @returns a generated `MessageActionRow[]`
   */
  const registerUI = (
    ui: UIComponent | UIComponent[] | UIComponent[][]
  ): MessageActionRow[] => {
    return toDiscordUI(ui, buttonListeners, selectMenuListeners);
  };

  client.on('interactionCreate', (interaction) => {
    interaction = bindAllMethods(interaction);
    if (interaction instanceof CommandInteraction) {
      dispatch(interaction, commands, registerUI);
    }

    if (interaction instanceof ButtonInteraction) {
      const handler = buttonListeners.get(interaction.customId);

      if (!handler) {
        return;
      }

      // Run handler.
      handler(interaction);
    }

    if (interaction instanceof SelectMenuInteraction) {
      const handler = selectMenuListeners.get(interaction.customId);

      if (!handler) {
        return;
      }

      handler(interaction);
    }
  });
}

export function bindAllMethods<T>(object: T): T {
  return bindAll(object, getAllMethods(object));
}

// don't look below here, evil awaits you
function getAllMethods(object: unknown): string[] {
  return getAllMethodsHelper(object).filter(
    (prop) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prop !== 'constructor' && typeof (object as any)[prop] === 'function'
  );
}

function getAllMethodsHelper(object: unknown): string[] {
  const props = Object.getOwnPropertyNames(object);
  if (Object.getPrototypeOf(object) !== null) {
    props.push(...getAllMethodsHelper(Object.getPrototypeOf(object)));
  }
  return props;
}
