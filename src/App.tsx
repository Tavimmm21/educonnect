import React, { useMemo, useState } from 'react';
import {
  ThemeProvider, CssBaseline, Box, Drawer, AppBar, Toolbar,
  Typography, IconButton, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Avatar, Menu, MenuItem, Badge, ButtonBase,
  Snackbar, Alert, CircularProgress, Chip, Divider, Card, CardContent,
  Grid, TextField, Button, LinearProgress, Paper, Checkbox
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { buildTheme } from './theme';

import {
  Home, BarChart3, BookOpen, ClipboardCheck, UserRound, Menu as MenuIcon,
  Bell, ChevronDown, LogOut, GraduationCap, ShieldCheck, CalendarDays,
  Sparkles, TrendingUp, Clock3, AlertCircle, User,
  Moon, Sun, ArrowRight, type LucideIcon
} from 'lucide-react';

type Page = 'dashboard' | 'notas' | 'disciplinas' | 'matricula' | 'perfil';

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
  { id: 'perfil', label: 'Meu perfil', icon: UserRound },
];

const grades = [
  { name: 'Desenvolvimento Web', code: 'WEB301', grade: 9.4, status: 'Aprovado', professor: 'Marina Costa' },
  { name: 'Banco de Dados', code: 'BD204', grade: 8.7, status: 'Aprovado', professor: 'Rafael Mendes' },
  { name: 'Engenharia de Software', code: 'ENG210', grade: 8.2, status: 'Aprovado', professor: 'Carla Nunes' },
  { name: 'UX e Design de Interfaces', code: 'UX110', grade: 9.1, status: 'Aprovado', professor: 'Lucas Alves' },
  { name: 'Estruturas de Dados', code: 'ED202', grade: 7.6, status: 'Em andamento', professor: 'João Prado' },
  { name: 'Arquitetura de Computadores', code: 'AC101', grade: 8.0, status: 'Em andamento', professor: 'Ana Lima' },
];

const subjects = [
  { name: 'Desenvolvimento Web', code: 'WEB301', professor: 'Marina Costa', schedule: 'Seg • 19:00 – 21:00', room: 'Lab 03', credits: 4, progress: 82 },
  { name: 'Banco de Dados', code: 'BD204', professor: 'Rafael Mendes', schedule: 'Ter • 19:00 – 21:00', room: 'Sala 12', credits: 4, progress: 76 },
  { name: 'Engenharia de Software', code: 'ENG210', professor: 'Carla Nunes', schedule: 'Qua • 19:00 – 21:00', room: 'Sala 08', credits: 4, progress: 70 },
  { name: 'UX e Design de Interfaces', code: 'UX110', professor: 'Lucas Alves', schedule: 'Qui • 19:00 – 21:00', room: 'Lab 01', credits: 3, progress: 91 },
  { name: 'Estruturas de Dados', code: 'ED202', professor: 'João Prado', schedule: 'Sex • 19:00 – 21:00', room: 'Lab 02', credits: 4, progress: 61 },
];

const availableSubjects = [
  { name: 'Computação em Nuvem', code: 'CLD310', professor: 'Fernanda Reis', schedule: 'Seg • 21:00 – 23:00', credits: 4, vacancies: 12 },
  { name: 'Segurança da Informação', code: 'SEC320', professor: 'Bruno Dias', schedule: 'Ter • 21:00 – 23:00', credits: 4, vacancies: 7 },
  { name: 'Mobile Development', code: 'MOB305', professor: 'Diego Ramos', schedule: 'Qua • 21:00 – 23:00', credits: 4, vacancies: 15 },
  { name: 'Inteligência Artificial', code: 'IA401', professor: 'Patrícia Melo', schedule: 'Qui • 21:00 – 23:00', credits: 5, vacancies: 4 },
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
    perfil: 'Meu perfil',
  }[page]), [page]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        
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

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, width: { lg: `calc(100% - ${drawerWidth}px)` }, mt: `${headerHeight}px` }}>
          {page === 'dashboard' && <Dashboard onNavigate={navigate} onToast={showToast} />}
          {page === 'notas' && <Notas />}
          {page === 'disciplinas' && <Disciplinas />}
          {page === 'matricula' && <Matricula onToast={showToast} />}
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
          <GraduationCap size={24} />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>EduConnect</Typography>
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
                <Chip label="Aberta" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
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

          <IconButton color="inherit" aria-label="Ver notificações">
            <Badge badgeContent={2} color="primary">
              <Bell size={20} />
            </Badge>
          </IconButton>

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
                          {action.badge && <Chip label={action.badge} size="small" color="primary" sx={{ height: 18, fontSize: '0.7rem' }} />}
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

