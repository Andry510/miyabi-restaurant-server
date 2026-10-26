import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { safeParse } from 'valibot';

//Domain
import type { TValibotPipe } from '@domain/types/config';
import type { TClass } from '@domain/types/shared';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import {
  HttpErrorMapper,
  ServiceResultMapper,
} from '@infrastructure/mappers/shared';

@Injectable()
export class HttpValibotPipe implements PipeTransform {
  private readonly logger = new Logger(HttpValibotPipe.name);

  transform(value: unknown, { metatype }: ArgumentMetadata): unknown {
    if (!metatype || !this.isValid(metatype) || !this.isSchema(metatype)) {
      return value;
    }

    const result = safeParse(metatype.schema, value);

    if (result.issues) {
      this.logger.error(result.issues);
      const { Error: error } = ServiceResultMapper.BadRequest();
      throw new BadRequestException(HttpErrorMapper.toBody(error));
    }

    return result.output;
  }

  private isValid(metatype: TClass): boolean {
    const types: TClass[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype) && 'schema' in metatype;
  }

  private isSchema(target: unknown): target is TValibotPipe {
    return (
      typeof target === 'function' &&
      'schema' in target &&
      typeof target.schema === 'object'
    );
  }
}
