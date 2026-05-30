import * as Discord from 'discord.js'
import { Case } from '../../case'

export const Vote = Case('witty-vote', (user: Discord.User, entry: number) => ({ user, entry }))
