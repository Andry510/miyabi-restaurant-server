import { arch, networkInterfaces, platform } from 'os';

const EMPTY_MAC = '00:00:00:00:00:00';

export class Machine {
  static platform = (): string => `${platform()}-${arch()}`;

  static macAddress = (): string | null => {
    const address = Object.values(networkInterfaces())
      .flat()
      .find(
        (item) =>
          item &&
          !item.internal &&
          item.family === 'IPv4' &&
          item.mac !== EMPTY_MAC,
      );

    return address?.mac ?? null;
  };
}
