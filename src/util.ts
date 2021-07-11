import { ApplicationCommandData } from 'discord.js';
import Command from './command';

export function normalizeCommand(command: Command): ApplicationCommandData {
  return {
    name: command.name,
    description: command.description,
  };
}
