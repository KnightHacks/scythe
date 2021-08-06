import { Message } from 'discord.js';

export type MessageFilter = (message: Message) => boolean | Promise<boolean>;

export async function runMessageFilters(message: Message, messageFilters: MessageFilter[]): Promise<void> {
  for (const filter of messageFilters) {
    try {
      const filterResult = await filter(message);
      if (!filterResult) {
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
