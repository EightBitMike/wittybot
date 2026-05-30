import { Reset } from './reset'
import { Kys } from './kys'

export type AdminCommand =
| ReturnType<typeof Reset>
| ReturnType<typeof Kys>