import { AutocompleteInteraction } from 'discord.js';

export interface AutocompleteHandler {
  /**
   * The name of the command to listen to autocomplete from.
   */
  commandName: string;
  /**
   * The handler invoked whenever an autocomplete interaction with the
   * given `commandName` is received.
   * @param interaction The autocomplete interaction to handle.
   */
  onAutocomplete(interaction: AutocompleteInteraction): Promise<void> | void;
}

/**
 * Returns whether an unknown object is a `AutocompleteHandler` or not.
 * @param maybeAuto The object to check.
 * @returns true if it's the same type as `AutocompleteHandler`, false otherwise.
 */
export function isAutocompleteHandler(
  maybeAuto: unknown
): maybeAuto is AutocompleteHandler {
  if (typeof maybeAuto !== 'object' || maybeAuto == null) {
    return false;
  }

  return 'commandName' in maybeAuto && 'onAutocomplete' in maybeAuto;
}
