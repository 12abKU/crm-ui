// ============================================================
//  NEXUS CRM — CENTRALIZED THEME
//  Uncomment ONE export block at a time to switch the theme.
//  Search for "ACTIVE THEME" to find the currently active one.
// ============================================================

// ── Core Palette ────────────────────────────────────────────
const PALETTE = {
    // Blue
    blue900: '#1E3A8A',
    blue700: '#1D4ED8',
    blue600: '#2563EB',
    blue400: '#60A5FA',
    blue100: 'rgba(37,99,235,0.10)',
    blue50: 'rgba(37,99,235,0.05)',

    // Teal
    teal700: '#2E6B6B',
    teal600: '#538D8D',
    teal400: '#7EC8C8',
    teal100: 'rgba(83,141,141,0.12)',
    teal50: 'rgba(83,141,141,0.06)',

    // Pink
    pink600: '#DB2777',
    pink400: '#F472B6',
    pink100: 'rgba(244,114,182,0.12)',
    pink50: 'rgba(244,114,182,0.06)',

    // Green
    green700: '#15803D',
    green600: '#16A34A',
    green100: 'rgba(22,163,74,0.10)',
    green50: 'rgba(22,163,74,0.05)',

    // Red
    red600: '#DC2626',
    red100: 'rgba(220,38,38,0.10)',

    // Amber
    amber600: '#D97706',
    amber100: 'rgba(217,119,6,0.12)',

    // Neutrals (warm)
    stone600: '#78716C',
    stone100: 'rgba(120,113,108,0.12)',

    // Slate (sidebar)
    slate900: '#0F172A',
    slate800: '#1E293B',
    slate700: '#334155',
    slate500: '#64748B',
    slate400: '#94A3B8',
    slate200: '#E2E8F0',

    // Warm cream (page bg)
    cream200: '#E8DDD4',
    cream100: '#F0EBE3',
    cream50: '#F8F5F1',

    // White
    white: '#FFFFFF',
}


// ============================================================
//  ██████╗  ██████╗ ██╗      ██████╗ ██████╗     ████████╗██╗  ██╗███████╗███╗   ███╗███████╗███████╗
//  ██╔════╝ ██╔═══██╗██║     ██╔═══██╗██╔══██╗    ╚══██╔══╝██║  ██║██╔════╝████╗ ████║██╔════╝██╔════╝
//  ██║      ██║   ██║██║     ██║   ██║██████╔╝       ██║   ███████║█████╗  ██╔████╔██║█████╗  ███████╗
//  ██║      ██║   ██║██║     ██║   ██║██╔══██╗       ██║   ██╔══██║██╔══╝  ██║╚██╔╝██║██╔══╝  ╚════██║
//  ╚██████╗ ╚██████╔╝███████╗╚██████╔╝██║  ██║       ██║   ██║  ██║███████╗██║ ╚═╝ ██║███████╗███████║
//   ╚═════╝  ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝       ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝╚══════╝
//




// ── Theme 1: Steel & Tangerine (Light) ───────────────────────
const LIGHT_THEME = {
    bg: '#FFF7ED', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
    surfaceHigh: '#FFEDD5', border: '#FED7AA', borderSubtle: '#FFEDD5',
    textPrimary: '#0C0A08', textSecondary: '#7C2D12', textMuted: '#EA580C',
    textInverse: '#FFFFFF',
    primary: '#EA580C', primaryHover: '#C2410C', primaryDim: 'rgba(234,88,12,0.15)',
    primaryFaint: 'rgba(234,88,12,0.07)', primaryText: '#C2410C',
    secondary: '#1A1E2A', secondaryDim: 'rgba(26,30,42,0.10)',
    secondaryFaint: 'rgba(26,30,42,0.05)', secondaryText: '#1A1E2A',
    tertiary: '#64748B', tertiaryDim: 'rgba(100,116,139,0.12)',
    tertiaryFaint: 'rgba(100,116,139,0.06)', tertiaryText: '#64748B',
    neutral: '#334155', neutralDim: 'rgba(51,65,85,0.12)', neutralText: '#334155',
    success: '#16A34A', successDim: 'rgba(22,163,74,0.12)', successFaint: 'rgba(22,163,74,0.06)',
    error: '#DC2626', errorDim: 'rgba(220,38,38,0.12)',
    warning: '#D97706', warningDim: 'rgba(217,119,6,0.12)',
    sidebar: '#1A1E2A', sidebarRaised: '#272D3F', sidebarHover: 'rgba(253,186,116,0.08)',
    sidebarBorder: 'rgba(253,186,116,0.10)', sidebarText: '#FDBA74',
    sidebarTextHover: '#FFEDD5', sidebarActive: '#FB923C',
    // ── Hero banner tokens ─────────────────────────────────────
    heroBgFrom: '#1A1E2A', heroBgMid: '#2d1a0e', heroBgTo: '#1a0d05',
    heroAccentGlow: 'rgba(234,88,12,0.35)', heroOrb2: 'rgba(253,186,116,0.10)',
    heroText: '#FFFFFF', heroSubText: 'rgba(253,186,116,0.85)',
    heroBadgeBg: 'rgba(234,88,12,0.28)', heroBadgeText: '#FDBA74', heroBadgeBorder: 'rgba(253,186,116,0.25)',
    avatarGradFrom: '#EA580C', avatarGradTo: '#9A3412',
    avatarGlow: 'rgba(234,88,12,0.50)', avatarBorderColor: '#1A1E2A', onlineDot: '#22C55E',
    // ── Sidebar active & progress ──────────────────────────────
    sidebarActiveText: '#FDBA74', progressGradEnd: '#FB923C',
    // ── Role badge colors ──────────────────────────────────────
    superAdminColor: '#7C3AED', superAdminDim: 'rgba(139,92,246,0.15)',
    superAdminFaint: 'rgba(124,58,237,0.10)', superAdminLight: '#A78BFA',
    // ── Status light colors ────────────────────────────────────
    errorLight: '#FCA5A5', successLight: '#86EFAC', successLightBg: '#DCFCE7',
    completedAccent: '#4ADE80',
    // ── Activity type colors ───────────────────────────────────
    activityEmail: '#10b981', activityMeeting: '#8b5cf6', activityNote: '#f59e0b',
    // ── Chart colors ──────────────────────────────────────────
    chartBlue: '#2563EB', chartTeal: '#538D8D', chartPink: '#DB2777',
    // ── Hero accent gradients (cycling avatar tints) ───────────
    heroAccents: [
        { from: '#1e3a8a', to: '#1e40af' },
        { from: '#6b21a8', to: '#7C3AED' },
        { from: '#065f46', to: '#0f766e' },
        { from: '#7c2d12', to: '#c2410c' },
    ],
}

