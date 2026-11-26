// Calendário acadêmico fictício do semestre 2027.1 (dados de demonstração).

export type ISODate = string; // 'AAAA-MM-DD'

export const SEMESTER = { label: '2027.1', start: '2027-02-15', end: '2027-06-19' };

// "Hoje" da demonstração: como o semestre ainda não começou, fixamos uma data
// de referência para existir frequência acumulada. Troque aqui para simular outro dia.
export const REFERENCE_DATE: ISODate = '2027-04-19';

// Regra usada: frequência mínima de 75% (no máximo 25% de faltas por disciplina).
export const MIN_ATTENDANCE = 0.75;

export const HOLIDAYS: Record<ISODate, string> = {
  '2027-03-26': 'Sexta-feira Santa',
  '2027-04-21': 'Tiradentes',
  '2027-05-27': 'Corpus Christi',
};

export type ExamKind = 'P1' | 'P2' | 'INT';

export const EXAM_LABEL: Record<ExamKind, string> = {
  P1: 'Prova P1',
  P2: 'Prova P2',
  INT: 'Prova Integrativa',
};

// Segunda-feira da semana de cada prova (cada disciplina faz a prova no seu dia de aula).
export const EXAM_WEEKS: Record<'P1' | 'P2', ISODate> = { P1: '2027-04-12', P2: '2027-06-07' };

// Prova integrativa única, para todas as disciplinas.
export const INTEGRATIVE_DATE: ISODate = '2027-06-19';

export type Activity = { date: ISODate; code: string; title: string };

export const ACTIVITIES: Activity[] = [
  { date: '2027-03-22', code: 'WEB301', title: 'Projeto Web — Entrega 1' },
  { date: '2027-05-24', code: 'WEB301', title: 'Projeto Web — Entrega final' },
  { date: '2027-03-30', code: 'BD204', title: 'Modelagem do banco de dados' },
  { date: '2027-05-18', code: 'BD204', title: 'Trabalho de consultas SQL' },
  { date: '2027-04-28', code: 'ENG210', title: 'Documento de requisitos' },
  { date: '2027-06-02', code: 'ENG210', title: 'Apresentação do sprint' },
  { date: '2027-04-29', code: 'UX110', title: 'Protótipo de interface' },
  { date: '2027-06-03', code: 'UX110', title: 'Teste de usabilidade' },
  { date: '2027-04-23', code: 'ED202', title: 'Lista de exercícios' },
  { date: '2027-05-21', code: 'ED202', title: 'Implementação de árvores' },
];

// Faltas já registradas até a data de referência: 'data|código'.
export const REGISTERED_ABSENCES: string[] = [
  '2027-03-08|WEB301',
  '2027-03-02|BD204',
  '2027-04-06|BD204',
  '2027-02-24|ENG210',
  '2027-03-17|ENG210',
  '2027-04-07|ENG210',
  '2027-03-25|UX110',
  '2027-02-19|ED202',
  '2027-04-02|ED202',
];
