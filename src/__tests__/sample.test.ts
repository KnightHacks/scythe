import { ApplicationCommand, ClientApplication, Collection, GuildResolvable } from 'discord.js';
import Client from '../Client';
import { Command } from '../Command';

const mockCommands: Command[] = [
  {
    name: 'Foo',
    description: 'Foo description',
    async run({ interaction }) { await interaction.reply('foo'); }
  }
];

const mockAppCommands: ApplicationCommand[] = mockCommands.map(mockCommand => {
  return {
    ...mockCommand
  } as unknown as ApplicationCommand;
});

const appCommands = new Collection<`${bigint}`, ApplicationCommand>();

mockAppCommands.forEach((mockCommand, i) => {
  appCommands.set(`${i}` as unknown as `${bigint}`, mockCommand);
});

const altCommands = new Collection<`${bigint}`, ApplicationCommand>();

altCommands.set('1', { name: 'Bar', description: 'Foo description' } as ApplicationCommand);

/* eslint-disable @typescript-eslint/require-await */
jest.mock('../loaders', () => ({
  loadStructures(): Command[] {
    console.log('mocking command loads');
    return mockCommands;
  }
}));


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

  process.env.GUILD_ID = '1234';
});

test('Synchronization diffs properly', async () => {

  client.application = new ClientApplication(client, {});

  // Mock the discord api to return commands we already have.
  jest.spyOn(client.application.commands, 'fetch')
    .mockResolvedValueOnce(altCommands as unknown as Collection<`${bigint}`, ApplicationCommand<{ guild: GuildResolvable }>>);
  
  process.env.GUILD_ID = '1234';

  await client.registerCommands('');
  await client.login();

  const pushSpy = jest.spyOn(client, 'pushCommands');

  jest.spyOn(client, 'isReady').mockReturnValueOnce(true);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  client.emit('ready', client);
  
  expect(pushSpy).toHaveBeenCalledTimes(1);
});

test.skip('Properly Pushes all Commands', async () => {
  await client.registerCommands('');
  await client.login('foobar');

  

  const spy = jest.spyOn(client, 'pushCommands');

  expect(spy).toBeCalled();
});
