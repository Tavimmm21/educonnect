import { subjects } from './data';
import { parseSlot } from './schedule';
import {
  ACTIVITIES, EXAM_LABEL, EXAM_WEEKS, HOLIDAYS, INTEGRATIVE_DATE, MIN_ATTENDANCE,
  REFERENCE_DATE, REGISTERED_ABSENCES, SEMESTER, type Activity, type ExamKind, type ISODate,
} from './calendarData';

// ---------- datas (sempre em UTC para não sofrer com fuso horário) ----------
const DAY_MS = 86400000;
const DAY_NUM: Record<string, number> = { Dom: 0, Seg: 1, Ter: 2, Qua: 3, Qui: 4, Sex: 5, 'Sáb': 6 };
export const WEEKDAY_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const WEEKDAY_LONG = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
export const MONTH_LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export const parseISO = (d: ISODate) => {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, day));
};
export const toISO = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (d: ISODate, n: number): ISODate => toISO(new Date(parseISO(d).getTime() + n * DAY_MS));
export const weekdayOf = (d: ISODate) => parseISO(d).getUTCDay();
export const diffDays = (a: ISODate, b: ISODate) => Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / DAY_MS);
export const fmtShort = (d: ISODate) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
export const fmtWeek = (d: ISODate) => `${WEEKDAY_SHORT[weekdayOf(d)]}, ${fmtShort(d)}`;
export const fmtLong = (d: ISODate) => `${WEEKDAY_LONG[weekdayOf(d)]}, ${+d.slice(8, 10)} de ${MONTH_LONG[+d.slice(5, 7) - 1]}`;
export const pct = (n: number) => `${Math.round(n * 100)}%`;

// ---------- aulas, provas e entregas ----------
export type Session = { date: ISODate; code: string; name: string; time: string };
export type Exam = { date: ISODate; kind: ExamKind; code: string | null; title: string };

function buildSessions(): Session[] {
  const out: Session[] = [];
  for (let d = SEMESTER.start; d <= SEMESTER.end; d = addDays(d, 1)) {
    if (HOLIDAYS[d]) continue;
    const wd = weekdayOf(d);
    for (const s of subjects) {
      const slot = parseSlot(s.schedule);
      if (slot && DAY_NUM[slot.day] === wd) out.push({ date: d, code: s.code, name: s.name, time: s.schedule.split('• ')[1] });
    }
  }
  return out;
}

