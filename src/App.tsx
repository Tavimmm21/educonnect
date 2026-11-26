import React, { useMemo, useState } from 'react';
import {
  ThemeProvider, CssBaseline, Box, Drawer, AppBar, Toolbar,
  Typography, IconButton, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Avatar, Menu, MenuItem, Badge, ButtonBase,
  Snackbar, Alert, CircularProgress, Chip, Divider, Card, CardContent,
  Grid, TextField, Button, LinearProgress, Paper, Checkbox, InputAdornment
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { buildTheme } from './theme';
import { grades, subjects, availableSubjects, ENROLLED_CREDITS, MAX_CREDITS, PASSING_GRADE } from './data';
import { findConflicts } from './schedule';
import PlannerDialog from './PlannerDialog';
import CalendarPage from './CalendarPage';

import {
  Home, BarChart3, BookOpen, ClipboardCheck, UserRound, Menu as MenuIcon,
  Bell, ChevronDown, LogOut, Flame, ShieldCheck, CalendarDays,
  Sparkles, TrendingUp, Clock3, AlertCircle, User,
  Moon, Sun, ArrowRight, Search, type LucideIcon
} from 'lucide-react';

type Page = 'dashboard' | 'notas' | 'disciplinas' | 'matricula' | 'calendario' | 'perfil';

type NavItem = {
  id: Page;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'notas', label: 'Notas', icon: BarChart3 },
  { id: 'disciplinas', label: 'Disciplinas', icon: BookOpen },
  { id: 'matricula', label: 'Matrícula', icon: ClipboardCheck },
  { id: 'calendario', label: 'Calendário', icon: CalendarDays },
  { id: 'perfil', label: 'Meu perfil', icon: UserRound },
];


const drawerWidth = 280;
const headerHeight = 72;

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [toast, setToast] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' }>({
    open: false, message: '', severity: 'success'
  });

  const showToast = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => setToast({ ...toast, open: false });

  const theme = useMemo(() => buildTheme(darkMode), [darkMode]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const navigate = (next: Page) => {
    setPage(next);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const title = useMemo(() => ({
    dashboard: 'Dashboard',
    notas: 'Minhas notas',
    disciplinas: 'Minhas disciplinas',
    matricula: 'Matrícula',
    calendario: 'Calendário inteligente',
    perfil: 'Meu perfil',
  }[page]), [page]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        
        <Box component="a" href="#conteudo" sx={{ position: 'absolute', left: 8, top: -48, zIndex: (t) => t.zIndex.tooltip, bgcolor: 'primary.main', color: 'primary.contrastText', px: 2, py: 1, borderRadius: '18px', '&:focus': { top: 8 } }}>Pular para o conteúdo</Box>

        <Header 
          title={title} 
          handleDrawerToggle={handleDrawerToggle} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode}
          onProfile={() => navigate('perfil')}
          onLogout={() => showToast('Sessão encerrada com sucesso.', 'info')}
        />

        <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', lg: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: 'surfaceAlt' },
            }}
          >
            <SidebarContent page={page} onNavigate={navigate} onLogout={() => showToast('Sessão encerrada com sucesso.', 'info')} />
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', lg: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: 'surfaceAlt', borderRight: '1px solid', borderColor: 'divider' },
            }}
            open
          >
            <SidebarContent page={page} onNavigate={navigate} onLogout={() => showToast('Sessão encerrada com sucesso.', 'info')} />
          </Drawer>
        </Box>

        <Box component="main" id="conteudo" tabIndex={-1} sx={{ outline: 'none', minWidth: 0,  flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, width: { lg: `calc(100% - ${drawerWidth}px)` }, mt: `${headerHeight}px` }}>
          {page === 'dashboard' && <Dashboard onNavigate={navigate} onToast={showToast} />}
          {page === 'notas' && <Notas />}
          {page === 'disciplinas' && <Disciplinas />}
          {page === 'matricula' && <Matricula onToast={showToast} />}
          {page === 'calendario' && <CalendarPage onToast={showToast} />}
          {page === 'perfil' && <Perfil onToast={showToast} />}
        </Box>

        <Snackbar 
          open={toast.open} 
          autoHideDuration={4000} 
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>

      </Box>
    </ThemeProvider>
  );
}

