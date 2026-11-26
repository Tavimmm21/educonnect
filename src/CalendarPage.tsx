import { useState } from 'react';
import {
  Alert, Box, Button, ButtonBase, Card, CardContent, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Grid, LinearProgress, Tab, Tabs, Typography,
} from '@mui/material';
import { ShieldAlert } from 'lucide-react';
import AssistantChat from './AssistantChat';
import { MIN_ATTENDANCE, REFERENCE_DATE, SEMESTER, type ISODate } from './calendarData';
import {
  absenceKey, addDays, allStats, checkAbsence, dayInfo, fmtLong, fmtShort, isPast, MONTH_LONG,
  monthStats, needsConfirmation, pct, weekdayOf, WEEKDAY_LONG, type DayInfo, type Risk, type Session,
} from './academic';

type Toast = (message: string, severity?: 'success' | 'error' | 'info') => void;

const MONTHS = [2, 3, 4, 5, 6];
const MONTH_ABBR = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const YEAR = 2027;

function cellLabel(date: ISODate, info: DayInfo) {
  const parts = [`${WEEKDAY_LONG[weekdayOf(date)]}, ${+date.slice(8)} de ${MONTH_LONG[+date.slice(5, 7) - 1]}`];
  if (date === REFERENCE_DATE) parts.push('hoje');
  if (info.holiday) parts.push(`feriado: ${info.holiday}`);
  info.exams.forEach((e) => parts.push(e.title));
  info.activities.forEach((a) => parts.push(`entrega: ${a.title}`));
  if (info.absent.length) parts.push(`faltou em ${info.absent.map((s) => s.name).join(', ')}`);
  if (info.simulated.length) parts.push(`falta simulada em ${info.simulated.map((s) => s.name).join(', ')}`);
  return parts.join('; ');
}

function Marker({ kind }: { kind: 'exam' | 'task' | 'absent' | 'sim' }) {
  const base = { width: 7, height: 7, flexShrink: 0 } as const;
  const styles = {
    exam: { ...base, bgcolor: 'text.primary' },
    task: { ...base, border: '1.5px solid', borderColor: 'text.primary', transform: 'rotate(45deg)' },
    absent: { ...base, borderRadius: '50%', bgcolor: 'error.main' },
    sim: { ...base, borderRadius: '50%', border: '1.5px solid', borderColor: 'error.main' },
  } as const;
  return <Box aria-hidden sx={styles[kind]} />;
}

