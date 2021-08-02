import { Message } from 'discord.js';

export type MessageFilter = (message: Message) => boolean;

export async function runMessageFilters(message: Message, messageFilters: MessageFilter[]): Promise<void> {
  for (const filter of messageFilters) {
    try {
      if (!filter(message)) {
        if (message.deletable) {
          await message.delete();
          return;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
