//Domain
import {
  TIP_SANCTION_DESTINATION,
  TIP_SPLIT_METHOD,
} from '@domain/enums/shared';
import type {
  TTipAllocationCalculation,
  TTipAreaCalculation,
  TTipCalculation,
  TTipContext,
  TTipPolicy,
  TTipPool,
  TTipRule,
  TTipShift,
} from '../../types/repositories';

const SHIFT_BP = 100;

type TTipPerson = {
  assignment_id: string;
  work_area_id: string;
  weight_bp: number;
  user: TTipShift['user'];
  shifts_bp: number;
  sanction_shifts_bp: number;
  removes_all: boolean;
};

export class TipAggregate {
  private readonly amount_cents: number;
  private readonly rules: TTipRule[];
  private readonly shifts: TTipShift[];
  private readonly policy: TTipPolicy;
  private readonly context: TTipContext;

  private constructor(
    amountCents: number,
    rules: TTipRule[],
    shifts: TTipShift[],
    policy: TTipPolicy,
    context: TTipContext,
  ) {
    this.amount_cents = amountCents;
    this.rules = rules;
    this.shifts = shifts;
    this.policy = policy;
    this.context = context;
  }

  //Create
  static register = (
    amountCents: number,
    rules: TTipRule[],
    shifts: TTipShift[],
    policy: TTipPolicy,
    context: TTipContext,
  ): TipAggregate =>
    new TipAggregate(amountCents, rules, shifts, policy, context);

  static contextOf = (pool: TTipPool): TTipContext => ({
    manual: new Map(
      pool.areas
        .filter((area) => area.method === TIP_SPLIT_METHOD.MANUAL)
        .map((area) => [
          area.work_area.id,
          new Map(
            area.allocations.map((allocation) => [
              allocation.assignment_id,
              allocation.amount_cents,
            ]),
          ),
        ]),
    ),
    disabled: new Set(
      pool.areas
        .filter((area) => !area.enabled)
        .map((area) => area.work_area.id),
    ),
    sanctions: pool.sanctions,
  });

  //Get
  get Calculation(): TTipCalculation {
    const people = this.People;
    const ruled = new Set(this.rules.map((rule) => rule.work_area.id));

    const rules = this.rules
      .filter((rule) => people.has(rule.work_area.id))
      .sort((a, b) => a.work_area.name.localeCompare(b.work_area.name));

    const paid = rules.filter(
      (rule) =>
        !this.context.disabled.has(rule.work_area.id) &&
        (people.get(rule.work_area.id) ?? []).some(
          (person) => person.shifts_bp > 0,
        ),
    );

    const paidAmounts = new Map(
      TipAggregate.distribute(
        this.amount_cents,
        paid.map((rule) => rule.percentage_bp),
      ).map((amount, index) => [paid[index].work_area.id, amount]),
    );

    const areas = rules.map((rule) =>
      this.area(
        rule,
        paidAmounts.get(rule.work_area.id) ?? 0,
        paidAmounts.has(rule.work_area.id),
        people.get(rule.work_area.id) ?? [],
      ),
    );

    let sanctionCents = areas
      .filter((area) => area.method !== TIP_SPLIT_METHOD.MANUAL)
      .reduce(
        (total, area) =>
          total +
          area.amount_cents -
          area.allocations.reduce((sum, item) => sum + item.amount_cents, 0),
        0,
      );

    if (
      this.policy.destination === TIP_SANCTION_DESTINATION.ALL &&
      sanctionCents > 0
    ) {
      sanctionCents = TipAggregate.spread(sanctionCents, areas);
    }

    return {
      destination: this.policy.destination,
      sanction_cents: sanctionCents,
      areas,
      shift_ids: this.shifts
        .filter((shift) => ruled.has(shift.work_area_id))
        .map((shift) => shift.shift_id),
    };
  }

