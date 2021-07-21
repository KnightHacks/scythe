import { CommandInteraction } from 'discord.js';
import { Command } from './Command';

export async function dispatch(
  interaction: CommandInteraction,
  commands: Command[]
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
    if (!check) {
      /*
       * It's not guaranteed that an interaction will be responded to
       * by the permission handlers. If it isn't, we provide a default
       * error message so the interaction is acknowledged.
       */
      if (!interaction.replied) {
        interaction.reply({
          content: 'You do not have permission to execute this command.',
          ephemeral: true,
        });
      }
      return;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('got here');
      await command.run(interaction);
    } catch(error) {
      console.error(error);
    }
  } else {
    await command.run(interaction);
  }
}
