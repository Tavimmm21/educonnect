import { alpha, createTheme } from '@mui/material/styles';

// Design tokens baseados no DESIGN.md (monocromático, "clinical blueprint on frosted paper").
// Todas as cores da aplicação vêm daqui — nenhum componente deve usar cor fixa.

declare module '@mui/material/styles' {
  interface Palette {
    surfaceAlt: string;
  }
  interface PaletteOptions {
    surfaceAlt?: string;
  }
}

const radius = { interactive: 18, container: 24, nested: 10 };

const tokens = {
  light: {
    canvas: '#f5f5f5',
    paper: '#ffffff',
    surfaceAlt: '#fafafa',
    ink: '#0a0a0a',
    inkSoft: '#171717',
    inkContrast: '#fafafa',
    muted: '#737373',
    hairline: '#e5e5e5',
    cardShadow:
      '0 0 0 1px rgba(23,23,23,0.05), 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
  },
  dark: {
    canvas: '#0a0a0a',
    paper: '#171717',
    surfaceAlt: '#111111',
    ink: '#fafafa',
    inkSoft: '#e5e5e5',
    inkContrast: '#0a0a0a',
    muted: '#a3a3a3',
    hairline: '#262626',
    cardShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.5)',
  },
} as const;

const ember = '#e7000b'; // reservado a estados de erro / ações destrutivas

export function buildTheme(darkMode: boolean) {
  const t = darkMode ? tokens.dark : tokens.light;

  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: t.ink, contrastText: t.inkContrast },
      secondary: { main: t.muted, contrastText: t.inkContrast },
      // Sem cores cromáticas: sucesso/aviso/info usam tons de cinza.
      success: { main: t.inkSoft, contrastText: t.inkContrast },
      info: { main: t.inkSoft, contrastText: t.inkContrast },
      warning: { main: t.muted, contrastText: t.inkContrast },
      error: { main: ember, contrastText: '#ffffff' },
      background: { default: t.canvas, paper: t.paper },
      surfaceAlt: t.surfaceAlt,
      text: { primary: t.ink, secondary: t.muted },
      divider: t.hairline,
    },
    shape: { borderRadius: radius.interactive },
    typography: {
      fontFamily: '"Geist", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      fontSize: 14,
      h4: { fontSize: '1.875rem', lineHeight: 1.2, fontWeight: 600, letterSpacing: '-0.025em' },
      h5: { fontSize: '1.5rem', lineHeight: 1.33, fontWeight: 600, letterSpacing: '-0.025em' },
      h6: { fontSize: '1.125rem', lineHeight: 1.56, fontWeight: 600 },
      subtitle1: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 },
      subtitle2: { fontSize: '0.875rem', lineHeight: 1.43, fontWeight: 500 },
      body1: { fontSize: '0.875rem', lineHeight: 1.43 },
      body2: { fontSize: '0.875rem', lineHeight: 1.43 },
      caption: { fontSize: '0.75rem', lineHeight: 1.33 },
      overline: { fontSize: '0.75rem', lineHeight: 1.33, fontWeight: 500, letterSpacing: '0.05em' },
      button: { textTransform: 'none', fontSize: '0.875rem', fontWeight: 500 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          body: { backgroundColor: theme.palette.background.default },
          '*::-webkit-scrollbar': { width: 8, height: 8 },
          '*::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.text.secondary, 0.4),
            borderRadius: 999,
          },
        }),
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 500, borderRadius: radius.interactive, boxShadow: 'none' },
          outlined: { borderColor: t.hairline, color: t.ink },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: radius.container, border: `1px solid ${t.hairline}`, boxShadow: t.cardShadow },
        },
      },
      MuiCardContent: {
        styleOverrides: { root: { padding: 20, '&:last-child': { paddingBottom: 20 } } },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.interactive,
            backgroundColor: t.canvas,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.hairline },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: t.ink, borderWidth: 1 },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: radius.interactive, fontWeight: 500, fontSize: '0.75rem' },
          outlined: { borderColor: t.hairline },
        },
      },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500, minHeight: 44 } } },
      MuiAlert: { styleOverrides: { root: { borderRadius: radius.interactive } } },
      MuiListItemButton: { styleOverrides: { root: { borderRadius: radius.interactive } } },
      MuiMenu: {
        styleOverrides: {
          paper: { borderRadius: radius.interactive, border: `1px solid ${t.hairline}` },
        },
      },
      MuiMenuItem: { styleOverrides: { root: { borderRadius: radius.nested, margin: '0 4px' } } },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 999, backgroundColor: t.canvas },
          bar: { borderRadius: 999 },
        },
      },
    },
  });
}
