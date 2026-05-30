import * as Discord from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { Observable } from 'rxjs';
import { Stream } from 'stream';
import { GuildContext } from '../context';
import { AnyGameState } from '../state';

export type Destination = Discord.TextChannel | Discord.User

export type Files = (Discord.AttachmentBuilder | Discord.BufferResolvable | Stream | Discord.AttachmentPayload)[]
export type EmbedContent =
| EmbedBuilder
| { content: string, embed: EmbedBuilder, files?: Files }
export type MessageContent = string | EmbedContent

type Common = {
  readonly reactable?: {
    reacts: Discord.EmojiResolvable[]
  }
  readonly components?: Discord.BaseMessageOptions['components']
}

export type StaticMessage = Common & {
  type: 'static'
  context?: GuildContext
  content: MessageContent
}

export type StateStreamMessage = Common & {
  type: 'state-stream'
  context: GuildContext
  content$: (stateStream: Observable<AnyGameState>) => Observable<MessageContent>
}

export type Message =
| StaticMessage
| StateStreamMessage

const update = (f: (embed: EmbedBuilder) => EmbedBuilder) => (content: EmbedContent) =>
  content instanceof EmbedBuilder ? f(content) : { ...content, embed: f(content.embed) }

export const setFooter = (footer: string) =>
  update((embed: EmbedBuilder) => embed.setFooter({ text: footer }))
export const setDescription = (description: string | string[]) =>
  update((embed: EmbedBuilder) => embed.setDescription(Array.isArray(description) ? description.join('\n') : description))