const DARK_THEME = {
    bg: '#0A0D16', surface: '#161B26', surfaceRaised: '#1D2433',
    surfaceHigh: '#232B3C', border: '#2A3347', borderSubtle: '#232B3C',
    textPrimary: '#F8FAFC', textSecondary: '#E2E8F0', textMuted: '#94A3B8',
    textInverse: '#0A0D16',
    primary: '#FF6B2B', primaryHover: '#E05315', primaryDim: 'rgba(255, 107, 43, 0.15)',
    primaryFaint: 'rgba(255, 107, 43, 0.08)', primaryText: '#FF6B2B',
    secondary: '#F8FAFC', secondaryDim: 'rgba(255,255,255,0.10)',
    secondaryFaint: 'rgba(255,255,255,0.05)', secondaryText: '#F8FAFC',
    tertiary: '#94A3B8', tertiaryDim: 'rgba(148,163,184,0.12)',
    tertiaryFaint: 'rgba(148,163,184,0.06)', tertiaryText: '#94A3B8',
    neutral: '#64748B', neutralDim: 'rgba(100,116,139,0.12)', neutralText: '#94A3B8',
    success: '#10B981', successDim: 'rgba(16,185,129,0.12)', successFaint: 'rgba(16,185,129,0.06)',
    error: '#EF4444', errorDim: 'rgba(239,68,68,0.12)',
    warning: '#F59E0B', warningDim: 'rgba(245,158,11,0.12)',
    sidebar: '#090D16', sidebarRaised: '#111622', sidebarHover: 'rgba(255,107,43,0.08)',
    sidebarBorder: 'rgba(255,255,255,0.08)', sidebarText: '#94A3B8',
    sidebarTextHover: '#F8FAFC', sidebarActive: '#FF6B2B',
    heroBgFrom: '#090D16', heroBgMid: '#1A1512', heroBgTo: '#0A0D16',
    heroAccentGlow: 'rgba(255,107,43,0.25)', heroOrb2: 'rgba(99,102,241,0.10)',
    heroText: '#FFFFFF', heroSubText: 'rgba(248,250,252,0.80)',
    heroBadgeBg: 'rgba(255,107,43,0.20)', heroBadgeText: '#FF6B2B', heroBadgeBorder: 'rgba(255,107,43,0.15)',
    avatarGradFrom: '#FF6B2B', avatarGradTo: '#E05315',
    avatarGlow: 'rgba(255,107,43,0.40)', avatarBorderColor: '#090D16', onlineDot: '#10B981',
    sidebarActiveText: '#FF6B2B', progressGradEnd: '#FF6B2B',
    superAdminColor: '#8B5CF6', superAdminDim: 'rgba(139,92,246,0.15)',
    superAdminFaint: 'rgba(139,92,246,0.10)', superAdminLight: '#A78BFA',
    errorLight: '#FCA5A5', successLight: '#86EFAC', successLightBg: '#DCFCE7',
    completedAccent: '#10B981',
    activityEmail: '#10b981', activityMeeting: '#8b5cf6', activityNote: '#f59e0b',
    chartBlue: '#3B82F6', chartTeal: '#14B8A6', chartPink: '#EC4899',
    heroAccents: [
        { from: '#1e3a8a', to: '#1e40af' },
        { from: '#6b21a8', to: '#7C3AED' },
        { from: '#065f46', to: '#0f766e' },
        { from: '#7c2d12', to: '#c2410c' },
    ],
}

let currentTheme = localStorage.getItem('crm-theme') || 'light';

