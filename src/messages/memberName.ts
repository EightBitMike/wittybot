import * as Discord from 'discord.js';

export function memberName(guild: Discord.Guild, user: Discord.User) {
  return guild.members.resolve(user)?.displayName ?? user.username
}