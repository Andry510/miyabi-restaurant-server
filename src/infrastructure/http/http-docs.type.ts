import type { HttpStatus } from '@nestjs/common';
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import type { GenericSchema } from 'valibot';

//Domain
import type { TApiMessage } from '@domain/types/shared';

export type THttpDocsSchema = { schema: GenericSchema };

export type THttpDocsParameter = {
  name: string;
  required: boolean;
  schema: SchemaObject;
};

export type THttpDocsData =
  'none' | 'object' | 'array' | 'string' | 'pagination' | 'file';

export type THttpDocsAccess = 'employee' | 'manager';

export type THttpDocsError = {
  status: HttpStatus;
  message: TApiMessage;
};

export type THttpDocs = {
  summary: string;
  description?: string;
  access?: THttpDocsAccess;
  bearer?: boolean;
  cloud?: boolean;
  unpaired?: boolean;
  params?: THttpDocsSchema;
  query?: THttpDocsSchema;
  body?: THttpDocsSchema;
  picture?: boolean;
  status?: HttpStatus.OK | HttpStatus.CREATED;
  success: TApiMessage | readonly TApiMessage[];
  data?: THttpDocsData;
  errors?: readonly THttpDocsError[];
};
