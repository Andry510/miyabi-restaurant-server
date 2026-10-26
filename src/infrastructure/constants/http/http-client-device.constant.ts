//Infrastructure
import type { TClientDevice } from '../../http/http-client-device.type';

export const CLIENT_DEVICE_DETECTION_RULE: TClientDevice[] = [
  { patterns: 'postman', device_type: 'API Client' },
  { patterns: 'insomnia', device_type: 'API Client' },
  { patterns: 'iphone', device_type: 'iPhone' },
  { patterns: 'ipad', device_type: 'iPad' },
  { patterns: 'windows phone', device_type: 'Windows Phone' },
  { patterns: 'android', device_type: 'Android' },
  { patterns: 'tablet', device_type: 'Tablet' },
  { patterns: 'windows', device_type: 'Desktop (Windows)' },
  { patterns: ['macintosh', 'mac os x'], device_type: 'Desktop (Mac)' },
  { patterns: 'linux', device_type: 'Desktop (Linux)' },
];
