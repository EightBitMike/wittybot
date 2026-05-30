import * as Discord from 'discord.js'
import { Observable } from 'rxjs';
import { endWith, map, scan, takeWhile } from 'rxjs/operators'

import { Prompt } from '../prompts';
import { SubmissionState } from '../state';
import { AnyGameState } from '../../state';
import { Duration } from '../../duration';
import { WittyRoundContext } from '../context';
import { EmbedContent, MessageContent, setFooter, StateStreamMessage } from '../../messages/Message';
import { pulse } from '../../util';
import { submitButtonRow } from '../components';

export class NewRoundMessage implements StateStreamMessage {
  readonly type = 'state-stream'

  readonly components = [submitButtonRow()]

  constructor(
    readonly context: WittyRoundContext,
    readonly prompt: Prompt,
    readonly submitDuration: Duration,
  ) { }

  get content(): EmbedContent {
    const msg = new Discord.EmbedBuilder()
      .setTitle(this.prompt.formatted)
      .setDescription(`Click **Submit answer** below and type your response.`)
      .setFooter({ text: this.footer(this.submitDuration) })

    if (this.prompt.type === 'caption') {
      return {
        content: '',
        embed: msg,
        files: [this.prompt.prompt]
      }
    }
    
    return msg
  }

  footer = (remaining: Duration) =>
    `You have ${remaining.seconds} seconds to come up with an answer`

  content$ = (stateStream: Observable<AnyGameState>): Observable<MessageContent> =>
    pulse(stateStream, Duration.seconds(5))
      .pipe(
        takeWhile(s => s instanceof SubmissionState && s.context.sameRound(this.context) && s.remaining().isGreaterThan(0)),
        map(s => s as SubmissionState),
        map(s => setFooter(this.footer(s.remaining()))),
        endWith(setFooter(`Time's up!`)),
        scan((content, update) => update(content), this.content)
      )
}