import { findConflicts, parseSlot, type Schedulable } from './schedule';

export type Candidate = Schedulable & { credits: number; vacancies: number };

export type PlanOptions = {
  enrolledCredits: number;
  maxCredits: number;
  target: number; // meta de créditos totais no período
  freeDays: string[]; // dias que o aluno quer deixar livres
  limit?: number;
};

export type Plan<T extends Candidate> = {
  items: T[];
  credits: number; // total no período (já matriculados + novos)
  days: string[];
  minVacancies: number;
};

// Testa todas as combinações possíveis de disciplinas (poucas, então é instantâneo),
// descarta as inválidas (conflito, limite de créditos, dia que deve ficar livre)
// e ordena: mais perto da meta > mais vagas > menos dias na faculdade.
export function suggestPlans<T extends Candidate>(
  available: T[],
  enrolled: Schedulable[],
  opts: PlanOptions
): Plan<T>[] {
  const n = Math.min(available.length, 16);
  const plans: Plan<T>[] = [];

  for (let mask = 1; mask < 1 << n; mask++) {
    const items = available.slice(0, n).filter((_, i) => mask & (1 << i));
    const credits = opts.enrolledCredits + items.reduce((sum, s) => sum + s.credits, 0);
    if (credits > opts.maxCredits) continue;

    const days = [...new Set(items.map((s) => parseSlot(s.schedule)?.day).filter(Boolean) as string[])];
    if (days.some((d) => opts.freeDays.includes(d))) continue;
    if (findConflicts(items, enrolled).length > 0) continue;

    plans.push({ items, credits, days, minVacancies: Math.min(...items.map((s) => s.vacancies)) });
  }

  plans.sort(
    (a, b) =>
      Math.abs(a.credits - opts.target) - Math.abs(b.credits - opts.target) ||
      b.minVacancies - a.minVacancies ||
      a.days.length - b.days.length
  );
  return plans.slice(0, opts.limit ?? 3);
}