function buildExams(): Exam[] {
  const out: Exam[] = [];
  (['P1', 'P2'] as const).forEach((kind) => {
    subjects.forEach((s) => {
      const slot = parseSlot(s.schedule);
      if (!slot) return;
      out.push({ date: addDays(EXAM_WEEKS[kind], DAY_NUM[slot.day] - 1), kind, code: s.code, title: `${EXAM_LABEL[kind]} — ${s.name}` });
    });
  });
  out.push({ date: INTEGRATIVE_DATE, kind: 'INT', code: null, title: 'Prova Integrativa (todas as disciplinas)' });
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export const SESSIONS = buildSessions();
export const EXAMS = buildExams();
export const registeredAbsences = new Set(REGISTERED_ABSENCES);
export const absenceKey = (date: ISODate, code: string) => `${date}|${code}`;
export const isPast = (d: ISODate) => d < REFERENCE_DATE;
export const nameOf = (code: string) => subjects.find((s) => s.code === code)?.name ?? code;

export type DayInfo = {
  inSemester: boolean;
  holiday?: string;
  sessions: Session[];
  absent: Session[];
  simulated: Session[];
  exams: Exam[];
  activities: Activity[];
};

export function dayInfo(date: ISODate, sim: Set<string>): DayInfo {
  const sessions = SESSIONS.filter((s) => s.date === date);
  return {
    inSemester: date >= SEMESTER.start && date <= SEMESTER.end,
    holiday: HOLIDAYS[date],
    sessions,
    absent: sessions.filter((s) => isPast(date) && registeredAbsences.has(absenceKey(date, s.code))),
    simulated: sessions.filter((s) => !isPast(date) && sim.has(absenceKey(date, s.code))),
    exams: EXAMS.filter((e) => e.date === date),
    activities: ACTIVITIES.filter((a) => a.date === date),
  };
}

// ---------- frequência ----------
export type DisciplineStats = {
  code: string; name: string; total: number; max: number; held: number;
  absent: number; simulated: number; remaining: number;
  freqSoFar: number; freqProjected: number; status: 'ok' | 'atencao' | 'critico';
};

export function disciplineStats(code: string, sim: Set<string>): DisciplineStats {
  const all = SESSIONS.filter((s) => s.code === code);
  const past = all.filter((s) => isPast(s.date));
  const total = all.length;
  const max = Math.floor(total * (1 - MIN_ATTENDANCE));
  const absent = past.filter((s) => registeredAbsences.has(absenceKey(s.date, code))).length;
  const simulated = all.filter((s) => !isPast(s.date) && sim.has(absenceKey(s.date, code))).length;
  const remaining = max - absent - simulated;
  return {
    code, name: nameOf(code), total, max, held: past.length, absent, simulated, remaining,
    freqSoFar: past.length ? (past.length - absent) / past.length : 1,
    freqProjected: (total - absent - simulated) / total,
    status: remaining < 0 ? 'critico' : remaining <= 1 ? 'atencao' : 'ok',
  };
}

export const allStats = (sim: Set<string>) => subjects.map((s) => disciplineStats(s.code, sim));

export function monthStats(month: number, sim: Set<string>) {
  const inMonth = SESSIONS.filter((s) => +s.date.slice(5, 7) === month);
  const past = inMonth.filter((s) => isPast(s.date));
  const absent = past.filter((s) => registeredAbsences.has(absenceKey(s.date, s.code))).length;
  const simulated = inMonth.filter((s) => !isPast(s.date) && sim.has(absenceKey(s.date, s.code))).length;
  return {
    total: inMonth.length, held: past.length, absent, simulated,
    freq: past.length ? (past.length - absent) / past.length : null,
    projected: inMonth.length ? (inMonth.length - absent - simulated) / inMonth.length : null,
  };
}

// ---------- segurança: riscos de uma falta simulada ----------
export type RiskKind = 'prova' | 'entrega' | 'limite' | 'ultima' | 'prova-proxima';
export type Risk = { kind: RiskKind; severity: 'error' | 'warning' | 'info'; message: string };

export function checkAbsence(session: Session, sim: Set<string>): Risk[] {
  const risks: Risk[] = [];
  EXAMS.filter((e) => e.date === session.date && e.code === session.code).forEach((e) =>
    risks.push({ kind: 'prova', severity: 'error', message: `${e.title} é neste dia. Faltar pode zerar a avaliação (consulte as regras de segunda chamada).` }));
  ACTIVITIES.filter((a) => a.date === session.date && a.code === session.code).forEach((a) =>
    risks.push({ kind: 'entrega', severity: 'warning', message: `Entrega neste dia: "${a.title}". Combine a entrega antes de faltar.` }));

  const st = disciplineStats(session.code, sim);
  const after = st.remaining - (sim.has(absenceKey(session.date, session.code)) ? 0 : 1);
  if (after < 0) risks.push({ kind: 'limite', severity: 'error', message: `Passa do limite de ${st.max} faltas em ${st.name}: risco de reprovação por frequência (abaixo de 75%).` });
  else if (after === 0) risks.push({ kind: 'ultima', severity: 'warning', message: `Esta seria a sua última falta permitida em ${st.name}.` });

  EXAMS.filter((e) => e.code === session.code && diffDays(session.date, e.date) > 0 && diffDays(session.date, e.date) <= 3).forEach((e) =>
    risks.push({ kind: 'prova-proxima', severity: 'info', message: `${e.title} acontece em ${diffDays(session.date, e.date)} dia(s); a aula pode ser de revisão.` }));
  return risks;
}

export const needsConfirmation = (risks: Risk[]) => risks.some((r) => r.severity !== 'info');

// ---------- melhores dias para faltar ----------
export type DaySuggestion = { session: Session; score: number; reasons: string[] };

export function bestDays(sim: Set<string>, code?: string, limit = 5): DaySuggestion[] {
  const list: DaySuggestion[] = [];
  for (const session of SESSIONS) {
    if (session.date <= REFERENCE_DATE) continue;
    if (code && session.code !== code) continue;
    if (sim.has(absenceKey(session.date, session.code))) continue;
    const st = disciplineStats(session.code, sim);
    if (st.remaining < 1) continue;
    const risks = checkAbsence(session, sim);
    if (risks.some((r) => r.kind === 'prova' || r.kind === 'entrega' || r.kind === 'limite')) continue;

    let score = 100;
    const reasons: string[] = [];
    let nearExam = false;
    let nearTask = false;
    EXAMS.filter((e) => e.code === session.code && e.date > session.date).forEach((e) => {
      const d = diffDays(session.date, e.date);
      if (d <= 7) { score -= d <= 3 ? 50 : 40; nearExam = true; } else if (d <= 14) { score -= 15; nearExam = true; }
    });
    ACTIVITIES.filter((a) => a.code === session.code && a.date > session.date).forEach((a) => {
      const d = diffDays(session.date, a.date);
      if (d <= 3) { score -= 30; nearTask = true; } else if (d <= 7) { score -= 15; nearTask = true; }
    });
    if (!nearExam && !nearTask) reasons.push('Sem provas ou entregas nas próximas semanas');
    else if (!nearExam) reasons.push('Sem prova próxima');
    if (risks.some((r) => r.kind === 'ultima')) score -= 10;

    const before = HOLIDAYS[addDays(session.date, -1)];
    const after = HOLIDAYS[addDays(session.date, 1)];
    if (before || after) { score += 15; reasons.push(`Emenda com o feriado de ${before ?? after}`); }
    const wd = weekdayOf(session.date);
    if (wd === 1 || wd === 5) { score += 5; reasons.push('Emenda com o fim de semana'); }
    reasons.push(st.remaining - 1 === 0 ? 'Seria a sua última falta permitida' : `Depois dela ainda restam ${st.remaining - 1} falta(s)`);
    list.push({ session, score, reasons });
  }
  list.sort((a, b) => b.score - a.score || a.session.date.localeCompare(b.session.date));

  const perCode: Record<string, number> = {};
  const out: DaySuggestion[] = [];
  for (const s of list) {
    perCode[s.session.code] = (perCode[s.session.code] ?? 0) + 1;
    if (!code && perCode[s.session.code] > 2) continue;
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}
