import { useEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, Chip, IconButton, TextField, Typography } from '@mui/material';
import { Send, Sparkles } from 'lucide-react';
import { answer, SUGGESTIONS, type Reply } from './assistant';

type Message = { role: 'user' | 'assistant'; text: string; bullets?: string[] };

const GREETING: Message = {
  role: 'assistant',
  text: 'Olá! Conheço o calendário de 2027.1, as provas, as entregas e a sua frequência. Pergunte ou escolha uma sugestão.',
};

export default function AssistantChat({ sim }: { sim: Set<string> }) {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [messages]);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q) return;
    const reply: Reply = answer(q, sim);
    setMessages((m) => [...m, { role: 'user', text: q }, { role: 'assistant', ...reply }]);
    setInput('');
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Sparkles size={18} />
          <Typography variant="h6">Assistente de faltas</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Respostas calculadas pelas regras do calendário (mínimo de 75% de presença), levando em conta as suas simulações. Não usa IA externa.
        </Typography>

        <Box
          role="log"
          aria-live="polite"
          aria-label="Conversa com o assistente"
          sx={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, pr: 0.5 }}
        >
          {messages.map((m, i) => (
            <Box
              key={i}
              sx={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '92%',
                px: 2, py: 1.25, borderRadius: '18px',
                bgcolor: m.role === 'user' ? 'primary.main' : 'background.default',
                color: m.role === 'user' ? 'primary.contrastText' : 'text.primary',
              }}
            >
              <Typography variant="body2">{m.text}</Typography>
              {m.bullets && (
                <Box component="ul" sx={{ m: 0, mt: 0.75, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {m.bullets.map((b, j) => (
                    <Typography component="li" variant="body2" key={j}>{b}</Typography>
                  ))}
                </Box>
              )}
            </Box>
          ))}
          <div ref={endRef} />
        </Box>

        <Box role="group" aria-label="Perguntas sugeridas" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {SUGGESTIONS.map((s) => (
            <Chip key={s} label={s} size="small" variant="outlined" clickable onClick={() => ask(s)} />
          ))}
        </Box>

        <Box
          component="form"
          onSubmit={(e: React.FormEvent) => { e.preventDefault(); ask(input); }}
          sx={{ display: 'flex', gap: 1, mt: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder='Ex.: "Posso faltar em 26/04?"'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            slotProps={{ htmlInput: { 'aria-label': 'Pergunte ao assistente' } }}
          />
          <IconButton type="submit" aria-label="Enviar pergunta" disabled={!input.trim()} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.main', opacity: 0.9 }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}>
            <Send size={18} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
