import { Case } from "./case";
import * as Discord from 'discord.js';
import { Message } from "./messages";

export const MessageReceived = Case('discord-message', (message: Discord.Message) => ({ message }))
export const ReactionAdded = Case('discord-reaction-add', (reaction: Discord.MessageReaction | Discord.PartialMessageReaction, user: Discord.User, message: Message) => ({ reaction, user, message }))
export const ReactionRemoved = Case('discord-reaction-remove', (reaction: Discord.MessageReaction | Discord.PartialMessageReaction, user: Discord.User, message: Message) => ({ reaction, user, message }))
export const InteractionReceived = Case('discord-interaction', (interaction: Discord.ModalSubmitInteraction) => ({ interaction }))

export type DiscordEvent =
  | ReturnType<typeof MessageReceived>
  | ReturnType<typeof ReactionAdded>
  | ReturnType<typeof ReactionRemoved>
  | ReturnType<typeof InteractionReceived>