import { Message } from 'discord.js';

export type MessageFilter = (message: Message) => boolean;

export function isMessageFilter(maybeFilter: unknown): maybeFilter is MessageFilter {
  // Unfortunately function signature data is lost
  // during runtime. (Sad Face)
  if (typeof maybeFilter !== 'function') {
    return false;
  }

  return true;
}

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
