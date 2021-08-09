import { CommandInteraction, MessageActionRow } from 'discord.js';
import { Client } from '.';
import { Command } from './Command';
import { MessageFilter } from './messageFilters';
import { UI } from './UI';

export async function dispatch(
  client: Client,
  interaction: CommandInteraction,
  commands: Command[],
  registerUI: (ui: UI) => MessageActionRow[],
  registerMessageFilters: (filters: MessageFilter[]) => void
): Promise<void> {
  // FIXME O(n) performance
  const command = commands.find((c) => c.name === interaction.commandName);

  // This should ideally never happen.
  if (!command) {
    interaction.reply('Error finding that command');
    return;
  }

  if (command.permissionHandler) {
    const check = await command.permissionHandler(interaction);

    // A message was provided, use it.
    if (typeof check === 'string') {
      await interaction.reply({
        content: check,
        ephemeral: true,
      });

      return;
    }

    // A boolean was provided, use generic message.
    if (typeof check === 'boolean' && !check) {
      await interaction.reply({
        content: 'You do not have permission to execute this command.',
        ephemeral: true,
      });

      return;
    }
  }

  try {
    await command.run({
      interaction,
      registerUI,
      registerMessageFilters,
    });
  } catch (error) {
    if (client.onError) {
      client.onError(command, error);
    }
  }
}
