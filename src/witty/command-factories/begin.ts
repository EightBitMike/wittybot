import * as Discord from 'discord.js'
import { IdleState } from '../../state/IdleState';
import { parseClampedArg } from '../../util';
import { CommandFactory } from '../../commands';
import { Duration } from '../../duration';
import { Begin } from '../commands';
import { MessageReceived } from '../../discord-events';

export const BeginFactory = () => CommandFactory.build.state(IdleState).event(MessageReceived).process(((state, { message }) => {
  if (message.channel instanceof Discord.TextChannel && /^!witty\b/.test(message.content)) {
    const timeoutSeconds = parseClampedArg(message.content, /\btimeout (\d+)\b/, 10, 120)
    const timeout = timeoutSeconds === null ? state.context.config.defaultSubmitDuration : Duration.seconds(timeoutSeconds)
    const minPlayers = parseClampedArg(message.content, /\bplayers (\d+)\b/, 3, 6) ?? 3
    const race = parseClampedArg(message.content, /\brace (\d+)\b/, 5, 30) ?? 20

    return Begin(message.author, message.channel, timeout, minPlayers, race)
  }
}))
