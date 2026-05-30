import { CommandFactory } from '../../commands';
import { InteractionReceived } from '../../discord-events';
import { Submit } from '../commands';
import { SubmissionState } from '../state';
import { ANSWER_FIELD, SUBMIT_ID } from '../components';

export const SubmitFactory = () => CommandFactory.build.state(SubmissionState).event(InteractionReceived).process((state, { interaction }) => {
  if (interaction.customId !== SUBMIT_ID || interaction.channelId !== state.context.channel.id) {
    return
  }

  const answer = interaction.fields.getTextInputValue(ANSWER_FIELD).trim()
  if (!answer) {
    return
  }

  return Submit(interaction.user, answer)
})
