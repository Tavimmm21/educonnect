// Dados fictícios (mock) do portal.

export type Grade = { name: string; code: string; grade: number; status: 'Aprovado' | 'Em andamento'; professor: string };

export const grades: Grade[] = [
  { name: 'Desenvolvimento Web', code: 'WEB301', grade: 9.4, status: 'Aprovado', professor: 'Marina Costa' },
  { name: 'Banco de Dados', code: 'BD204', grade: 8.7, status: 'Aprovado', professor: 'Rafael Mendes' },
  { name: 'Engenharia de Software', code: 'ENG210', grade: 8.2, status: 'Aprovado', professor: 'Carla Nunes' },
  { name: 'UX e Design de Interfaces', code: 'UX110', grade: 9.1, status: 'Aprovado', professor: 'Lucas Alves' },
  { name: 'Estruturas de Dados', code: 'ED202', grade: 7.6, status: 'Em andamento', professor: 'João Prado' },
  { name: 'Arquitetura de Computadores', code: 'AC101', grade: 8.0, status: 'Em andamento', professor: 'Ana Lima' },
];

export const subjects = [
  { name: 'Desenvolvimento Web', code: 'WEB301', professor: 'Marina Costa', schedule: 'Seg • 19:00 – 21:00', room: 'Lab 03', credits: 4, progress: 82 },
  { name: 'Banco de Dados', code: 'BD204', professor: 'Rafael Mendes', schedule: 'Ter • 19:00 – 21:00', room: 'Sala 12', credits: 4, progress: 76 },
  { name: 'Engenharia de Software', code: 'ENG210', professor: 'Carla Nunes', schedule: 'Qua • 19:00 – 21:00', room: 'Sala 08', credits: 4, progress: 70 },
  { name: 'UX e Design de Interfaces', code: 'UX110', professor: 'Lucas Alves', schedule: 'Qui • 19:00 – 21:00', room: 'Lab 01', credits: 3, progress: 91 },
  { name: 'Estruturas de Dados', code: 'ED202', professor: 'João Prado', schedule: 'Sex • 19:00 – 21:00', room: 'Lab 02', credits: 4, progress: 61 },
];

export const availableSubjects = [
  { name: 'Computação em Nuvem', code: 'CLD310', professor: 'Fernanda Reis', schedule: 'Seg • 21:00 – 23:00', credits: 4, vacancies: 12 },
  { name: 'Segurança da Informação', code: 'SEC320', professor: 'Bruno Dias', schedule: 'Ter • 21:00 – 23:00', credits: 4, vacancies: 7 },
  { name: 'Mobile Development', code: 'MOB305', professor: 'Diego Ramos', schedule: 'Qua • 21:00 – 23:00', credits: 4, vacancies: 15 },
  { name: 'Redes de Computadores', code: 'RED330', professor: 'Sérgio Pinto', schedule: 'Ter • 20:00 – 22:00', credits: 4, vacancies: 9 },
  { name: 'Inteligência Artificial', code: 'IA401', professor: 'Patrícia Melo', schedule: 'Qui • 21:00 – 23:00', credits: 5, vacancies: 4 },
];

// Créditos já matriculados no período e limite máximo permitido.
export const ENROLLED_CREDITS = 24;
export const MAX_CREDITS = 32;
export const PASSING_GRADE = 7;
