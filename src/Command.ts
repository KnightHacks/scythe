import {
  ApplicationCommandOptionData,
  CommandInteraction,
  MessageActionRow,
  Snowflake,
} from 'discord.js';
import { UIComponent } from './UI';

export type PermissionHandler = (
  interaction: CommandInteraction
) => boolean | string | Promise<string | boolean>;

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
   * The function that gets executed after the command is invoked.
   * @param args
   * @param args.interaction Interaction object from discord.js
   * @param args.registerUI **Must be called once per message!** Generates a
   * discord.js compatible UI from Dispatch components.
   */
  run({
    interaction,
    registerUI,
  }: {
    interaction: CommandInteraction;
    registerUI: (
      ui: UIComponent | UIComponent[] | UIComponent[][]
    ) => MessageActionRow[];
  }): Promise<void> | void;

  /**
   * The static role permissions for this command.
   */
  allowedRoles?: Snowflake[];

  /**
   * The static user permissions for this commands
   */
  allowedUsers?: Snowflake[];

  /**
   * The {@link PermissionHandler} that handles the permissions for this command.
   */
  readonly permissionHandler?: PermissionHandler;
}

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
