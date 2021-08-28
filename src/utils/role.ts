import { Guild, Snowflake } from 'discord.js';

export function resolveRoleID(
  guild: Guild,
  roleName: string
): Snowflake | null {
  const retVal = guild.roles.cache.find((role) => role.name === roleName);

  if (!retVal) {
    console.log(new Error(`Could not resolve role '${roleName} to an ID.'`));
  }

  return retVal?.id ?? null;
}
