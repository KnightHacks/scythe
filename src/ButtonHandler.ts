import { ButtonInteraction } from 'discord.js';
import Client from './Client';

export type ButtonHandler = (
  interaction: ButtonInteraction,
  client: Client
) => void | Promise<void>;
