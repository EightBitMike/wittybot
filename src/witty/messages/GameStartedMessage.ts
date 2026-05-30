import * as Discord from 'discord.js';
import { concat, Observable } from 'rxjs';
import { map, scan, skipWhile, take, takeWhile } from 'rxjs/operators';
import { Duration } from '../../duration';
import { EmbedContent, Emojis, mention, MessageContent, setDescription, setFooter, StateStreamMessage } from '../../messages';
import { minutesOrSecondsRemaining } from '../../messages/remaining';
import { AnyGameState } from '../../state';
import { IdleState } from '../../state/IdleState';
import { chain, isType, pulse } from '../../util';
import { WittyGameContext } from '../context';
import { StartingState, StartingStateDelay } from '../state';

export class GameStartedMessage implements StateStreamMessage {
  readonly type = 'state-stream'
  constructor(readonly context: WittyGameContext) { }

  readonly inReact = Emojis.rofl

  readonly reactable = {
    reacts: [this.inReact]
  }

  get startedBy() { return this.context.initiator }

  get content(): EmbedContent {
    return new Discord.EmbedBuilder()
      .setTitle(`:person_running: It's a race to ${this.context.race}`)
      .setDescription((this.description([this.startedBy])).join('\n'))
      .setFooter({ text: this.footer(StartingStateDelay) })
  }

  description = (interested: Discord.User[]) => [
    `A new game was started by ${mention(this.startedBy)}; type \`!in\` or react with ${this.inReact} to register interest. The game will begin after ${Math.max(this.context.minPlayers, 5)} people are interested, or after three minutes (whichever comes first)`,
    ``,
    `In:`,
    ...interested.map(x => `• ${mention(x)}`)
  ]

  footer = minutesOrSecondsRemaining

  content$ = (stateStream$: Observable<AnyGameState>): Observable<MessageContent> => {
    const startingState$ = pulse(stateStream$, Duration.seconds(5))
      .pipe(
        takeWhile(isType(StartingState)),
        map(s => chain(
          setFooter(this.footer(s.remaining())),
          setDescription(this.description(s.interested))
        )))

    const subsequentState$ = stateStream$
      .pipe(
        skipWhile(isType(StartingState)),
        take(1),
        map(s => setFooter(s instanceof IdleState ? 'The game has been cancelled' : 'The game has begun!'))
      )
 
    return concat(startingState$, subsequentState$)
      .pipe(scan((content, update) => update(content), this.content))
  }
}