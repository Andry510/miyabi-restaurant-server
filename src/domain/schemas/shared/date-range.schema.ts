import { isoDate, pipe, rawCheck, type RawCheckAction, string } from 'valibot';

import { SCHEMA_MESSAGES } from '@common/messages';

//Infrastructure
import { Duration } from '@infrastructure/utils';

const MAX_DAYS = 92;

type TDateRange = { from: string; to: string };

export const DateRangeQuerySchema = {
  from: pipe(
    string(SCHEMA_MESSAGES.ERROR.DATE_RANGE.FROM_TYPE),
    isoDate(SCHEMA_MESSAGES.ERROR.DATE_RANGE.FROM_DATE),
  ),
  to: pipe(
    string(SCHEMA_MESSAGES.ERROR.DATE_RANGE.TO_TYPE),
    isoDate(SCHEMA_MESSAGES.ERROR.DATE_RANGE.TO_DATE),
  ),
};

export const dateRange = <
  TInput extends TDateRange,
>(): RawCheckAction<TInput> =>
  rawCheck(({ dataset, addIssue }) => {
    if (!dataset.typed) {
      return;
    }

    const { from, to } = dataset.value;

    if (from > to) {
      addIssue({ message: SCHEMA_MESSAGES.ERROR.DATE_RANGE.ORDER });
      return;
    }

    if (Date.parse(to) - Date.parse(from) >= MAX_DAYS * Duration.DAY_MS) {
      addIssue({ message: SCHEMA_MESSAGES.ERROR.DATE_RANGE.MAX });
    }
  });
