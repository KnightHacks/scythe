import {
  ApplicationCommandData,
  ChatInputApplicationCommandData,
  CommandInteraction,
  ContextMenuCommandInteraction,
  MessageApplicationCommandData,
  MessageContextMenuCommandInteraction,
  Snowflake,
  UserApplicationCommandData,
  UserContextMenuCommandInteraction,
} from 'discord.js';
import { MessageFilter } from './messageFilters';

export type CommandRunner<T extends CommandInteraction> = ({
  interaction,
  registerMessageFilters,
}: {
  interaction: T;
  registerMessageFilters: (filters: MessageFilter[]) => void;
}) => Promise<void> | void;

export type PermissionHandler = (
  interaction: CommandInteraction
) => boolean | string | Promise<string | boolean>;

export type CommandBase<T extends CommandInteraction> =
  ApplicationCommandData & {
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

    /**
     * The number of seconds that must pass after each invocation of the command.
     */
    readonly cooldown?: number;

    /**
     * The function that gets executed after the command is invoked.
     * @param args
     * @param args.interaction Interaction object from discord.js
     * @param args.registerUI **Must be called at most once per message!**
     * Generates a discord.js compatible UI from Dispatch components.
     * @param args.registerMessageFilters Registers a callback that receives all
     * messages and deletes a message if the callback returns false
     */
    run: CommandRunner<T>;
  };

export type UserContextMenuCommand = CommandBase<
  UserContextMenuCommandInteraction<'cached'>
> &
  UserApplicationCommandData;

export type MessageContextMenuCommand = CommandBase<
  MessageContextMenuCommandInteraction<'cached'>
> &
  MessageApplicationCommandData;

export type ContextMenuCommand =
  | UserContextMenuCommand
  | MessageContextMenuCommand;

export type SlashCommand = CommandBase<CommandInteraction<'cached'>> &
  ChatInputApplicationCommandData;

export type Command = ContextMenuCommand | SlashCommand;

// This type is only for type erasure in dispatch.ts
export type RawCommand = CommandBase<
  ContextMenuCommandInteraction | CommandInteraction
> &
  Command;

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
