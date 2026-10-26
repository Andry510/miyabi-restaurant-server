import { Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TUserDetail } from '@domain/types/entities';
import type { ILocalService } from '../../../domain/interfaces/services';
import type { TLocalUserOutput } from '../../../domain/types/entities';

//Infrastructure
import { ServiceResultMapper } from '@infrastructure/mappers/shared';

@Injectable()
export class LocalService implements ILocalService {
  user(user: TUserDetail): ResultPattern<TLocalUserOutput, ServiceError> {
    return ServiceResultMapper.Ok({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      status: user.status,
      work_area: user.assignment?.work_area ?? null,
      job_position: user.assignment?.job_position ?? null,
    });
  }
}