export function getThemeName() {
    return currentTheme;
}

export function setThemeName(name) {
    currentTheme = name;
    localStorage.setItem('crm-theme', name);
    window.dispatchEvent(new CustomEvent('crm-theme-changed', { detail: name }));
}

export function toggleTheme() {
    setThemeName(currentTheme === 'light' ? 'dark' : 'light');
}

export const T = new Proxy({}, {
    get(target, prop) {
        const active = currentTheme === 'dark' ? DARK_THEME : LIGHT_THEME;
        return active[prop];
    }
});




// ── Typography ──────────────────────────────────────────────
export const FONT = {
    base: "'Manrope', sans-serif",
    sizes: {
        xs: '11px', sm: '13px', base: '14px', md: '15px',
        lg: '18px', xl: '22px', xxl: '28px', hero: '36px',
    },
    weights: {
        normal: 400, medium: 500, semibold: 600,
        bold: 700, extrabold: 800, black: 900,
    },
}

// ── Spacing & Shape ─────────────────────────────────────────
export const SHAPE = {
    radiusSm: '6px', radius: '10px', radiusMd: '12px',
    radiusLg: '16px', radiusXl: '20px', radiusFull: '9999px',
}

// ── Shadows ─────────────────────────────────────────────────
export const SHADOW = {
    sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    md: '0 4px 12px rgba(0,0,0,0.08)',
    lg: '0 8px 24px rgba(0,0,0,0.10)',
    xl: '0 16px 40px rgba(0,0,0,0.12)',
    primary: '0 2px 8px rgba(37,99,235,0.25)',
    primaryHover: '0 4px 14px rgba(37,99,235,0.35)',
}

// ── Data & Domain Constants ──────────────────────────────────
export const ROW_COLORS = [
    PALETTE.blue100, PALETTE.teal100, PALETTE.pink100, PALETTE.stone100,
]

export const STAGES = ['NEW', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']
export const STAGE_LABELS = {
    NEW: 'New', QUALIFIED: 'Qualified', PROPOSAL: 'Proposal', WON: 'Won', LOST: 'Lost'
}
export const LOST_DEAL_REASONS = [
    'Price too high',
    'Chose competitor',
    'No budget',
    'No response',
    'Bad timing',
    'Missing feature',
    'Other',
]
export const STAGE_STYLES = {
    NEW: { accent: PALETTE.stone600, badgeBg: PALETTE.stone100, badgeColor: PALETTE.stone600 },
    QUALIFIED: { accent: PALETTE.blue600, badgeBg: PALETTE.blue100, badgeColor: PALETTE.blue600 },
    PROPOSAL: { accent: PALETTE.teal600, badgeBg: PALETTE.teal100, badgeColor: PALETTE.teal600 },
    WON: { accent: PALETTE.green600, badgeBg: PALETTE.green100, badgeColor: PALETTE.green600 },
    LOST: { accent: PALETTE.red600, badgeBg: PALETTE.red100, badgeColor: PALETTE.red600 },
}

export const TAG_COLORS = {
    'High-Value': { bg: PALETTE.blue100, color: PALETTE.blue600 },
    'Low-Value': { bg: PALETTE.stone100, color: PALETTE.stone600 },
    'Enterprise': { bg: PALETTE.pink100, color: PALETTE.pink600 },
    'Small Business': { bg: PALETTE.green100, color: PALETTE.green600 },
    'Mid-Market': { bg: PALETTE.teal100, color: PALETTE.teal600 },
}

export const ACTIVITY_STYLES = {
    CALL: { icon: 'call', bg: PALETTE.blue100, color: PALETTE.blue600 },
    EMAIL: { icon: 'mail', bg: PALETTE.teal100, color: PALETTE.teal600 },
    NOTE: { icon: 'sticky_note_2', bg: PALETTE.pink100, color: PALETTE.pink600 },
    MEETING: { icon: 'groups', bg: PALETTE.green100, color: PALETTE.green600 },
}

export const TAGS = ['High-Value', 'Low-Value', 'Enterprise', 'Small Business', 'Mid-Market']
export const EMPLOYEE_RANGES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '10000+']
export const ACTIVITY_TYPES = ['CALL', 'EMAIL', 'NOTE', 'MEETING']

export const NAV_LINKS = [
    { to: '/', icon: 'dashboard', label: 'Dashboard' },
    { to: '/accounts', icon: 'business', label: 'Accounts' },
    { to: '/contacts', icon: 'groups', label: 'Contacts' },
    { to: '/leads', icon: 'person_search', label: 'Leads' },
    { to: '/deals', icon: 'handshake', label: 'Deals' },
    { to: '/activities', icon: 'event_note', label: 'Activities' },
    { to: '/calendar', icon: 'calendar_month', label: 'Calendar' },
    { to: '/calls', icon: 'call', label: 'Calls' },
    { to: '/conversations', icon: 'forum', label: 'Conversations' },
    { to: '/chat', icon: 'chat', label: 'Internal Chat' },
    { to: '/documents', icon: 'description', label: 'Documents' },
    { to: '/de-duplication', icon: 'cleaning_services', label: 'De-Duplication' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
]
