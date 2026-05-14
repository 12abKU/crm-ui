// ============================================================
//  NEXUS CRM — CENTRALIZED THEME
//  Change anything here → updates everywhere automatically
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

// ── Semantic Tokens ─────────────────────────────────────────
// These are what you use in components. Change the palette
// value above → all components update automatically.

export const T = {
    // Page & surface backgrounds
    bg: PALETTE.cream100,   // main page background
    surface: PALETTE.white,      // cards, panels
    surfaceRaised: PALETTE.cream50,   // slightly elevated surface
    surfaceHigh: PALETTE.cream200,   // hover states, table row hover

    // Sidebar (always dark slate)
    sidebar: PALETTE.slate800,
    sidebarRaised: PALETTE.slate700,
    sidebarHover: 'rgba(255,255,255,0.07)',
    sidebarBorder: 'rgba(255,255,255,0.08)',
    sidebarText: PALETTE.slate400,
    sidebarTextHover: PALETTE.white,
    sidebarActive: PALETTE.blue600,   // ← change to PALETTE.teal600 for teal active

    // Borders
    border: PALETTE.cream200,
    borderSubtle: PALETTE.cream50,

    // Text
    textPrimary: PALETTE.slate800,
    textSecondary: PALETTE.slate500,
    textMuted: PALETTE.slate400,
    textInverse: PALETTE.white,

    // Brand — Primary (Blue)
    primary: PALETTE.blue600,
    primaryHover: PALETTE.blue700,
    primaryDim: PALETTE.blue100,
    primaryFaint: PALETTE.blue50,
    primaryText: PALETTE.blue600,

    // Brand — Secondary (Teal)
    secondary: PALETTE.teal600,
    secondaryDim: PALETTE.teal100,
    secondaryFaint: PALETTE.teal50,
    secondaryText: PALETTE.teal600,

    // Brand — Tertiary (Pink)
    tertiary: PALETTE.pink400,
    tertiaryDim: PALETTE.pink100,
    tertiaryFaint: PALETTE.pink50,
    tertiaryText: PALETTE.pink600,

    // Neutral
    neutral: PALETTE.stone600,
    neutralDim: PALETTE.stone100,
    neutralText: PALETTE.stone600,

    // States
    success: PALETTE.green600,
    successDim: PALETTE.green100,
    successFaint: PALETTE.green50,
    error: PALETTE.red600,
    errorDim: PALETTE.red100,
    warning: PALETTE.amber600,
    warningDim: PALETTE.amber100,
}

// ── Typography ──────────────────────────────────────────────
export const FONT = {
    base: "'Manrope', sans-serif",
    sizes: {
        xs: '11px',
        sm: '13px',
        base: '14px',
        md: '15px',
        lg: '18px',
        xl: '22px',
        xxl: '28px',
        hero: '36px',
    },
    weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
    },
}

// ── Spacing & Shape ─────────────────────────────────────────
export const SHAPE = {
    radiusSm: '6px',
    radius: '10px',
    radiusMd: '12px',
    radiusLg: '16px',
    radiusXl: '20px',
    radiusFull: '9999px',
}

// ── Shadows ─────────────────────────────────────────────────
export const SHADOW = {
    sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    md: '0 4px 12px rgba(0,0,0,0.08)',
    lg: '0 8px 24px rgba(0,0,0,0.10)',
    xl: '0 16px 40px rgba(0,0,0,0.12)',
    // Colored shadows for primary buttons
    primary: '0 2px 8px rgba(37,99,235,0.25)',
    primaryHover: '0 4px 14px rgba(37,99,235,0.35)',
}

// ── Data & Domain Constants ──────────────────────────────────
export const ROW_COLORS = [
    PALETTE.blue100,
    PALETTE.teal100,
    PALETTE.pink100,
    PALETTE.stone100,
]

export const STAGES = ['NEW', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']
export const STAGE_LABELS = {
    NEW: 'New', QUALIFIED: 'Qualified', PROPOSAL: 'Proposal', WON: 'Won', LOST: 'Lost'
}
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
export const EMPLOYEE_RANGES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000']
export const ACTIVITY_TYPES = ['CALL', 'EMAIL', 'NOTE', 'MEETING']

export const NAV_LINKS = [
    { to: '/', icon: 'dashboard', label: 'Dashboard' },
    { to: '/accounts', icon: 'business', label: 'Accounts' },
    { to: '/contacts', icon: 'groups', label: 'Contacts' },
    { to: '/deals', icon: 'handshake', label: 'Deals' },
    { to: '/activities', icon: 'event_note', label: 'Activities' },
    { to: '/conversations', icon: 'forum', label: 'Conversations' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
]