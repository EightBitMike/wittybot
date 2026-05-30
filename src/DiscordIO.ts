import * as Discord from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import * as O from 'rxjs';
import { Observable, Subject } from 'rxjs';
import { concatMap, filter, map, mergeMap, multicast } from 'rxjs/operators';
import { DiscordEvent, InteractionReceived, MessageReceived, ReactionAdded, ReactionRemoved } from './discord-events';
import { SUBMIT_ID, VOTE_ID, submitModal, voteModal } from './witty/components';
import { GuildStates } from './GuildStates';
import { log, loggableError } from './log';
import { Destination, Message } from "./messages";
import { MessageContent } from './messages/Message';
import { invoke } from './util';

type SentMessage = {
  sent: Discord.Message
  source: Message
}

export class DiscordIO {

  readonly eventStream: Observable<DiscordEvent>;
  private readonly sentMessages = new Subject<SentMessage>()

  constructor(readonly guilds: GuildStates, readonly client: Discord.Client) {
    const messageStream =
      O.fromEvent<Discord.Message>(client, 'messageCreate')
        .pipe(
          filter(m => m.author !== client.user && !m.author.bot),
          map(MessageReceived))

    const connectable$ = O.merge(
      discordEventObs(client, 'messageReactionAdd')
        .pipe(map(([reaction, user]) => [reaction, user, ReactionAdded] as const)),
      discordEventObs(client, 'messageReactionRemove')
        .pipe(map(([reaction, user]) => [reaction, user, ReactionRemoved] as const))
    ).pipe(
      filter(([_, u]) => u !== client.user), // ignore reactions from wittybot!
      multicast(new Subject())
    ) as O.ConnectableObservable<[Discord.MessageReaction | Discord.PartialMessageReaction, Discord.User | Discord.PartialUser, typeof ReactionAdded | typeof ReactionRemoved]>

    connectable$.connect()

    const reactsWithUser$ = connectable$.pipe(
      concatMap(([reaction, user, ctor]) => client.users.fetch(user.id).then(user => [reaction, user, ctor] as const)),
    )

    const reactionEvents$ = this.sentMessages.pipe(
      filter(x => !!x.source.reactable),
      mergeMap(({sent, source}) => reactsWithUser$.pipe(
        filter(([reaction]) => reaction.message.id === sent.id && reaction.emoji.name !== null && source.reactable!.reacts.includes(reaction.emoji.name)),
        map(([reaction, user, ctor]) => ctor(reaction, user, source)))))

    connectable$.subscribe(([r, u, t]) => log('react-received', { emoji: r.emoji.name, user: u.username ?? 'partial', type: t.type }))
    connectable$.subscribe(([r, u, t]) => log('react-received-user-fetched', { emoji: r.emoji.name, user: u.username, type: t.type }))

    const interactionEvents$ = new Subject<DiscordEvent>()
    client.on('interactionCreate', async (interaction) => {
      try {
        if (interaction.isButton()) {
          if (interaction.customId === SUBMIT_ID) {
            await interaction.showModal(submitModal())
          } else if (interaction.customId === VOTE_ID) {
            await interaction.showModal(voteModal())
          }
        } else if (interaction.isModalSubmit()) {
          if (interaction.customId === SUBMIT_ID || interaction.customId === VOTE_ID) {
            log('interaction-modal-submit', { customId: interaction.customId, user: interaction.user.username })
            await interaction.reply({ content: '✅ Got it!', flags: Discord.MessageFlags.Ephemeral })
            interactionEvents$.next(InteractionReceived(interaction))
          }
        }
      } catch (err) {
        log.error('interaction', loggableError(err))
      }
    })

    this.eventStream = O.merge(reactionEvents$, messageStream, interactionEvents$)
  }

  send = (destination: Destination, source: Message) => {
    const messageStates$ = source.type === 'static'
      ? O.of(source.content)
      : invoke(() => {
        const guild = source.context.guild
        const stateStream = this.guilds.getStream(guild)
        return source.content$(stateStream)
      })

    const embedColor = '#A4218A'
    const components = source.components
    const toPayload = (content: MessageContent): string | Discord.BaseMessageOptions => {
      if (typeof content === "string") {
        return components ? { content, components } : content
      }
      if (content instanceof EmbedBuilder) {
        return { embeds: [content.setColor(embedColor)], components }
      }
      return { content: content.content, embeds: [content.embed.setColor(embedColor)], files: content.files, components }
    }

    const send = async (content: MessageContent) => {
      const sent = await destination.send(toPayload(content))

      this.sentMessages.next({sent, source})

      if (source.reactable) {
        try {
          for (const r of source.reactable.reacts) {
            await sent.react(r)
          }
        } catch (err) {
          log.error('message:add-reactions', loggableError(err))
        }
      }

      return sent
    }

    let msg: Promise<Discord.Message> | null = null
    messageStates$
      .subscribe(x => {
        if (msg === null) {
          msg = send(x)
        } else {
          msg = msg.then(m => m.edit(toPayload(x)))
        }
      })
  }
}

export function discordEventObs<T, K extends keyof Discord.ClientEvents>(client: Discord.Client, eventName: K): Observable<Discord.ClientEvents[K]> {
  return new Observable<Discord.ClientEvents[K]>(subscribe => {
    const handler = (...args: Discord.ClientEvents[K]) => {
      subscribe.next(args)
    }
    client.on(eventName, handler)
    return () => {
      client.off(eventName, handler)
    }
  })
}
