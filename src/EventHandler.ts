import { DMChannel, Message } from 'discord.js';
import { Client } from '.';
import { AutocompleteHandler } from './AutocompleteHandler';
import { Command } from './Command';
import { dispatch } from './dispatch';
import { MessageFilter, runMessageFilters } from './messageFilters';
import { bindAllMethods } from './utils/bindAllMethods';

/**
 * This module sets up event handling for button and select menu listeners and
 * message filters, logging any potential problems.
 */
export class EventHandler {
  /** callbacks that are invoked on every message to decide if the message should be deleted */
  messageFilters: MessageFilter[] = [];
  /** `Command`[] to register to listen for `CommandInteraction`s */
  commands: Command[] = [];
  /** Stores commands that are cooling down */
  private cooldowns = new Set<Command>();
  /** Handlers use to process autocomplete interactions */
  autoCompleteHandlers: Map<string, AutocompleteHandler> = new Map();

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
      if (interaction.isCommand() || interaction.isContextMenuCommand()) {
        dispatch(
          interaction,
          this.commands,
          this.registerMessageFilters,
          client.onError,
          this.cooldowns
        );
      } else if (interaction.isAutocomplete()) {
        const handler = this.autoCompleteHandlers.get(interaction.commandName);

        if (!handler) {
          return;
        }

        handler.onAutocomplete(interaction);
      }
    });
  }

  registerMessageFilters = (filters: MessageFilter[]): void => {
    this.messageFilters.push(...filters);
  };
}
