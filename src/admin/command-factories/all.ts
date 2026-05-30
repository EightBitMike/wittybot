import { ResetFactory } from './reset'
import { KysFactory } from './kys'

export const AllAdminCommandFactories = () =>
  ResetFactory()
    .combine(KysFactory())