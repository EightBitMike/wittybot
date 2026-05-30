import { CommandFactory } from '../../commands';
import { InteractionReceived } from '../../discord-events';
import { tryParseInt } from '../../util';
import { Vote } from '../commands';
import { VotingState } from '../state';
import { ENTRY_FIELD, VOTE_ID } from '../components';

export const VoteFactory = () => CommandFactory.build.state(VotingState).event(InteractionReceived).process((state, { interaction }) => {
  if (interaction.customId !== VOTE_ID || interaction.channelId !== state.context.channel.id) {
    return
  }

  const entry = tryParseInt(interaction.fields.getTextInputValue(ENTRY_FIELD).trim())
  if (entry === null) {
    return
  }

  return Vote(interaction.user, entry)
})