  private get People(): Map<string, TTipPerson[]> {
    const byAssignment = new Map<string, TTipPerson>();

    for (const shift of this.shifts) {
      const person = byAssignment.get(shift.assignment_id) ?? {
        assignment_id: shift.assignment_id,
        work_area_id: shift.work_area_id,
        weight_bp: shift.weight_bp,
        user: shift.user,
        shifts_bp: 0,
        sanction_shifts_bp: 0,
        removes_all: false,
      };

      if (shift.completed && !shift.left_early) {
        person.shifts_bp += SHIFT_BP;
      }

      if (shift.completed && shift.late) {
        person.sanction_shifts_bp += this.policy.late_arrival_shifts_bp;
      }

      if (shift.absent) {
        person.sanction_shifts_bp += this.policy.absence_shifts_bp;
      }

      byAssignment.set(shift.assignment_id, person);
    }

    for (const sanction of this.context.sanctions) {
      const person = byAssignment.get(sanction.assignment_id);

      if (person) {
        person.sanction_shifts_bp += sanction.shifts_bp;
        person.removes_all ||= sanction.removes_all;
      }
    }

    const byArea = new Map<string, TTipPerson[]>();

    for (const person of byAssignment.values()) {
      byArea.set(person.work_area_id, [
        ...(byArea.get(person.work_area_id) ?? []),
        person,
      ]);
    }

    for (const persons of byArea.values()) {
      persons.sort(
        (a, b) =>
          a.user.last_name.localeCompare(b.user.last_name) ||
          a.user.first_name.localeCompare(b.user.first_name) ||
          a.assignment_id.localeCompare(b.assignment_id),
      );
    }

    return byArea;
  }

  //Functions
  private area(
    rule: TTipRule,
    amountCents: number,
    enabled: boolean,
    persons: TTipPerson[],
  ): TTipAreaCalculation {
    const manual = this.context.manual.get(rule.work_area.id);
    const method = manual ? TIP_SPLIT_METHOD.MANUAL : rule.method;

    const allocations = persons.map((person): TTipAllocationCalculation => ({
      assignment_id: person.assignment_id,
      user: person.user,
      shifts_bp: person.shifts_bp,
      sanction_shifts_bp: person.sanction_shifts_bp,
      weight_bp: person.weight_bp,
      amount_cents: 0,
      sanction_cents: 0,
    }));

    if (enabled && manual) {
      for (const allocation of allocations) {
        allocation.amount_cents = manual.get(allocation.assignment_id) ?? 0;
      }
    }

    if (enabled && !manual) {
      this.split(amountCents, persons, allocations);
    }

    return {
      work_area: rule.work_area,
      percentage_bp: rule.percentage_bp,
      method,
      enabled: !this.context.disabled.has(rule.work_area.id),
      amount_cents: amountCents,
      allocations,
    };
  }

  private split(
    amountCents: number,
    persons: TTipPerson[],
    allocations: TTipAllocationCalculation[],
  ): void {
    const finals = persons.map((person) =>
      person.removes_all
        ? 0
        : Math.max(0, person.shifts_bp - person.sanction_shifts_bp),
    );

    const fair = TipAggregate.distribute(
      amountCents,
      persons.map((person) => person.shifts_bp * person.weight_bp),
    );

    const kept =
      this.policy.destination === TIP_SANCTION_DESTINATION.AREA
        ? TipAggregate.distribute(
            amountCents,
            persons.map((person, index) => finals[index] * person.weight_bp),
          )
        : persons.map((person, index) =>
            finals[index] === person.shifts_bp
              ? fair[index]
              : Math.floor(
                  (fair[index] * finals[index]) / person.shifts_bp / 100,
                ) * 100,
          );

    allocations.forEach((allocation, index) => {
      allocation.amount_cents = kept[index];
      allocation.sanction_cents = Math.max(0, fair[index] - kept[index]);
    });
  }

  private static spread(
    fundCents: number,
    areas: TTipAreaCalculation[],
  ): number {
    const receivers = areas
      .filter((area) => area.method !== TIP_SPLIT_METHOD.MANUAL)
      .flatMap((area) => area.allocations)
      .filter((allocation) => allocation.amount_cents > 0);

    if (receivers.length === 0) {
      return fundCents;
    }

    const extra = TipAggregate.distribute(
      fundCents,
      receivers.map((allocation) => allocation.amount_cents),
    );

    receivers.forEach((allocation, index) => {
      allocation.amount_cents += extra[index];
    });

    return 0;
  }

  private static distribute(totalCents: number, weights: number[]): number[] {
    const weightTotal = weights.reduce((total, weight) => total + weight, 0);

    if (weights.length === 0 || weightTotal <= 0) {
      return weights.map(() => 0);
    }

    const pesos = Math.floor(totalCents / 100);
    const exact = weights.map((weight) => (pesos * weight) / weightTotal);
    const result = exact.map((value) => Math.floor(value));

    const order = exact
      .map((value, index) => ({ index, remainder: value - result[index] }))
      .filter(({ index }) => weights[index] > 0)
      .sort((a, b) => b.remainder - a.remainder || a.index - b.index);

    const left = pesos - result.reduce((total, value) => total + value, 0);

    for (const { index } of order.slice(0, left)) {
      result[index] += 1;
    }

    const cents = result.map((value) => value * 100);
    cents[order[left % order.length].index] += totalCents % 100;

    return cents;
  }
}
