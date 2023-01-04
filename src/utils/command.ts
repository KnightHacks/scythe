import {
  ApplicationCommandOptionData,
  ApplicationCommandData,
  ApplicationCommandChoicesData,
  ApplicationCommandSubGroupData,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from 'discord.js';

function normalizeOption(
  option: ApplicationCommandOptionData
): ApplicationCommandOptionData {
  // Default for required
  if ('required' in option) {
    option.required = option.required ?? false;
  }

  if (isChoiceBasedOption(option)) {
    // These stubs are needed for deep comparisons
    // because discord.js return values set to undefined.
    option.choices = option.choices ?? undefined;
  }

  if (isSubOptionBasedOption(option)) {
    if (!option.options) {
      option.options = undefined;
    } else {
      // Recurse through sub options.
      option.options.forEach(normalizeOption);
    }
  }

  return option;
}

// TODO: Replace when https://github.com/discordjs/discord.js/pull/6410 is merged.
export function isChoiceBasedOption(
  option: unknown
): option is ApplicationCommandChoicesData {
  if (!('type' in (option as object))) {
    return false;
  }

  const optionCopy: ApplicationCommandOptionData =
    option as ApplicationCommandOptionData;

  return (
    optionCopy.type === ApplicationCommandOptionType.Boolean ||
    optionCopy.type === ApplicationCommandOptionType.String ||
    optionCopy.type === ApplicationCommandOptionType.Number ||
    optionCopy.type === ApplicationCommandOptionType.Integer
  );
}

// TODO: Replace when https://github.com/discordjs/discord.js/pull/6410 is merged.
export function isSubOptionBasedOption(
  option: ApplicationCommandOptionData
): option is ApplicationCommandSubGroupData | ApplicationCommandSubGroupData {
  return (
    option.type === ApplicationCommandOptionType.Subcommand ||
    option.type === ApplicationCommandOptionType.SubcommandGroup
  );
}

export function toData(
  command: ApplicationCommandData
): ApplicationCommandData {
  // Normalize all of the options.
  if (!command.type || command.type === ApplicationCommandType.ChatInput) {
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
