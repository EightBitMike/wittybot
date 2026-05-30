import { Case } from "../../case";
import * as Discord from 'discord.js';

export const Kys = Case('admin-kys', (member: Discord.GuildMember, channel: Discord.TextChannel) => ({ member, channel }))
