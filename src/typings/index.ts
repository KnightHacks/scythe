declare module 'dispatch' {
  import discord, { ApplicationCommandData, ApplicationCommandOptionData, CommandInteraction, Interaction } from 'discord.js';

  export class CommandManager {
    readonly client: Client;
    private readonly commandMap;
    constructor(client: Client);
    /**
         * Registers the command for use in the bot.
         * @param command The command to register.
         */
    register(command: Command): Map<string, Command>;
    /**
         * Looks up the command given the command name.
         * @param name The name of the command to lookup
         * @returns The command if found, undefined otherwise.
         */
    lookup(name: string): Command | undefined;
    /**
         * Converts the registered commands to an array of {@link ApplicationCommandData}.
         * @returns An array of commands normalized to {@link ApplicationCommandData}.
         */
    toAppCommands(): ApplicationCommandData[];
  }

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
    options?: ApplicationCommandOptionData[];
    /**
     * The function that gets executed after the command
     * is invoked.
     */
    run(interaction: CommandInteraction): Promise<void> | void;
  }

  export class Client extends discord.Client {
    /**
     * Handles commands for the bot.
     */
    readonly commands: CommandManager;
    private readonly commandDispatch;
    constructor(options: discord.ClientOptions);
    /**
     * Registers the commands to be used by this client.
     * @param dir The directory to load commands from.
     */
    registerCommands(dir: string): Promise<void>;
  }

  /**
    * Represents an object than can handle various {@link Interaction}'s
    */
  export interface Dispatchable {
    dispatch(interaction: Interaction): void;
  }

  export class CommandDispatcher implements Dispatchable {
    private readonly manager;
    constructor(manager: CommandManager);
    dispatch(interaction: CommandInteraction): Promise<void>;
  }
}
