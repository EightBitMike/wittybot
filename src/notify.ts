import * as Discord from 'discord.js';

export const makeNotify = (notifyRoleName: string) => {
  const getNotifyRole = async (guild: Discord.Guild) => {
    const role = guild.roles.cache.find(r => r.name === notifyRoleName)
    if (role) {
      return role
    }

    try {
      return await guild.roles.create({
        data: {
          name: notifyRoleName,
          mentionable: true
        },
        reason: `Notification role for ${notifyRoleName}`
      })
    } catch {
      return undefined
    }
  }

  return { notifyRoleName, getNotifyRole }
}
