export class Duration {
  static readonly MINUTE_MS = 60 * 1000;

  static readonly DAY_MS = 24 * 60 * Duration.MINUTE_MS;

  static minutesBetween = (from: Date, to: Date): number =>
    Math.max(
      0,
      Math.floor((to.getTime() - from.getTime()) / Duration.MINUTE_MS),
    );
}
