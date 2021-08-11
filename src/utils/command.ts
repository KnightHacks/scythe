import { ApplicationCommandOptionData, ApplicationCommandData } from 'discord.js';

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
  
export function toData(command: ApplicationCommandData): ApplicationCommandData {

  const name = command.name;

  // Normalize all of the options.
  if (command.type === 'CHAT_INPUT') {
    // Normalize all of the options.
    const newOptions = command.options?.map(normalizeOption);

    return {
      type: command.type,
      name,
      description: command.description,
      options: newOptions ?? [],
    };
  } else {
    return {
      type: command.type,
      name,
    } as ApplicationCommandData;
  }
}
