//Domain
import { TIP_SPLIT_METHOD } from '@domain/enums/shared';
import type {
  TTipAreaCalculation,
  TTipCalculation,
  TTipParticipant,
  TTipRule,
} from '../../types/repositories';

type TTipPerson = Omit<TTipParticipant, 'shift_id'>;

export class TipAggregate {
  private readonly amount_cents: number;
  private readonly rules: TTipRule[];
  private readonly participants: TTipParticipant[];
  private readonly manual: Map<string, Map<string, number>>;

  private constructor(
    amountCents: number,
    rules: TTipRule[],
    participants: TTipParticipant[],
    manual: Map<string, Map<string, number>>,
  ) {
    this.amount_cents = amountCents;
    this.rules = rules;
    this.participants = participants;
    this.manual = manual;
  }

  //Create
  static register = (
    amountCents: number,
    rules: TTipRule[],
    participants: TTipParticipant[],
    manual: Map<string, Map<string, number>>,
  ): TipAggregate => new TipAggregate(amountCents, rules, participants, manual);

  //Get
  get Calculation(): TTipCalculation {
    const people = this.People;

    const rules = this.rules
      .filter((rule) => people.has(rule.work_area.id))
      .sort((a, b) => a.work_area.name.localeCompare(b.work_area.name));

    const areaAmounts = TipAggregate.distribute(
      this.amount_cents,
      rules.map((rule) => rule.percentage_bp),
    );

    const areas = rules.map((rule, index): TTipAreaCalculation =>
      this.area(rule, areaAmounts[index], people.get(rule.work_area.id) ?? []),
    );

    const paidAreas = new Set(rules.map((rule) => rule.work_area.id));

    return {
      areas,
      shift_ids: this.participants
        .filter((participant) => paidAreas.has(participant.work_area_id))
        .map((participant) => participant.shift_id),
    };
  }

  private get People(): Map<string, TTipPerson[]> {
    const byAssignment = new Map<string, TTipPerson>();

    for (const participant of this.participants) {
      const person = byAssignment.get(participant.assignment_id);

      if (person) {
        person.minutes += participant.minutes;
        continue;
      }

      byAssignment.set(participant.assignment_id, {
        assignment_id: participant.assignment_id,
        work_area_id: participant.work_area_id,
        weight_bp: participant.weight_bp,
        minutes: participant.minutes,
        user: participant.user,
      });
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
    persons: TTipPerson[],
  ): TTipAreaCalculation {
    const manual = this.manual.get(rule.work_area.id);
    const method = manual ? TIP_SPLIT_METHOD.MANUAL : rule.method;

    const amounts =
      method === TIP_SPLIT_METHOD.MANUAL
        ? persons.map((person) => manual?.get(person.assignment_id) ?? 0)
        : TipAggregate.distribute(
            amountCents,
            persons.map((person) => TipAggregate.weightOf(method, person)),
          );

    return {
      work_area: rule.work_area,
      percentage_bp: rule.percentage_bp,
      method,
      amount_cents: amountCents,
      allocations: persons.map((person, index) => ({
        assignment_id: person.assignment_id,
        user: person.user,
        minutes: person.minutes,
        weight_bp: person.weight_bp,
        amount_cents: amounts[index],
      })),
    };
  }

  private static weightOf(
    method: TIP_SPLIT_METHOD,
    person: TTipPerson,
  ): number {
    if (method === TIP_SPLIT_METHOD.MINUTES) {
      return person.minutes;
    }

    if (method === TIP_SPLIT_METHOD.POSITION_WEIGHT) {
      return person.minutes * person.weight_bp;
    }

    return 1;
  }

  private static distribute(totalCents: number, weights: number[]): number[] {
    if (weights.length === 0) {
      return [];
    }

    const weightTotal = weights.reduce((total, weight) => total + weight, 0);
    const shares = weightTotal > 0 ? weights : weights.map(() => 1);
    const sharesTotal = weightTotal > 0 ? weightTotal : weights.length;

    const pesos = Math.floor(totalCents / 100);
    const exact = shares.map((share) => (pesos * share) / sharesTotal);
    const result = exact.map((value) => Math.floor(value));

    const order = exact
      .map((value, index) => ({ index, remainder: value - result[index] }))
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
