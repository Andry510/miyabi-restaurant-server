//Domain
import {
  CorrectAttendanceBodySchema,
  JustifyBodySchema,
} from '../../../domain/schemas';

export class CorrectAttendanceBodyDto {
  static schema = CorrectAttendanceBodySchema;
}

export class JustifyBodyDto {
  static schema = JustifyBodySchema;
}
