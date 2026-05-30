import * as Discord from 'discord.js';
import { CommandFactory } from '../../commands';
import { MessageReceived } from '../../discord-events';
import { Kys } from '../commands/kys';

export const KysFactory = () => CommandFactory.build.event(MessageReceived)
  .process((state, { message }) => {
    if (message.content !== '!kys' || !message.member) {
      return
    }

    if (!(message.channel instanceof Discord.TextChannel)) {
      return
    }

    return Kys(message.member, message.channel)
  })
