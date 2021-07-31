import { MessageButtonOptions } from 'discord.js';

export type LinkButtonOptions = Omit<
  MessageButtonOptions,
  'customId' | 'style' | 'url'
> & {
  url: string;
};

export class DispatchLinkButton {
  constructor(readonly options: LinkButtonOptions) {}

  toDiscordComponent(): MessageButtonOptions {
    // we override style in case the user omitted it
    return {
      ...this.options,
      type: 'BUTTON',
      style: 'LINK',
    };
  }
}
