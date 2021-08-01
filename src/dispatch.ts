import { CommandInteraction, MessageActionRow } from 'discord.js';
import { Command } from './Command';
import { UIComponent } from './UI';

export async function dispatch(
  interaction: CommandInteraction,
  commands: Command[],
  registerUI: (
    ui: UIComponent | UIComponent[] | UIComponent[][]
  ) => MessageActionRow[]
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
    });
  } catch (error) {
    console.error(error);
  }
}
