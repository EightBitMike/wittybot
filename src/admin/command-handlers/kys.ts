import { CommandHandler } from '../../commands';
import { Kys } from '../commands/kys';
import { CompositeAction, Send, NewState } from '../../actions';
import { BasicMessage } from '../../messages';
import { IdleState } from '../../state/IdleState';

export const KysHandler = () => CommandHandler.build.command(Kys).sync((state, { member, channel }) =>
  state instanceof IdleState
  ? Send(channel, new BasicMessage(`There's no game running.`))
  : CompositeAction(
    Send(channel, new BasicMessage(`:skull: Game ended by ${member.displayName}.`)),
    NewState(new IdleState(state.context))
  )
)
