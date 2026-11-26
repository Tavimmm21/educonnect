import { subjects } from './data';
import { ACTIVITIES, REFERENCE_DATE, SEMESTER } from './calendarData';
import {
  allStats, bestDays, checkAbsence, disciplineStats, dayInfo, EXAMS, fmtLong, fmtShort, fmtWeek,
  nameOf, pct, isPast, parseISO, toISO, type Risk,
} from './academic';

export type Reply = { text: string; bullets?: string[] };

export const SUGGESTIONS = [
  'Quantas vezes posso faltar?',
  'Quais os melhores dias para faltar?',
  'Quando são as provas?',
  'Quais as próximas entregas?',
  'Como está minha frequência?',
];

// Assistente baseado em regras: lê o calendário e a frequência locais. Não usa IA externa.
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const ALIASES: Record<string, string[]> = {
  WEB301: ['web', 'desenvolvimento', 'web301'],
  BD204: ['banco', 'bd', 'bd204'],
  ENG210: ['engenharia', 'software', 'eng', 'eng210'],
  UX110: ['ux', 'design', 'interface', 'interfaces', 'ux110'],
  ED202: ['estrutura', 'estruturas', 'ed', 'ed202'],
};

function detectCode(nq: string): string | undefined {
  const tokens = nq.split(/[^a-z0-9]+/).filter(Boolean);
  return subjects.find((s) => (ALIASES[s.code] ?? []).some((a) => tokens.includes(a)))?.code;
}

const riskLine = (r: Risk) => `${r.severity === 'error' ? 'Risco alto' : r.severity === 'warning' ? 'Atenção' : 'Observação'}: ${r.message}`;

function answerDate(day: number, month: number, sim: Set<string>): Reply {
  const date = `2027-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  if (toISO(parseISO(date)) !== date) return { text: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')} não é uma data válida.` };
  const info = dayInfo(date, sim);
  if (!info.inSemester)
    return { text: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')} está fora do semestre ${SEMESTER.label} (${fmtShort(SEMESTER.start)} a ${fmtShort(SEMESTER.end)}).` };
  if (info.holiday) return { text: `${fmtLong(date)} é feriado (${info.holiday}): não há aula, então não precisa faltar.` };
  if (info.sessions.length === 0) return { text: `Não há aula em ${fmtLong(date)}.` };
  if (isPast(date)) return { text: `${fmtLong(date)} já passou (hoje, na demonstração, é ${fmtShort(REFERENCE_DATE)}).` };

  const bullets: string[] = [];
  let worst = 0; // 0 = sem riscos, 1 = ressalvas, 2 = risco alto
  info.sessions.forEach((s) => {
    const risks = checkAbsence(s, sim);
    if (risks.some((r) => r.severity === 'error')) worst = 2;
    else if (risks.some((r) => r.severity === 'warning')) worst = Math.max(worst, 1);
    if (risks.length === 0) bullets.push(`${s.name}: sem riscos conhecidos.`);
    else risks.forEach((r) => bullets.push(`${s.name} — ${riskLine(r)}`));
  });
  const verdict = worst === 2 ? 'Não recomendo faltar' : worst === 1 ? 'Dá para faltar, mas com ressalvas' : 'Pode faltar sem riscos conhecidos';
  return { text: `${verdict} em ${fmtLong(date)}.`, bullets };
}

export function answer(question: string, sim: Set<string>): Reply {
  const nq = norm(question);
  const code = detectCode(nq);

  const dm = nq.match(/(\d{1,2})\s*\/\s*(\d{1,2})/);
  if (dm) return answerDate(+dm[1], +dm[2], sim);

  if (/\b(oi|ola|ajuda|help)\b/.test(nq) && nq.length < 20)
    return { text: 'Posso responder sobre faltas, melhores dias para faltar, provas, entregas e frequência. Também aceito datas, como "Posso faltar em 26/04?".' };

  if (/melhor|ideal|recomend|quando faltar|dias? para faltar/.test(nq)) {
    const list = bestDays(sim, code);
    if (list.length === 0) return { text: `Não encontrei dias seguros para faltar${code ? ` em ${nameOf(code)}` : ''}: ou você já usou as faltas permitidas ou os dias restantes têm prova/entrega.` };
    return {
      text: `Os melhores dias para faltar${code ? ` em ${nameOf(code)}` : ''}, evitando provas e entregas:`,
      bullets: list.map((b) => `${fmtWeek(b.session.date)} — ${b.session.name}. ${b.reasons.join('. ')}.`),
    };
  }

  if (/\bp1\b|\bp2\b|prova|integrativa|avaliacao/.test(nq)) {
    const exams = EXAMS.filter((e) => !code || e.code === code || e.code === null);
    const next = exams.find((e) => e.date >= REFERENCE_DATE);
    return {
      text: next ? `A próxima prova é: ${next.title}, ${fmtLong(next.date)}.` : 'Todas as provas já passaram.',
      bullets: exams.map((e) => `${e.title}: ${fmtWeek(e.date)}`),
    };
  }

  if (/entrega|atividade|trabalho|prazo|tarefa/.test(nq)) {
    const list = ACTIVITIES.filter((a) => a.date >= REFERENCE_DATE && (!code || a.code === code)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
    if (list.length === 0) return { text: 'Não há entregas pendentes a partir de hoje.' };
    return { text: 'Próximas entregas (faltar nesses dias exige cuidado):', bullets: list.map((a) => `${fmtWeek(a.date)} — ${a.title} (${nameOf(a.code)})`) };
  }

  if (/quant|posso faltar|faltas|limite|restam|sobra/.test(nq)) {
    const stats = code ? [disciplineStats(code, sim)] : allStats(sim);
    return {
      text: 'Com a regra de 75% de presença sobre o total de aulas do semestre, o limite é de 25% de faltas por disciplina.',
      bullets: stats.map((s) =>
        `${s.name}: pode faltar ${Math.max(0, s.remaining)} vez(es) a mais (limite ${s.max}, usadas ${s.absent}${s.simulated ? `, simuladas ${s.simulated}` : ''}).${s.remaining < 0 ? ' Limite ultrapassado na simulação.' : s.remaining === 1 ? ' Atenção: resta só uma.' : ''}`),
    };
  }

  if (/frequencia|presenca|assiduidade/.test(nq)) {
    const stats = code ? [disciplineStats(code, sim)] : allStats(sim);
    return {
      text: `Frequência até ${fmtShort(REFERENCE_DATE)}:`,
      bullets: stats.map((s) => `${s.name}: ${pct(s.freqSoFar)} nas aulas já dadas (${s.absent} falta(s) em ${s.held}). Projeção do semestre: ${pct(s.freqProjected)}.`),
    };
  }

  return {
    text: 'Ainda não entendi essa pergunta. Tente algo como:',
    bullets: [...SUGGESTIONS, 'Posso faltar em 26/04?', 'Quantas faltas posso ter em Banco de Dados?'],
  };
}

