import { Message } from 'discord.js';

export interface Inhibition {
  reason: string;
  response?: Promise<Message>;
}

export type Inhibitor = (message: Message) => Inhibition | boolean | string;
