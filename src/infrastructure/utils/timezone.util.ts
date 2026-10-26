const DAY_MS = 24 * 60 * 60 * 1000;

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
  static startOfDay = (day: string, timeZone: string): Date => {
    const midnight = Date.parse(`${day}T00:00:00Z`);
    const firstGuess = midnight - offsetMs(midnight, timeZone);

    return new Date(midnight - offsetMs(firstGuess, timeZone));
  };

  static startOfNextDay = (day: string, timeZone: string): Date => {
    const next = new Date(Date.parse(`${day}T00:00:00Z`) + DAY_MS)
      .toISOString()
      .slice(0, 10);

    return TimeZone.startOfDay(next, timeZone);
  };
}
