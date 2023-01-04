import { CommandInteraction, ContextMenuCommandInteraction } from 'discord.js';
import { Command, RawCommand } from './Command';
import { MessageFilter } from './messageFilters';

export async function dispatch(
  interaction: CommandInteraction | ContextMenuCommandInteraction,
  commands: Command[],
  registerMessageFilters: (filters: MessageFilter[]) => void,
  onError: (command: Command, error: Error) => void,
  cooldowns: Set<Command>
): Promise<void> {
  // FIXME O(n) performance
  const command = commands.find(
    (c) => c.name === interaction.commandName
  ) as RawCommand;

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

  // Check cooldown.
  if (cooldowns.has(command)) {
    await interaction.reply({
      content: 'Please wait for the cooldown to stop before using this again.',
      ephemeral: true,
    });
    return;
  }

  if (command.cooldown) {
    // Add to cooldown set.
    cooldowns.add(command);

    // Queue up its removal after cooldown duration.
    setTimeout(() => cooldowns.delete(command), 1000 * command.cooldown);
  }

  try {
    await command.run({
      interaction,
      registerMessageFilters,
    });
  } catch (error) {
    onError(command, error as Error);
  }
}