// ==========================================
// COMPONENTES DE LAYOUT
// ==========================================

function SidebarContent({ page, onNavigate, onLogout }: { page: Page; onNavigate: (p: Page) => void; onLogout: () => void }) {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, px: 1, mt: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', width: 40, height: 40, borderRadius: '10px' }} variant="rounded">
          <Flame size={24} />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Lume</Typography>
          <Typography variant="caption" color="text.secondary">Portal acadêmico</Typography>
        </Box>
      </Box>

      <Typography variant="overline" color="text.secondary" sx={{ px: 2 }}>Menu Principal</Typography>
      <List sx={{ px: 0 }}>
        {navItems.map(({ id, label, icon: Icon }) => (
          <ListItem key={id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={page === id}
              onClick={() => onNavigate(id)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                },
                '&.Mui-selected:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: page === id ? 'inherit' : 'text.secondary' }}>
                <Icon size={20} />
              </ListItemIcon>
              <ListItemText primary={label} slotProps={{ primary: { sx: { fontWeight: page === id ? 700 : 500, fontSize: '0.875rem' } } }} />
              {id === 'matricula' && (
                <Chip label="Aberta" size="small" color="primary" sx={{ height: 20, fontSize: '0.75rem' }} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto' }}>
        <Card variant="outlined" sx={{ mb: 2, bgcolor: 'background.default', boxShadow: 'none' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', width: 36, height: 36, fontSize: '0.875rem' }}>JS</Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>João Silva</Typography>
                <Typography variant="caption" color="text.secondary">RA 20261234</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
              <ShieldCheck size={16} color={theme.palette.text.secondary} />
              <Typography variant="caption" color="text.secondary">Conta protegida</Typography>
            </Box>
          </CardContent>
        </Card>
        <ListItemButton onClick={onLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}><LogOut size={20} /></ListItemIcon>
          <ListItemText primary="Sair do sistema" slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.875rem' } } }} />
        </ListItemButton>
      </Box>
    </Box>
  );
}

type HeaderProps = {
  title: string;
  handleDrawerToggle: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onProfile: () => void;
  onLogout: () => void;
};

function Header({ title, handleDrawerToggle, darkMode, setDarkMode, onProfile, onLogout }: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifEl, setNotifEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  return (
    <AppBar position="fixed" elevation={0} sx={(theme) => ({
      width: { lg: `calc(100% - ${drawerWidth}px)` },
      ml: { lg: `${drawerWidth}px` },
      bgcolor: alpha(theme.palette.background.paper, 0.72),
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid',
      borderColor: 'divider',
      color: 'text.primary',
      boxShadow: 'none',
    })}>
      <Toolbar sx={{ height: headerHeight, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} aria-label="Abrir menu de navegação" sx={{ mr: 2, display: { lg: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Área do Aluno</Typography>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>{title}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit" aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>

          <IconButton color="inherit" aria-label="Ver notificações" aria-haspopup="menu" onClick={(e) => setNotifEl(e.currentTarget)}>
            <Badge badgeContent={2} color="primary">
              <Bell size={20} />
            </Badge>
          </IconButton>
          <Menu anchorEl={notifEl} open={Boolean(notifEl)} onClose={() => setNotifEl(null)} slotProps={{ paper: { elevation: 0, sx: { mt: 1, width: 300, maxWidth: 'calc(100vw - 32px)' } } }}>
            <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>Notificações</Typography>
            <Divider />
            <MenuItem onClick={() => setNotifEl(null)} sx={{ whiteSpace: 'normal', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Matrícula aberta até 05 SET</Typography>
              <Typography variant="caption" color="text.secondary">Escolha suas disciplinas de 2026.2.</Typography>
            </MenuItem>
            <MenuItem onClick={() => setNotifEl(null)} sx={{ whiteSpace: 'normal', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Entrega do projeto Web</Typography>
              <Typography variant="caption" color="text.secondary">Prazo em 02 SET.</Typography>
            </MenuItem>
          </Menu>

          <ButtonBase
            onClick={(e) => setAnchorEl(e.currentTarget)}
            aria-haspopup="menu"
            aria-expanded={Boolean(anchorEl)}
            aria-label="Abrir menu do perfil"
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 0.5, borderRadius: '18px', '&:hover': { bgcolor: 'action.hover' } }}
          >
            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', width: 36, height: 36, fontSize: '0.875rem' }}>JS</Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>João Silva</Typography>
              <Typography variant="caption" color="text.secondary">Aluno</Typography>
            </Box>
            <ChevronDown size={16} color={theme.palette.text.secondary} />
          </ButtonBase>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} slotProps={{ paper: { elevation: 0, sx: { mt: 1, minWidth: 160 } } }}>
            <MenuItem onClick={() => { setAnchorEl(null); onProfile(); }}><User size={16} style={{ marginRight: 8 }} /> Meu perfil</MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); onLogout(); }} sx={{ color: 'error.main' }}><LogOut size={16} style={{ marginRight: 8 }} /> Sair</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

// ==========================================
// PÁGINAS REFACTORADAS COM MATERIAL DESIGN
// ==========================================

const metrics = [
  { label: 'Média geral', value: '8,7', hint: '+0,4 vs. semestre anterior', icon: TrendingUp, color: 'primary' as const },
  { label: 'Disciplinas', value: '6', hint: '24 créditos matriculados', icon: BookOpen, color: 'primary' as const },
  { label: 'Frequência', value: '94%', hint: 'Excelente aproveitamento', icon: Clock3, color: 'primary' as const },
  { label: 'Pendências', value: '2', hint: '1 atividade • 1 matrícula', icon: AlertCircle, color: 'primary' as const },
];

function MetricCard({ label, value, hint, icon: Icon, color }: {
  label: string; value: string; hint: string; icon: LucideIcon; color: 'primary' | 'success' | 'secondary' | 'warning';
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Avatar sx={(theme) => ({ bgcolor: 'background.default', color: `${color}.main`, border: `1px solid ${theme.palette.divider}` })}><Icon size={20} /></Avatar>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>2026.2</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h4">{value}</Typography>
        <Typography variant="caption" color="text.secondary">{hint}</Typography>
      </CardContent>
    </Card>
  );
}

const quickActions = [
  { title: 'Consultar notas', desc: 'Veja seu desempenho', page: 'notas' as Page, icon: BarChart3, color: 'primary' as const },
  { title: 'Ver disciplinas', desc: 'Horários e professores', page: 'disciplinas' as Page, icon: BookOpen, color: 'primary' as const },
  { title: 'Fazer matrícula', desc: 'Escolha suas disciplinas', page: 'matricula' as Page, icon: ClipboardCheck, badge: 'Aberta', color: 'primary' as const },
  { title: 'Atualizar perfil', desc: 'Mantenha seus dados em dia', page: 'perfil' as Page, icon: UserRound, color: 'primary' as const },
];

const upcomingEvents = [
  { date: '02 SET', title: 'Entrega do projeto Web', meta: 'Desenvolvimento Web', urgent: false },
  { date: '05 SET', title: 'Fim do período de matrícula', meta: 'Secretaria acadêmica', urgent: true },
  { date: '12 SET', title: 'Avaliação parcial', meta: 'Estruturas de Dados', urgent: false },
];

function Dashboard({ onNavigate, onToast }: { onNavigate: (p: Page) => void; onToast: (m: string) => void }) {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Banner Principal */}
      <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: '24px', bgcolor: 'primary.main', color: 'primary.contrastText', position: 'relative', overflow: 'hidden' }}>
        <Chip icon={<Sparkles size={14} color={theme.palette.primary.contrastText} />} label="Semestre 2026.2" sx={{ bgcolor: alpha(theme.palette.common.white, 0.15), color: 'primary.contrastText', mb: 2 }} />
        <Typography variant="h4" component="h2" gutterBottom>Olá, João!</Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600, mb: 3 }}>
          Acompanhe sua jornada acadêmica em um só lugar. Você está indo muito bem neste semestre.
        </Typography>
        <Button
          variant="contained"
          onClick={() => onNavigate('notas')}
          endIcon={<ArrowRight size={16} />}
          sx={{ bgcolor: 'primary.contrastText', color: 'primary.main', '&:hover': { bgcolor: 'primary.contrastText', opacity: 0.9 } }}
        >
          Ver meu desempenho
        </Button>
      </Paper>

      {/* Cartões de Métricas */}
      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={metric.label}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {/* Ações Rápidas */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Ações rápidas</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Acesse o que você mais precisa.</Typography>
              <Grid container spacing={2}>
                {quickActions.map((action) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={action.title}>
                    <ButtonBase
                      component={Paper}
                      variant="outlined"
                      onClick={() => onNavigate(action.page)}
                      aria-label={`${action.title}: ${action.desc}`}
                      sx={{
                        width: '100%', p: 2, borderRadius: '18px', display: 'flex', alignItems: 'center', gap: 2,
                        justifyContent: 'flex-start', textAlign: 'left', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                        '&:hover': { borderColor: 'text.primary', transform: 'translateY(-2px)' },
                        '&:hover .quick-action-arrow': { transform: 'translateX(4px)', color: 'text.primary' },
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
                        <action.icon size={20} />
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{action.title}</Typography>
                          {action.badge && <Chip label={action.badge} size="small" color="primary" sx={{ height: 18, fontSize: '0.75rem' }} />}
                        </Box>
                        <Typography variant="caption" color="text.secondary">{action.desc}</Typography>
                      </Box>
                      <ArrowRight size={18} className="quick-action-arrow" color={theme.palette.text.secondary} style={{ transition: 'transform 0.2s, color 0.2s' }} />
                    </ButtonBase>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Próximos Eventos */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>Próximos eventos</Typography>
                  <Typography variant="body2" color="text.secondary">Não perca os prazos.</Typography>
                </Box>
                <CalendarDays size={20} color={theme.palette.primary.main} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {upcomingEvents.map((event) => (
                  <Box key={event.title} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: '18px', '&:hover': { bgcolor: 'action.hover' } }}>
                    <Box sx={{
                      width: 56, flexShrink: 0, textAlign: 'center', borderRadius: '10px', py: 0.75, px: 0.5,
                      fontSize: '0.75rem', fontWeight: 600,
                      bgcolor: event.urgent ? 'primary.main' : 'background.default',
                      color: event.urgent ? 'primary.contrastText' : 'text.primary',
                    }}>
                      {event.date}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{event.title}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>{event.meta}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// MATRÍCULA (erro, loading, conflito de horário e limite de créditos)
function Matricula({ onToast }: { onToast: (m: string, severity?: 'success' | 'error' | 'info') => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);

  const toggle = (code: string) => setSelected(s => s.includes(code) ? s.filter(x => x !== code) : [...s, code]);
  const selectedSubjects = availableSubjects.filter(s => selected.includes(s.code));
  const credits = selectedSubjects.reduce((sum, s) => sum + s.credits, ENROLLED_CREDITS);

  const conflicts = findConflicts(selectedSubjects, subjects);
  const conflictCodes = new Set(conflicts.map(c => c.code));
  const overLimit = credits > MAX_CREDITS;
  const blocked = conflicts.length > 0 || overLimit;

  const handleSubmit = () => {
    // DESAFIO OPÇÃO B: Tratamento de erro se nada for selecionado
    if (selected.length === 0) {
      return onToast('Erro: Selecione pelo menos uma disciplina para continuar a matrícula.', 'error');
    }
    if (blocked) return;

    // REQUISITO 4: Loading ao simular envio
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onToast(`Pré-matrícula realizada com sucesso para ${selected.length} disciplina(s)!`, 'success');
      setSelected([]);
    }, 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5">Monte sua grade</Typography>
          <Typography variant="body2" color="text.secondary">Selecione as disciplinas desejadas para o período 2026.2.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Sparkles size={16} />} onClick={() => setPlannerOpen(true)}>
          Montar grade para mim
        </Button>
      </Box>
      <PlannerDialog
        open={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        onApply={(codes) => {
          setSelected(codes);
          setPlannerOpen(false);
          onToast(`Grade aplicada com ${codes.length} disciplina(s). Revise e continue a matrícula.`, 'success');
        }}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {availableSubjects.map((s) => {
              const isSelected = selected.includes(s.code);
              const hasConflict = isSelected && conflictCodes.has(s.code);
              return (
                <Card
                  key={s.code}
                  variant="outlined"
                  onClick={() => toggle(s.code)}
                  sx={{ cursor: 'pointer', borderColor: hasConflict ? 'error.main' : isSelected ? 'primary.main' : 'divider', bgcolor: isSelected ? 'action.selected' : 'background.paper' }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Checkbox checked={isSelected} slotProps={{ input: { 'aria-label': `Selecionar ${s.name}` } }} />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1">{s.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.code} • {s.professor} • {s.schedule} • {s.credits} créditos</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
                      <Chip label={`${s.vacancies} vagas`} size="small" variant="outlined" />
                      {hasConflict && <Chip label="Conflito" size="small" color="error" variant="outlined" />}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ position: { md: 'sticky' }, top: { md: headerHeight + 24 } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Resumo</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Disciplinas selecionadas:</Typography>
                <Typography sx={{ fontWeight: 500 }}>{selected.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Total de créditos:</Typography>
                <Typography sx={{ fontWeight: 500 }} color={overLimit ? 'error' : 'text.primary'}>{credits} / {MAX_CREDITS}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (credits / MAX_CREDITS) * 100)}
                color={overLimit ? 'error' : 'primary'}
                aria-label="Créditos em relação ao limite do período"
                sx={{ height: 8, mb: 3 }}
              />

              {blocked && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }} aria-live="polite">
                  {overLimit && (
                    <Alert severity="error" variant="outlined">
                      Limite excedido: o máximo é de {MAX_CREDITS} créditos por período. Remova {credits - MAX_CREDITS} crédito(s).
                    </Alert>
                  )}
                  {conflicts.filter(c => c.withEnrolled || c.code < c.other.code).map(c => {
                    const mine = availableSubjects.find(s => s.code === c.code)!;
                    return (
                      <Alert key={`${c.code}-${c.other.code}`} severity="error" variant="outlined">
                        Conflito de horário: {mine.name} ({mine.schedule}) coincide com {c.other.name}
                        {c.withEnrolled ? ', que você já cursa' : ''}.
                      </Alert>
                    );
                  })}
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSubmit}
                disabled={loading || blocked}
                sx={{ height: 48 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Continuar matrícula'}
              </Button>
              {blocked && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Resolva os avisos acima para continuar.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// NOTAS (boletim com gráfico, busca e filtro por situação)
type StatusFilter = 'Todas' | 'Aprovado' | 'Em andamento';

const fmt = (n: number) => n.toFixed(1).replace('.', ',');

function Notas() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('Todas');

  const media = grades.reduce((sum, g) => sum + g.grade, 0) / grades.length;
  const aprovadas = grades.filter(g => g.status === 'Aprovado').length;
  const emAndamento = grades.length - aprovadas;

  const filters: { label: StatusFilter; count: number }[] = [
    { label: 'Todas', count: grades.length },
    { label: 'Aprovado', count: aprovadas },
    { label: 'Em andamento', count: emAndamento },
  ];

  const term = query.trim().toLowerCase();
  const filtered = grades.filter(g =>
    (status === 'Todas' || g.status === status) &&
    `${g.name} ${g.code} ${g.professor}`.toLowerCase().includes(term)
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5">Boletim Acadêmico</Typography>
        <Typography variant="body2" color="text.secondary">Acompanhe suas notas e o andamento de cada disciplina no período 2026.2.</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardContent>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por disciplina, código ou professor"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                slotProps={{
                  htmlInput: { 'aria-label': 'Buscar disciplina no boletim' },
                  input: { startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> },
                }}
              />
              <Box role="group" aria-label="Filtrar por situação" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {filters.map(f => (
                  <Chip
                    key={f.label}
                    label={`${f.label} (${f.count})`}
                    clickable
                    onClick={() => setStatus(f.label)}
                    aria-pressed={status === f.label}
                    color={status === f.label ? 'primary' : 'default'}
                    variant={status === f.label ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mt: 3, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ mr: 'auto' }}>Desempenho por disciplina</Typography>
                <LegendItem color="primary.main" label="Aprovado" />
                <LegendItem color="text.secondary" label="Em andamento" />
                <LegendItem color="text.primary" label={`Mínimo ${fmt(PASSING_GRADE)}`} marker />
              </Box>

              {filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6">Nenhuma disciplina encontrada</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>Ajuste a busca ou o filtro para ver outras disciplinas.</Typography>
                  <Button variant="outlined" onClick={() => { setQuery(''); setStatus('Todas'); }}>Limpar filtros</Button>
                </Box>
              ) : (
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                  {filtered.map((g, i) => (
                    <Box component="li" key={g.code} sx={{ py: 2, borderTop: i === 0 ? 'none' : '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                        <Box sx={{ flexGrow: 1, minWidth: 160 }}>
                          <Typography variant="subtitle1">{g.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{g.code} • {g.professor}</Typography>
                        </Box>
                        <Chip label={g.status} size="small" color="primary" variant={g.status === 'Aprovado' ? 'filled' : 'outlined'} />
                        <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'right' }}>{fmt(g.grade)}</Typography>
                      </Box>
                      <Box
                        role="img"
                        aria-label={`${g.name}: nota ${fmt(g.grade)} de 10, ${g.status}`}
                        sx={{ position: 'relative', height: 10, borderRadius: 999, bgcolor: 'background.default' }}
                      >
                        <Box sx={{ height: '100%', width: `${g.grade * 10}%`, borderRadius: 999, bgcolor: g.status === 'Aprovado' ? 'primary.main' : 'text.secondary', transition: 'width 0.4s ease' }} />
                        <Box sx={{ position: 'absolute', top: -3, bottom: -3, left: `${PASSING_GRADE * 10}%`, width: 2, bgcolor: 'text.primary', opacity: 0.6 }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Resumo</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Média geral:</Typography>
                <Typography sx={{ fontWeight: 500 }}>{fmt(media)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Disciplinas aprovadas:</Typography>
                <Typography sx={{ fontWeight: 500 }}>{aprovadas}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Em andamento:</Typography>
                <Typography sx={{ fontWeight: 500 }}>{emAndamento}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function LegendItem({ color, label, marker }: { color: string; label: string; marker?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ width: marker ? 2 : 10, height: marker ? 14 : 10, borderRadius: marker ? 0 : 999, bgcolor: color, opacity: marker ? 0.6 : 1 }} />
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );
}

function Disciplinas() {
  return (
    <Grid container spacing={2}>
      {subjects.map(s => (
        <Grid size={{ xs: 12, sm: 6 }} key={s.code}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">{s.name}</Typography>
              <Typography variant="caption" color="text.secondary">{s.code} • {s.professor}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">Progresso: {s.progress}%</Typography>
                <LinearProgress variant="determinate" value={s.progress} aria-label={`Progresso em ${s.name}`} sx={{ height: 8, mt: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Perfil({ onToast }: { onToast: (m: string, severity?: 'success' | 'error' | 'info') => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: 'João Silva', email: 'joao.silva@email.com', telefone: '(11) 99999-8888' });
  const [touched, setTouched] = useState({ nome: false, email: false, telefone: false });

  const errors = {
    nome: form.nome.trim().length < 3 ? 'Informe seu nome completo.' : '',
    email: emailRegex.test(form.email) ? '' : 'Informe um e-mail válido, como nome@email.com.',
    telefone: form.telefone.replace(/\D/g, '').length >= 10 ? '' : 'Informe o telefone com DDD.',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const bind = (field: keyof typeof form) => ({
    value: form[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value }),
    onBlur: () => setTouched({ ...touched, [field]: true }),
    error: touched[field] && Boolean(errors[field]),
    helperText: touched[field] ? errors[field] : '',
    fullWidth: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) {
      setTouched({ nome: true, email: true, telefone: true });
      return onToast('Corrija os campos destacados antes de salvar.', 'error');
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onToast('Alterações salvas com sucesso!');
    }, 1500);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>Meus Dados Pessoais</Typography>
        <Typography variant="body2" color="text.secondary">Atualize seus dados de contato.</Typography>
        <Box component="form" noValidate onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 3 }}>
          <TextField label="Nome completo" required autoComplete="name" {...bind('nome')} />
          <TextField label="E-mail" type="email" required autoComplete="email" {...bind('email')} />
          <TextField label="Telefone" type="tel" required autoComplete="tel" {...bind('telefone')} />
          <Button type="submit" variant="contained" disabled={loading} sx={{ alignSelf: { xs: 'stretch', sm: 'flex-end' }, height: 44, minWidth: 160 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Salvar alterações'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
