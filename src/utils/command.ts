import { ApplicationCommandOptionData, ApplicationCommandData, Constants, ChatInputApplicationCommandData, MessageApplicationCommandData, UserApplicationCommandData } from 'discord.js';

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

export function isChatInputCommand(commandData: ApplicationCommandData): commandData is ChatInputApplicationCommandData {
  return commandData.type === 'CHAT_INPUT' || 
         commandData.type === Constants.ApplicationCommandTypes.CHAT_INPUT;
}

export function isContextMenuCommand(commandData: ApplicationCommandData): commandData is (MessageApplicationCommandData | UserApplicationCommandData) {
  return commandData.type === 'MESSAGE' || 
         commandData.type === 'USER' || 
         commandData.type === Constants.ApplicationCommandTypes.MESSAGE || 
         commandData.type === Constants.ApplicationCommandTypes.USER;
}
  
export function toData(command: ApplicationCommandData): ApplicationCommandData {

  const name = command.name;

  // Normalize all of the options.
  if (isChatInputCommand(command)) {
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
    };
  }
}
