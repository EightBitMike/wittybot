import * as Discord from 'discord.js'
import { GatewayIntentBits, Partials, ActivityType, BaseGuildTextChannel } from 'discord.js'
import { Engine } from './engine';
import { Send } from './actions';
import { BasicMessage } from './messages';
import { log } from './log';
import { GlobalContext } from './context';
import { Duration } from './duration';
import { IdleState } from './state';

log('loading')

const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User],
})

client.once('clientReady', () => {
  client.user?.setPresence({
    activities: [{
      type: ActivityType.Playing,
      name: '!help'
    }]
  })

  const testMode = process.env.TEST_MODE === "true"

  log('ready', { testMode })

  const engine = new Engine(new GlobalContext(client, { defaultSubmitDuration: Duration.seconds(80), testMode }))
  engine.run()

  process.on('SIGTERM', () => {
    log.error('sigterm')
    engine.guilds.all.forEach(([_, state]) => {
      if (!(state instanceof IdleState) && state.context.channel instanceof BaseGuildTextChannel) {
        engine.executor.execute(Send(state.context.channel, new BasicMessage(`Sorry! The bot has to shut down, it should be back momentarily but you will have to restart the game`)))
      }
    })
  })

})

client.login(process.env.BOT_TOKEN);
