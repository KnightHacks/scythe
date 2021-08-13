import { ApplicationCommandOptionData, ApplicationCommandData, Constants, ApplicationCommandChoicesData, ApplicationCommandSubGroupData } from 'discord.js';

function normalizeOption(option: ApplicationCommandOptionData): ApplicationCommandOptionData {
  if (!option.required) {
    option.required = false; // Default for required
  }

  if (isChoiceBasedOption(option)) {
    // These stubs are needed for deep comparisons
    // because discord.js return values set to undefined.
    if (!option.choices) {
      option.choices = undefined;
    }
  }

  if (isSubOptionBasedOption(option)) {
    if (!option.options) {
      option.options = undefined;
    } else {
      // Recurse through sub options.
      option.options.map(normalizeOption);
    }
  }
  
  return option;
}

// TODO: Replace when https://github.com/discordjs/discord.js/pull/6410 is merged.
export function isChoiceBasedOption(option: ApplicationCommandOptionData): option is ApplicationCommandChoicesData {
  return option.type === 'BOOLEAN' || 
         option.type === Constants.ApplicationCommandOptionTypes.BOOLEAN ||
         option.type === 'INTEGER' ||
         option.type === Constants.ApplicationCommandOptionTypes.INTEGER ||
         option.type === 'STRING' ||
         option.type === Constants.ApplicationCommandOptionTypes.STRING ||
         option.type === 'NUMBER' ||
         option.type === Constants.ApplicationCommandOptionTypes.NUMBER;
}

// TODO: Replace when https://github.com/discordjs/discord.js/pull/6410 is merged.
export function isSubOptionBasedOption(option: ApplicationCommandOptionData): option is (ApplicationCommandSubGroupData | ApplicationCommandSubGroupData)  {
  return option.type === 'SUB_COMMAND' ||
         option.type === 'SUB_COMMAND_GROUP';
}
  
export function toData(command: ApplicationCommandData): ApplicationCommandData {
  // Normalize all of the options.
  if (!command.type || command.type === 'CHAT_INPUT' || command.type === Constants.ApplicationCommandTypes.CHAT_INPUT) {
    // Normalize all of the options.
    const newOptions = command.options?.map(normalizeOption);
    return {
      type: command.type,
      name: command.name,
      description: command.description,
      options: newOptions ?? [],
    };
  } else {
    return {
      type: command.type,
      name: command.name,
    };
  }
}
