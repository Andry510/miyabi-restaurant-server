import { VersioningType } from '@nestjs/common';
import type { VersioningOptions } from '@nestjs/common/interfaces';

export const VersionConfig: VersioningOptions = Object.freeze({
  type: VersioningType.URI,
  defaultVersion: '1',
});
