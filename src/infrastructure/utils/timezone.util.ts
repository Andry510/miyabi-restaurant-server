import { Duration } from './duration.util';

const offsetMs = (instant: number, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(instant));

  const part = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((item) => item.type === type)?.value);

  const wallClock = Date.UTC(
    part('year'),
    part('month') - 1,
    part('day'),
    part('hour'),
    part('minute'),
    part('second'),
  );

  return wallClock - instant;
};

export class TimeZone {
  static at = (day: string, time: string, timeZone: string): Date => {
    const wallClock = Date.parse(`${day}T${time}:00Z`);
    const firstGuess = wallClock - offsetMs(wallClock, timeZone);

    return new Date(wallClock - offsetMs(firstGuess, timeZone));
  };

  static dayOf = (instant: Date, timeZone: string): string =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(instant);

  static addDays = (day: string, days: number): string =>
    new Date(Date.parse(`${day}T00:00:00Z`) + days * Duration.DAY_MS)
      .toISOString()
      .slice(0, 10);

  static nextDay = (day: string): string => TimeZone.addDays(day, 1);

  static startOfDay = (day: string, timeZone: string): Date =>
    TimeZone.at(day, '00:00', timeZone);

  static startOfNextDay = (day: string, timeZone: string): Date =>
    TimeZone.startOfDay(TimeZone.nextDay(day), timeZone);
}
