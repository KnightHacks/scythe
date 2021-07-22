const mockCommands: Command[] = [
  {
    name: 'Foo',
    description: 'Foo description',
    async run(interaction) { await interaction.reply('foo'); }
  }
];

/* eslint-disable @typescript-eslint/require-await */
jest.mock('../loadCommands', () => ({
  loadCommands(): Command[] {
    console.log('mocking command loads');
    return mockCommands;
  }
}));

import Client from '../Client';
import { Command } from '../Command';

let client: Client;
beforeAll(() => {
  client = new Client({intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_PRESENCES']});
  client.readyAt = new Date();
  // eslint-disable-next-line @typescript-eslint/require-await
  jest.spyOn(client, 'login').mockImplementation(async (token) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return token!;
  });

  // TODO: Mock Discord.js instead of the function itself.
  jest.spyOn(client, 'pushCommands').mockImplementation(async (_commands) => {
    console.log('Pushing commands');
  });
});

test('Properly Pushes all Commands', async () => {
  client.registerCommands('');
  await client.login('foobar');

  const spy = jest.spyOn(client, 'pushCommands');

  expect(spy).toBeCalled();
});
