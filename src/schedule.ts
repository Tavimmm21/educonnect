export type Slot = { day: string; start: number; end: number };

// Converte "Seg • 19:00 – 21:00" em { day: 'Seg', start: 1140, end: 1260 } (minutos).
export function parseSlot(schedule: string): Slot | null {
  const m = schedule.match(/^(\S+)\s•\s(\d{2}):(\d{2})\s–\s(\d{2}):(\d{2})$/);
  if (!m) return null;
  return { day: m[1], start: +m[2] * 60 + +m[3], end: +m[4] * 60 + +m[5] };
}

export function overlaps(a: string, b: string): boolean {
  const x = parseSlot(a);
  const y = parseSlot(b);
  if (!x || !y || x.day !== y.day) return false;
  return x.start < y.end && y.start < x.end;
}

export type Schedulable = { name: string; code: string; schedule: string };

export type Conflict = { code: string; other: Schedulable; withEnrolled: boolean };

// Devolve, para cada disciplina escolhida, as disciplinas com horário sobreposto
// (outras escolhidas ou já matriculadas).
export function findConflicts(selected: Schedulable[], enrolled: Schedulable[]): Conflict[] {
  const result: Conflict[] = [];
  selected.forEach((s, i) => {
    enrolled.forEach((e) => {
      if (overlaps(s.schedule, e.schedule)) result.push({ code: s.code, other: e, withEnrolled: true });
    });
    selected.slice(i + 1).forEach((o) => {
      if (overlaps(s.schedule, o.schedule)) {
        result.push({ code: s.code, other: o, withEnrolled: false });
        result.push({ code: o.code, other: s, withEnrolled: false });
      }
    });
  });
  return result;
}
