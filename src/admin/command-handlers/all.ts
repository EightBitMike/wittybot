import { ResetHandler } from './reset'
import { KysHandler } from './kys'

export const AllAdminCommandHandlers = () =>
  ResetHandler()
    .orElse(KysHandler())