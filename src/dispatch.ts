import { CommandInteraction } from 'discord.js';
import { Command } from './Command';
import Client from './Client';

export async function dispatch(
  interaction: CommandInteraction,
  commands: Command[],
  client: Client
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

  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('got here');
      await command.run(interaction, client);
    } catch(error) {
      console.error(error);
    }
  } else {
    await command.run(interaction, client);
  }
}