function DayCell({ date, selected, info, onSelect }: { date: ISODate; selected: boolean; info: DayInfo; onSelect: (d: ISODate) => void }) {
  const isToday = date === REFERENCE_DATE;
  return (
    <ButtonBase
      onClick={() => onSelect(date)}
      disabled={!info.inSemester}
      aria-label={cellLabel(date, info)}
      aria-pressed={selected}
      sx={{
        height: 48, width: '100%', minWidth: 0, borderRadius: '10px', flexDirection: 'column', gap: 0.5,
        border: '1px solid', borderStyle: info.holiday && !selected ? 'dashed' : 'solid',
        borderColor: selected ? 'text.primary' : info.holiday ? 'divider' : 'transparent',
        bgcolor: selected ? 'action.selected' : 'transparent',
        opacity: info.inSemester ? 1 : 0.35,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box
        sx={{
          width: 24, height: 24, display: 'grid', placeItems: 'center', borderRadius: '50%', fontSize: '0.875rem',
          fontWeight: isToday ? 600 : 500,
          bgcolor: isToday ? 'primary.main' : 'transparent',
          color: isToday ? 'primary.contrastText' : info.holiday ? 'text.secondary' : 'text.primary',
        }}
      >
        {+date.slice(8)}
      </Box>
      <Box sx={{ display: 'flex', gap: '4px', height: 8, alignItems: 'center' }}>
        {info.exams.length > 0 && <Marker kind="exam" />}
        {info.activities.length > 0 && <Marker kind="task" />}
        {info.absent.length > 0 && <Marker kind="absent" />}
        {info.simulated.length > 0 && <Marker kind="sim" />}
      </Box>
    </ButtonBase>
  );
}

function Legend() {
  const items: { kind: 'exam' | 'task' | 'absent' | 'sim'; label: string }[] = [
    { kind: 'exam', label: 'Prova' },
    { kind: 'task', label: 'Entrega' },
    { kind: 'absent', label: 'Falta registrada' },
    { kind: 'sim', label: 'Falta simulada' },
  ];
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
      {items.map((i) => (
        <Box key={i.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Marker kind={i.kind} />
          <Typography variant="caption" color="text.secondary">{i.label}</Typography>
        </Box>
      ))}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box aria-hidden sx={{ width: 14, height: 10, borderRadius: '4px', border: '1px dashed', borderColor: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">Feriado</Typography>
      </Box>
    </Box>
  );
}

export default function CalendarPage({ onToast }: { onToast: Toast }) {
  const refMonth = +REFERENCE_DATE.slice(5, 7);
  const [month, setMonth] = useState(refMonth);
  const [selected, setSelected] = useState<ISODate>(REFERENCE_DATE);
  const [sim, setSim] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<{ session: Session; risks: Risk[] } | null>(null);

  const stats = allStats(sim);
  const ms = monthStats(month, sim);

  const first = `${YEAR}-${String(month).padStart(2, '0')}-01`;
  const offset = weekdayOf(first);
  const daysInMonth = new Date(Date.UTC(YEAR, month, 0)).getUTCDate();
  const cells: (ISODate | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => addDays(first, i))];

  const apply = (s: Session) => {
    setSim((prev) => new Set(prev).add(absenceKey(s.date, s.code)));
    onToast(`Falta simulada em ${s.name} (${fmtShort(s.date)}).`, 'info');
  };
  const undo = (date: ISODate, code: string) =>
    setSim((prev) => { const n = new Set(prev); n.delete(absenceKey(date, code)); return n; });

  const toggleSimulation = (s: Session) => {
    if (sim.has(absenceKey(s.date, s.code))) return undo(s.date, s.code);
    const risks = checkAbsence(s, sim);
    if (needsConfirmation(risks)) setPending({ session: s, risks });
    else apply(s);
  };

  const info = dayInfo(selected, sim);
  const simList = [...sim].map((k) => { const [date, code] = k.split('|'); return { key: k, date, code }; }).sort((a, b) => a.date.localeCompare(b.date));
  const nameByCode = (code: string) => stats.find((s) => s.code === code)?.name ?? code;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5">Calendário inteligente</Typography>
        <Typography variant="body2" color="text.secondary">
          Semestre {SEMESTER.label} ({fmtShort(SEMESTER.start)} a {fmtShort(SEMESTER.end)}). Veja provas, entregas e a sua frequência, e simule faltas com segurança.
        </Typography>
        <Chip size="small" variant="outlined" sx={{ mt: 1 }} label={`Data de referência da demonstração: ${fmtShort(REFERENCE_DATE)}/${YEAR}`} />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardContent>
              <Tabs
                value={month}
                onChange={(_, v: number) => { setMonth(v); }}
                variant="fullWidth"
                aria-label="Meses do semestre"
                sx={{ mb: 2 }}
              >
                {MONTHS.map((m) => {
                  const s = monthStats(m, sim);
                  return <Tab key={m} value={m} sx={{ minWidth: 0, px: 0.5 }} label={<Box sx={{ lineHeight: 1.3 }}><Box component="span" sx={{ display: 'block' }}>{MONTH_ABBR[m - 1]}</Box><Box component="span" sx={{ display: 'block', fontSize: '0.75rem', color: 'text.secondary', fontWeight: 400 }}>{s.freq === null ? '—' : pct(s.freq)}</Box></Box>} aria-label={`${MONTH_LONG[m - 1]}${s.freq === null ? ', sem aulas realizadas' : `, frequência ${pct(s.freq)}`}`} />;
                })}
              </Tabs>

              <Typography variant="subtitle1" sx={{ '&::first-letter': { textTransform: 'uppercase' } }}>{MONTH_LONG[month - 1]} de {YEAR}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} aria-live="polite">
                {ms.held === 0
                  ? 'Ainda sem aulas realizadas neste mês.'
                  : `Frequência no mês: ${pct(ms.freq ?? 1)} (${ms.absent} falta(s) em ${ms.held} aulas realizadas).`}
                {ms.simulated > 0 && ` Com as simulações, a projeção do mês cai para ${pct(ms.projected ?? 1)}.`}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px', mb: 0.5 }}>
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                  <Typography key={i} variant="caption" color="text.secondary" aria-label={WEEKDAY_LONG[i]} sx={{ textAlign: 'center', fontWeight: 500 }}>{d}</Typography>
                ))}
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px' }}>
                {cells.map((d, i) => d
                  ? <DayCell key={d} date={d} selected={d === selected} info={dayInfo(d, sim)} onSelect={setSelected} />
                  : <Box key={`e${i}`} />)}
              </Box>
              <Legend />

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ '&::first-letter': { textTransform: 'uppercase' } }}>{fmtLong(selected)}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1.5 }}>
                {info.holiday && <Alert severity="info" variant="outlined">Feriado: {info.holiday}. Não há aula.</Alert>}
                {!info.inSemester && <Typography variant="body2" color="text.secondary">Fora do período do semestre.</Typography>}
                {info.inSemester && !info.holiday && info.sessions.length === 0 && info.exams.length === 0 && info.activities.length === 0 && (
                  <Typography variant="body2" color="text.secondary">Sem aulas, provas ou entregas neste dia.</Typography>
                )}
                {info.exams.map((e) => <Alert key={e.title} severity="warning" variant="outlined">{e.title}</Alert>)}
                {info.activities.map((a) => <Alert key={a.title} severity="warning" variant="outlined">Entrega: {a.title} ({nameByCode(a.code)})</Alert>)}

                {info.sessions.map((s) => {
                  const key = absenceKey(s.date, s.code);
                  const past = isPast(s.date);
                  const wasAbsent = info.absent.some((a) => a.code === s.code);
                  const isSim = sim.has(key);
                  return (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '18px' }}>
                      <Box sx={{ flexGrow: 1, minWidth: 160 }}>
                        <Typography variant="subtitle2">{s.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.code} • {s.time}</Typography>
                      </Box>
                      {past ? (
                        <Chip size="small" label={wasAbsent ? 'Faltou' : 'Presente'} color={wasAbsent ? 'error' : 'default'} variant="outlined" />
                      ) : (
                        <>
                          {isSim && <Chip size="small" label="Falta simulada" color="error" variant="outlined" />}
                          <Button size="small" variant="outlined" onClick={() => toggleSimulation(s)} aria-label={`${isSim ? 'Desfazer simulação de falta' : 'Simular falta'} em ${s.name}`}>
                            {isSim ? 'Desfazer' : 'Simular falta'}
                          </Button>
                        </>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Frequência por disciplina</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  O limite é de {Math.round((1 - MIN_ATTENDANCE) * 100)}% de faltas sobre o total de aulas do semestre.
                </Typography>

                {simList.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">Simulações ({simList.length})</Typography>
                      <Button size="small" onClick={() => setSim(new Set())}>Limpar</Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {simList.map((s) => (
                        <Chip key={s.key} size="small" variant="outlined" label={`${fmtShort(s.date)} · ${s.code}`} onDelete={() => undo(s.date, s.code)} onClick={() => { setSelected(s.date); setMonth(+s.date.slice(5, 7)); }} />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {stats.map((s) => {
                    const used = s.absent + s.simulated;
                    return (
                      <li key={s.code}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                          <Typography variant="subtitle2" sx={{ mr: 'auto' }}>{s.name}</Typography>
                          {s.status === 'critico' && <Chip size="small" color="error" label="Acima do limite" />}
                          {s.status === 'atencao' && <Chip size="small" color="primary" label="Atenção" />}
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (used / s.max) * 100)}
                          color={s.status === 'critico' ? 'error' : 'primary'}
                          aria-label={`Faltas usadas em ${s.name}: ${used} de ${s.max}`}
                          sx={{ height: 8 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                          {used} de {s.max} faltas ({s.absent} registrada(s){s.simulated ? ` + ${s.simulated} simulada(s)` : ''}) •{' '}
                          {s.remaining >= 0 ? `restam ${s.remaining}` : `${-s.remaining} acima do limite`} • frequência {pct(s.freqSoFar)} até hoje
                          {s.simulated ? `, projeção ${pct(s.freqProjected)}` : ''}
                        </Typography>
                      </li>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>

            <AssistantChat sim={sim} />
          </Box>
        </Grid>
      </Grid>

      <Dialog open={Boolean(pending)} onClose={() => setPending(null)} fullWidth maxWidth="xs" aria-labelledby="risk-title" slotProps={{ paper: { sx: { borderRadius: '24px' } } }}>
        <DialogTitle id="risk-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldAlert size={20} /> Atenção antes de faltar
        </DialogTitle>
        <DialogContent>
          {pending && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Simular falta em {pending.session.name}, {fmtLong(pending.session.date)}:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {pending.risks.map((r) => (
                  <Alert key={r.kind + r.message} severity={r.severity} variant="outlined">{r.message}</Alert>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPending(null)} autoFocus>Cancelar</Button>
          <Button variant="contained" color={pending?.risks.some((r) => r.severity === 'error') ? 'error' : 'primary'} onClick={() => { if (pending) apply(pending.session); setPending(null); }}>
            Simular mesmo assim
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
