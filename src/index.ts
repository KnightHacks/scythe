import Client from './client';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars.
dotenv.config();

(async function main() {
  // Create client.
  const client = new Client({intents: ['GUILDS', 'GUILD_MESSAGES']});

  // Load commands in.
  client.registerCommands(path.join(__dirname, 'commands'));

  // Start up client.
  await client.login(process.env.DISCORD_TOKEN);

  console.log('Client is now running.');
})();
