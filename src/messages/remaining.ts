import { Duration } from '../duration'

export const secondsRemaining = (remaining: Duration) =>
  `${remaining.seconds} seconds remaining`

export const minutesOrSecondsRemaining = (remaining: Duration) =>
  remaining.isGreaterThan(Duration.minutes(1))
    ? `${remaining.minutes} minutes remaining`
    : secondsRemaining(remaining)
