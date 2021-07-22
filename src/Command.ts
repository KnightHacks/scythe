import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  CommandInteraction,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export type PermissionHandler = (interaction: CommandInteraction) => boolean | Promise<boolean>;

/**
 * Represents a the blueprint for a slash commands.
 */
export interface Command {
  /**
   * The name of the command.
   */
  get name(): string;

  /**
   * The description of the command.
   */
  get description(): string;

  /**
   * The options available for this command.
   */
  readonly options?: ApplicationCommandOptionData[];

  /**
   * The function that gets executed after the command
   * is invoked.
   */
  run(interaction: CommandInteraction): Promise<void> | void;

  /**
   * The {@link PermissionHandler} that handles the permissions for this command.
   */
  readonly permissionHandler?: PermissionHandler;
}

export interface ParentCommand extends Omit<Command, 'run'> {
  /**
   * The subcommands associated with this command.
   */
  readonly subCommands?: SubCommand[];
}

type SubCommandOptionData = ApplicationCommandOptionData & {
  type: Exclude<ApplicationCommandOptionData['type'], 'SUB_COMMAND' | 'SUB_COMMAND_GROUP'>;
};

export interface SubCommand extends Omit<Command, 'options'> {
  readonly options?: SubCommandOptionData[];
}

const subCommand: SubCommand = {
  name: 'sub',
  description: 'A sub command',
  async run(interaction) {
    await interaction.reply('Hello World!');
  }
};

const parentCommand: ParentCommand = {
  name: 'parent',
  description: 'A parent command',
  subCommands: [
    subCommand
  ]
};

/**
 * Returns whether an object of unknown type is a Command.
 * @param maybeCommand The denormalized command type to check.
 * @returns true if it's a true instance of Command, false otherwise.
 */
export function isCommand(maybeCommand: unknown): maybeCommand is Command {
  // if we're not an object, property accesses will throw
  if (typeof maybeCommand !== 'object') {
    return false;
  }

  // Iterate through required command properties
  const requiredProps = ['name', 'run'];

  let retVal = true;
  requiredProps.forEach((prop) => {
    if (!(prop in (maybeCommand as Command))) {
      retVal = false;
    }
  });

  return retVal;
}
