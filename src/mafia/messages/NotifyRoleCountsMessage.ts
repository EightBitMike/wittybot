import * as Discord from 'discord.js';
import { mention } from "../../messages";
import { StaticMessage } from '../../messages/Message';
import { shuffle } from "../../random";
import { Players } from "../model/Players";
import { Role } from "../model/Role";
import { roleText } from "./text";

export class NotifyRoleCountsMessage implements StaticMessage {
  readonly type = 'static'

  constructor(readonly players: Players) { }

  get content() {
    const playerNames = shuffle(this.players.alive())
      .map(x => mention(x.user))

    const roles = this.players.aliveRoleCounts()
      .map(([role, count]) => `${roleText(role).emoji} ${count} ${pluralise(role, count)}`)

    return new Discord.EmbedBuilder()
      .setTitle(`There are ${this.players.alive().length} players left alive`)
      .addFields({ name: 'Roles', value: roles.join('\n'), inline: true })
      .addFields({ name: 'Players', value: playerNames.join('\n'), inline: true })
  }
}

function pluralise(role: Role, count: number) {
  return count === 1 ? roleText(role).name : roleText(role).name + 's'
}