import { CommandHandler } from '../../commands';
import { VotingState } from '../state';
import { Vote } from '../commands';
import { FromStateAction, NewState, NullAction, Send } from '../../actions';
import { BasicMessage } from '../../messages';

export const VoteHandler = () => CommandHandler.build.state(VotingState).command(Vote).sync((state, command) => {
  const { entry, user } = command
  if (entry < 1 || state.submissions.length < entry) {
    return Send(user, new BasicMessage(`You must vote between 1 and ${state.submissions.length}`))
  }

  if (!state.submissions.some(x => x.user === user)) {
    return Send(user, new BasicMessage(`You must have submitted an entry in order to vote`))
  }

  const submission = state.submissions[entry - 1]
  if (!submission) {
    return
  }
  if (!state.context.inTestMode && submission.user === user) {
    return Send(user, new BasicMessage(`You cannot vote for your own entry`))
  }

  return FromStateAction(state.context.guild, s => {
    if (s instanceof VotingState && s.context.sameRound(state.context)) {
      const newState = s.withVote(user, entry)
      return newState.allVotesIn()
        ? newState.finish()
        : NewState(newState)
    } else {
      return NullAction()
    }
  })
})
