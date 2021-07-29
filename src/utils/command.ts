import { ApplicationCommandOptionData, ApplicationCommand, ApplicationCommandData } from 'discord.js';
import { isEqual } from 'lodash';
import { Command } from '..';

function normalizeOption(option: ApplicationCommandOptionData): ApplicationCommandOptionData {
  if (!option.required) {
    option.required = false; // Default for required
  }
  
  // These stubs are needed for deep comparisons
  // because discord.js return values set to undefined.
  if (!option.choices) {
    option.choices = undefined;
  }
  
  if (!option.options) {
    option.options = undefined;
  } else {
    // Recurse through sub options.
    option.options.map(normalizeOption);
  }
  
  return option;
}
  
export function toData(command: ApplicationCommand | Command): ApplicationCommandData {
  // Normalize all of the options.
  const newOptions = command.options?.map(normalizeOption);
  
  return {
    name: command.name,
    description: command.description,
    options: newOptions ?? []
  };
}

export function commandEquals(a?: ApplicationCommandData, b?: ApplicationCommandData): boolean {

  if (!a && !b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return isEqual(a, b);
}
