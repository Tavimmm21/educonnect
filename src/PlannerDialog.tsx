import { useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, Slider, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Sparkles } from 'lucide-react';
import { availableSubjects, subjects, ENROLLED_CREDITS, MAX_CREDITS } from './data';
import { suggestPlans } from './planner';
import { parseSlot } from './schedule';

const weekOrder = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const allDays = ([...new Set(availableSubjects.map((s) => parseSlot(s.schedule)?.day).filter(Boolean) as string[])]).sort(
  (a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b)
);

type Props = {
  open: boolean;
  onClose: () => void;
  onApply: (codes: string[]) => void;
};

export default function PlannerDialog({ open, onClose, onApply }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [target, setTarget] = useState(30);
  const [freeDays, setFreeDays] = useState<string[]>([]);

  const plans = useMemo(
    () => suggestPlans(availableSubjects, subjects, { enrolledCredits: ENROLLED_CREDITS, maxCredits: MAX_CREDITS, target, freeDays }),
    [target, freeDays]
  );

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm" aria-labelledby="planner-title" slotProps={{ paper: { sx: { borderRadius: fullScreen ? 0 : '24px' } } }}>
      <DialogTitle id="planner-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Sparkles size={20} /> Montar grade para mim
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Diga o que você prefere e o sistema sugere combinações sem conflito de horário e dentro do limite de créditos.
        </Typography>

        <Typography id="meta-label" variant="subtitle2">Meta de créditos no período: {target}</Typography>
        <Box sx={{ px: 1.5 }}>
          <Slider
            value={target}
            onChange={(_, v) => setTarget(v as number)}
            min={ENROLLED_CREDITS}
            max={MAX_CREDITS}
            step={1}
            marks
            valueLabelDisplay="auto"
            aria-labelledby="meta-label"
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          Você já tem {ENROLLED_CREDITS} créditos. O limite é {MAX_CREDITS}.
        </Typography>

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Dias que quero deixar livres</Typography>
        <ToggleButtonGroup
          value={freeDays}
          onChange={(_, v: string[]) => setFreeDays(v)}
          aria-label="Dias livres"
          size="small"
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, '& .MuiToggleButtonGroup-grouped': { border: '1px solid', borderColor: 'divider', borderRadius: '18px !important', px: 1.5, minWidth: 52, m: 0 } }}
        >
          {allDays.map((d) => (
            <ToggleButton key={d} value={d} aria-label={`Deixar ${d} livre`}>{d}</ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5 }} aria-live="polite">
          {plans.length > 0 ? `Sugestões (${plans.length})` : 'Sugestões'}
        </Typography>

        {plans.length === 0 ? (
          <Alert severity="info" variant="outlined">
            Nenhuma combinação atende a esses critérios. Tente liberar menos dias ou reduzir a meta de créditos.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {plans.map((plan, i) => (
              <Card key={plan.items.map((s) => s.code).join('-')} variant="outlined" sx={{ boxShadow: 'none' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ mr: 'auto' }}>Opção {i + 1}</Typography>
                    <Chip size="small" label={`${plan.credits} créditos`} color={plan.credits === target ? 'primary' : 'default'} variant={plan.credits === target ? 'filled' : 'outlined'} />
                    <Chip size="small" variant="outlined" label="Sem conflitos" />
                    {plan.minVacancies <= 6 && <Chip size="small" variant="outlined" label="Vagas limitadas" />}
                  </Box>
                  <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {plan.items.map((s) => (
                      <li key={s.code}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{s.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.schedule} • {s.credits} créditos</Typography>
                      </li>
                    ))}
                  </Box>
                  <Button
                    variant={i === 0 ? 'contained' : 'outlined'}
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => onApply(plan.items.map((s) => s.code))}
                  >
                    Aplicar esta grade
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
