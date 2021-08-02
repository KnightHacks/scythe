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
import { MessageFilter, runMessageFilters } from './messageFilters';
import { ButtonHandler, SelectMenuHandler, toDiscordUI, UI } from './UI';

/**
 * This module sets up event handling for button and select menu listeners and
 * manages incoming interactions, logging any potential problems.
 * @param client `Client` object used to register main interaction handler
 * @param commands `Command`[] to register to listen for `CommandInteraction`s
 * @param buttonListeners map from `customId`s to `ButtonHandler`s used to
 * dispatch listeners
 * @param selectMenuListeners map from `customId`s to `SelectMenuHandler`s used to
 * dispatch listeners
 * @param messageFilters callbacks that are invoked on every message to
 * decide if the message should be deleted
 */
export function registerInteractionListener(
  client: Client,
  commands: Command[],
  buttonListeners: Map<string, ButtonHandler>,
  selectMenuListeners: Map<string, SelectMenuHandler>,
  messageFilters: MessageFilter[]
): void {
  /**
   * Generates a discord.js `MessageActionRow[]` that can be used in a
   * message reply as the `components` argument. Allows use of `onClick` and
   * `onSelect` by autogenerating and registering IDs.
   *
   * @param ui Either a single `UIComponent` or a 1D or 2D array of `UIComponent`s
   * @returns a generated `MessageActionRow[]`
   */
  const registerUI = (ui: UI): MessageActionRow[] => {
    return toDiscordUI(ui, buttonListeners, selectMenuListeners);
  };

  const registerMessageFilters = (filters: MessageFilter[]): void => {
    messageFilters.push(...filters);
  };

  // set up message filters
  client.on(
    'messageCreate',
    async (message) => await runMessageFilters(message, messageFilters)
  );

  // handle incoming interactions
  client.on('interactionCreate', (interaction) => {
    interaction = bindAllMethods(interaction);
    if (interaction instanceof CommandInteraction) {
      dispatch(interaction, commands, registerUI, registerMessageFilters);
    } else if (interaction instanceof ButtonInteraction) {
      const handler = buttonListeners.get(interaction.customId);
      if (!handler) {
        console.log(`Unregistered customId "${interaction.customId}"`);
        return;
      }
      handler(interaction);
    } else if (interaction instanceof SelectMenuInteraction) {
      const handler = selectMenuListeners.get(interaction.customId);
      if (!handler) {
        console.log(`Unregistered customId "${interaction.customId}"`);
        return;
      }
      handler(interaction);
    } else {
      console.log('Unexpected interaction:');
      console.log(interaction);
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
