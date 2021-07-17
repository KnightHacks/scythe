import { ButtonInteraction } from 'discord.js';

export type ButtonHandler = (interaction: ButtonInteraction) => void | Promise<void>;
