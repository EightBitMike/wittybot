import { CommandHandler } from '../../commands';
import { SubmissionState } from '../state';
import { Submit } from '../commands';
import { CompositeAction, OptionalAction, Send, UpdateState } from '../../actions';
import { BasicMessage, mention } from '../../messages';

export const SubmitHandler = () => CommandHandler.build.state(SubmissionState).command(Submit).sync((state, command) => {
  const isReplacement = state.submissions.has(command.user)

  return CompositeAction(
    OptionalAction(!isReplacement && Send(state.context.channel, new BasicMessage(`Submission received from ${mention(command.user)}`))),
    UpdateState(state.context.guild, s => s instanceof SubmissionState && s.context.sameRound(state.context) ? s.withSubmission(command.user, command.submission) : s))
})