// MATRÍCULA (Com Tratamento de Erro e Loading)
function Matricula({ onToast }: { onToast: (m: string, severity?: 'success' | 'error' | 'info') => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (code: string) => setSelected(s => s.includes(code) ? s.filter(x => x !== code) : [...s, code]);
  const selectedSubjects = availableSubjects.filter(s => selected.includes(s.code));
  const credits = selectedSubjects.reduce((sum, s) => sum + s.credits, 24);

  const handleSubmit = () => {
    // DESAFIO OPÇÃO B: Tratamento de erro se nada for selecionado
    if (selected.length === 0) {
      return onToast('Erro: Selecione pelo menos uma disciplina para continuar a matrícula.', 'error');
    }

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
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Monte sua grade</Typography>
        <Typography variant="body2" color="text.secondary">Selecione as disciplinas desejadas para o período 2026.2.</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {availableSubjects.map((s) => {
              const isSelected = selected.includes(s.code);
              return (
                <Card 
                  key={s.code} 
                  variant="outlined" 
                  onClick={() => toggle(s.code)}
                  sx={{ cursor: 'pointer', borderColor: isSelected ? 'primary.main' : 'divider', bgcolor: isSelected ? 'action.selected' : 'background.paper' }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Checkbox checked={isSelected} slotProps={{ input: { 'aria-label': `Selecionar ${s.name}` } }} />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1">{s.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.code} • {s.professor} • {s.schedule}</Typography>
                    </Box>
                    <Chip label={`${s.vacancies} vagas`} size="small" variant="outlined" sx={{ flexShrink: 0 }} />
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Resumo</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Disciplinas selecionadas:</Typography>
                <Typography sx={{ fontWeight: 500 }}>{selected.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography color="text.secondary">Total de créditos:</Typography>
                <Typography sx={{ fontWeight: 500 }}>{credits}</Typography>
              </Box>

              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                onClick={handleSubmit} 
                disabled={loading}
                sx={{ height: 48 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Continuar matrícula'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function Notas() {
  const media = grades.reduce((sum, g) => sum + g.grade, 0) / grades.length;
  const aprovadas = grades.filter(g => g.status === 'Aprovado').length;
  const emAndamento = grades.length - aprovadas;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Boletim Acadêmico</Typography>
        <Typography variant="body2" color="text.secondary">Acompanhe suas notas e o andamento de cada disciplina no período 2026.2.</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {grades.map(g => (
              <Card key={g.code} variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                  <Box sx={{ flexGrow: 1, minWidth: 180 }}>
                    <Typography variant="subtitle1">{g.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{g.code} • {g.professor}</Typography>
                  </Box>
                  <Chip label={g.status} color="primary" variant={g.status === 'Aprovado' ? 'filled' : 'outlined'} size="small" />
                  <Typography variant="h6" sx={{ minWidth: 44, textAlign: 'right' }}>{g.grade.toFixed(1)}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Resumo</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Média geral:</Typography>
                <Typography sx={{ fontWeight: 500 }}>{media.toFixed(1)}</Typography>
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

function Perfil({ onToast }: { onToast: (m: string) => void }) {
  const [loading, setLoading] = useState(false);
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onToast('Dados do perfil salvos com sucesso!');
    }, 1500);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>Meus Dados Pessoais</Typography>
        <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
            <TextField label="Nome Completo" defaultValue="João Silva" fullWidth />
            <TextField label="E-mail" defaultValue="joao.silva@email.com" fullWidth />
            <TextField label="Telefone" defaultValue="(11) 99999-8888" fullWidth />
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading} 
            sx={{ alignSelf: 'flex-end', height: 44, minWidth: 160 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Salvar alterações'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}