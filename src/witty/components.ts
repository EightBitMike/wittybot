import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

// custom_ids — shared between the button that opens the modal and the modal itself
export const SUBMIT_ID = 'witty:submit'
export const VOTE_ID = 'witty:vote'
export const ANSWER_FIELD = 'answer'
export const ENTRY_FIELD = 'entry'

export const submitButtonRow = () =>
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(SUBMIT_ID)
      .setLabel('Submit answer')
      .setEmoji('✍️')
      .setStyle(ButtonStyle.Primary))

export const voteButtonRow = () =>
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(VOTE_ID)
      .setLabel('Vote')
      .setEmoji('🗳️')
      .setStyle(ButtonStyle.Primary))

export const submitModal = () =>
  new ModalBuilder()
    .setCustomId(SUBMIT_ID)
    .setTitle('Submit your answer')
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(ANSWER_FIELD)
          .setLabel('Your answer')
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(280)
          .setRequired(true)))

export const voteModal = () =>
  new ModalBuilder()
    .setCustomId(VOTE_ID)
    .setTitle('Cast your vote')
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(ENTRY_FIELD)
          .setLabel('Entry number to vote for')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(3)
          .setRequired(true)))
