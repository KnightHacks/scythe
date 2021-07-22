import { Collection, CommandInteraction, CommandInteractionOption } from 'discord.js';

export function getSubCommands(interaction: CommandInteraction): Collection<string, CommandInteractionOption> {
  return interaction.options.filter(option => option.type === 'SUB_COMMAND');
}
