import { Client, DMChannel, Message, MessageActionRow } from 'discord.js';
import { Command } from './Command';
import { dispatch } from './dispatch';
import { MessageFilter, runMessageFilters } from './messageFilters';
import { ButtonHandler, SelectMenuHandler, toDiscordUI, UI } from './UI';
import { bindAllMethods } from './utils/bindAllMethods';

/**
 * This module sets up event handling for button and select menu listeners and
 * message filters, logging any potential problems.
 */
export class EventHandler {
  /** map from `customId`s to `ButtonHandler`s used to dispatch listeners */
  buttonListeners: Map<string, ButtonHandler> = new Map();
  /** map from `customId`s to `SelectMenuHandler`s used to dispatch listeners */
  selectMenuListeners: Map<string, SelectMenuHandler> = new Map();
  /** callbacks that are invoked on every message to decide if the message should be deleted */
  messageFilters: MessageFilter[] = [];
  /** `Command`[] to register to listen for `CommandInteraction`s */
  commands: Command[] = [];

  /**
   * @param client client used to register event handlers
   */
  constructor(client: Client) {
    // set up message filters
    client.on('messageCreate', async (message) => {
      if (message.channel instanceof DMChannel) {
        return;
      }
      await runMessageFilters(message, this.messageFilters);
    });
    client.on('messageUpdate', async (_, message) => {
      if (message.channel instanceof DMChannel) {
        return;
      }
      await runMessageFilters(message as Message, this.messageFilters);
    });

    // handle incoming interactions
    client.on('interactionCreate', (interaction) => {
      interaction = bindAllMethods(interaction);
      if (interaction.isCommand()) {
        dispatch(
          interaction,
          this.commands,
          this.registerUI,
          this.registerMessageFilters
        );
      } else if (interaction.isButton()) {
        const handler = this.buttonListeners.get(interaction.customId);
        if (!handler) {
          console.log(`Unregistered customId "${interaction.customId}"`);
          return;
        }
        handler(interaction);
      } else if (interaction.isSelectMenu()) {
        const handler = this.selectMenuListeners.get(interaction.customId);
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

  /**
   * Generates a discord.js `MessageActionRow[]` that can be used in a
   * message reply as the `components` argument. Allows use of `onClick` and
   * `onSelect` by autogenerating and registering IDs.
   *
   * @param ui Either a single `UIComponent` or a 1D or 2D array of `UIComponent`s
   * @returns a generated `MessageActionRow[]`
   */
  registerUI = (ui: UI): MessageActionRow[] => {
    return toDiscordUI(ui, this.buttonListeners, this.selectMenuListeners);
  };

  registerMessageFilters = (filters: MessageFilter[]): void => {
    this.messageFilters.push(...filters);
  };
}
