import * as Discord from 'discord.js';
import { CommandFactory } from '../../commands';
import { MessageReceived } from '../../discord-events';
import { Duration } from '../../duration';
import { IdleState } from '../../state/IdleState';
import { parseClampedArg } from '../../util';
import { Begin } from '../commands';
import { MafiaSettings } from '../context';

export const BeginFactory = () => CommandFactory.build.state(IdleState).event(MessageReceived).process(((_, { message }) => {
  if (message.channel instanceof Discord.TextChannel && /^!mafia\b/.test(message.content)) {
    const member = message.guild?.members.resolve(message.author)
    if (!member) {
      return
    }

    const minPlayers = parseClampedArg(message.content, /\bplayers (\d+)\b/, 2, 10) ?? 5

    const settings: MafiaSettings = {
      nightDuration: Duration.seconds(60),
      dayDuration: Duration.seconds(60),
      reveals: (/\breveals (on|off)\b/.exec(message.content)?.[1] ?? "on") === "on",
      minPlayers
    }

    return Begin(member, message.channel, settings)
  }
}))
