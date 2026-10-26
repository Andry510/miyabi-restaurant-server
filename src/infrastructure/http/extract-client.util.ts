//Domain
import type { TClientInput } from '@domain/types/shared';

//Infrastructure
import { CLIENT_DEVICE_DETECTION_RULE } from '@infrastructure/constants';

export class ExtractClient {
  static ip = (ip: string | undefined): string => {
    if (!ip || ip === '::1') {
      return '127.0.0.1';
    }

    return ip.replace(/^::ffff:/, '');
  };

  static browser = (userAgent: string | undefined): string =>
    userAgent?.trim() || 'unknown';

  static device = (userAgent: string | undefined): string => {
    const agent = ExtractClient.browser(userAgent).toLowerCase();

    const matched = CLIENT_DEVICE_DETECTION_RULE.find(({ patterns }) =>
      Array.isArray(patterns)
        ? patterns.some((pattern) => agent.includes(pattern))
        : agent.includes(patterns),
    );

    return matched ? matched.device_type : 'Unknown Device';
  };

  static client = (
    ip: string | undefined,
    userAgent: string | undefined,
  ): TClientInput => ({
    requester_ip: ExtractClient.ip(ip),
    browser: ExtractClient.browser(userAgent),
    device: ExtractClient.device(userAgent),
  });
}
