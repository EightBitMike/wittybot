import * as Discord from 'discord.js'
import { Case } from '../../case'

export const Submit = Case('witty-submit', (user: Discord.User, submission: string) => ({ user, submission }))
