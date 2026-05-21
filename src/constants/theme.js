// ============================================================
//  NEXUS CRM — CENTRALIZED THEME
//  30 COLOR OPTIONS BELOW — uncomment ONE block at a time
//  Search for "ACTIVE THEME" to find the currently active one
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


// Theme 29: Canary & Charcoal (High Contrast Clean)
// export const T = {
//     bg: '#FAFAFA', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
//     surfaceHigh: '#EBEBEB', border: '#D6D6D6', borderSubtle: '#F2F2F2',
//     textPrimary: '#1A1A1A', textSecondary: '#4D4D4D', textMuted: '#808080',
//     textInverse: '#FFFFFF',
//     primary: '#EAB308', primaryHover: '#CA8A04', primaryDim: 'rgba(234,179,8,0.15)',
//     primaryFaint: 'rgba(234,179,8,0.07)', primaryText: '#CA8A04',
//     secondary: '#1A1A1A', secondaryDim: 'rgba(26,26,26,0.12)',
//     secondaryFaint: 'rgba(26,26,26,0.06)', secondaryText: '#1A1A1A',
//     tertiary: '#737373', tertiaryDim: 'rgba(115,115,115,0.12)',
//     tertiaryFaint: 'rgba(115,115,115,0.06)', tertiaryText: '#737373',
//     neutral: '#404040', neutralDim: 'rgba(64,64,64,0.12)', neutralText: '#404040',
//     success: '#16A34A', successDim: 'rgba(22,163,74,0.12)', successFaint: 'rgba(22,163,74,0.06)',
//     error: '#DC2626', errorDim: 'rgba(220,38,38,0.12)',
//     warning: '#EAB308', warningDim: 'rgba(234,179,8,0.12)',
//     sidebar: '#1A1A1A', sidebarRaised: '#262626', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#A3A3A3',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#EAB308',
//     // ── Hero banner tokens ─────────────────────────────────
//     heroBgFrom: '#1A1A1A', heroBgMid: '#262626', heroBgTo: '#111111',
//     heroAccentGlow: 'rgba(234,179,8,0.30)', heroOrb2: 'rgba(255,255,255,0.06)',
//     heroText: '#FFFFFF', heroSubText: 'rgba(255,255,255,0.65)',
//     heroBadgeBg: 'rgba(234,179,8,0.20)', heroBadgeText: '#FDE68A', heroBadgeBorder: 'rgba(234,179,8,0.30)',
//     avatarGradFrom: '#CA8A04', avatarGradTo: '#92400E',
//     avatarGlow: 'rgba(234,179,8,0.45)',
//     avatarBorderColor: '#111111',
//     onlineDot: '#22C55E',
// }

// ── ACTIVE THEME: Indigo & Slate (Modern Professional) ───────────────────────────────
// export const T = {
//     bg: '#EFF6FF', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
//     surfaceHigh: '#DBEAFE', border: '#BFDBFE', borderSubtle: '#DBEAFE',
//     textPrimary: '#0A1628', textSecondary: '#1E3A8A', textMuted: '#2563EB',
//     textInverse: '#FFFFFF',
//     primary: '#2563EB', primaryHover: '#1D4ED8', primaryDim: 'rgba(37,99,235,0.15)',
//     primaryFaint: 'rgba(37,99,235,0.07)', primaryText: '#1D4ED8',
//     secondary: '#0A1628', secondaryDim: 'rgba(10,22,40,0.10)',
//     secondaryFaint: 'rgba(10,22,40,0.05)', secondaryText: '#0A1628',
//     tertiary: '#64748B', tertiaryDim: 'rgba(100,116,139,0.12)',
//     tertiaryFaint: 'rgba(100,116,139,0.06)', tertiaryText: '#64748B',
//     neutral: '#334155', neutralDim: 'rgba(51,65,85,0.12)', neutralText: '#334155',
//     success: '#16A34A', successDim: 'rgba(22,163,74,0.12)', successFaint: 'rgba(22,163,74,0.06)',
//     error: '#DC2626', errorDim: 'rgba(220,38,38,0.12)',
//     warning: '#D97706', warningDim: 'rgba(217,119,6,0.12)',
//     sidebar: '#0A1628', sidebarRaised: '#112240', sidebarHover: 'rgba(147,197,253,0.08)',
//     sidebarBorder: 'rgba(147,197,253,0.10)', sidebarText: '#93C5FD',
//     sidebarTextHover: '#DBEAFE', sidebarActive: '#3B82F6',
//     // ── Hero banner tokens ─────────────────────────────────
//     heroBgFrom: '#0A1628', heroBgMid: '#112240', heroBgTo: '#0A1628',
//     heroAccentGlow: 'rgba(37,99,235,0.35)', heroOrb2: 'rgba(96,165,250,0.10)',
//     heroText: '#FFFFFF', heroSubText: 'rgba(147,197,253,0.80)',
//     heroBadgeBg: 'rgba(37,99,235,0.30)', heroBadgeText: '#93C5FD', heroBadgeBorder: 'rgba(147,197,253,0.20)',
//     avatarGradFrom: '#2563EB', avatarGradTo: '#1D4ED8',
//     avatarGlow: 'rgba(37,99,235,0.50)',
//     avatarBorderColor: '#0A1628',
//     onlineDot: '#22C55E',
// }

// Theme 7: Graphite & Sky
// export const T = {
//     bg: '#F8FAFC', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
//     surfaceHigh: '#F1F5F9', border: '#CBD5E1', borderSubtle: '#E2E8F0',
//     textPrimary: '#0F172A', textSecondary: '#334155', textMuted: '#64748B',
//     textInverse: '#FFFFFF',
//     primary: '#0EA5E9', primaryHover: '#0284C7', primaryDim: 'rgba(14,165,233,0.15)',
//     primaryFaint: 'rgba(14,165,233,0.07)', primaryText: '#0284C7',
//     secondary: '#1B1D24', secondaryDim: 'rgba(27,29,36,0.10)',
//     secondaryFaint: 'rgba(27,29,36,0.05)', secondaryText: '#1B1D24',
//     tertiary: '#64748B', tertiaryDim: 'rgba(100,116,139,0.12)',
//     tertiaryFaint: 'rgba(100,116,139,0.06)', tertiaryText: '#64748B',
//     neutral: '#334155', neutralDim: 'rgba(51,65,85,0.12)', neutralText: '#334155',
//     success: '#16A34A', successDim: 'rgba(22,163,74,0.12)', successFaint: 'rgba(22,163,74,0.06)',
//     error: '#DC2626', errorDim: 'rgba(220,38,38,0.12)',
//     warning: '#D97706', warningDim: 'rgba(217,119,6,0.12)',
//     sidebar: '#1B1D24', sidebarRaised: '#272A35', sidebarHover: 'rgba(125,211,252,0.08)',
//     sidebarBorder: 'rgba(125,211,252,0.10)', sidebarText: '#7DD3FC',
//     sidebarTextHover: '#E0F2FE', sidebarActive: '#38BDF8',
//     // ── Hero banner tokens ─────────────────────────────────
//     heroBgFrom: '#1B1D24', heroBgMid: '#272A35', heroBgTo: '#1B1D24',
//     heroAccentGlow: 'rgba(14,165,233,0.35)', heroOrb2: 'rgba(125,211,252,0.10)',
//     heroText: '#FFFFFF', heroSubText: 'rgba(125,211,252,0.80)',
//     heroBadgeBg: 'rgba(14,165,233,0.25)', heroBadgeText: '#7DD3FC', heroBadgeBorder: 'rgba(125,211,252,0.20)',
//     avatarGradFrom: '#0EA5E9', avatarGradTo: '#0284C7',
//     avatarGlow: 'rgba(14,165,233,0.50)',
//     avatarBorderColor: '#1B1D24',
//     onlineDot: '#22C55E',
// }

// ── ACTIVE THEME: Steel & Tangerine ──────────────────────────
export const T = {
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
    // Controls the gradient banner used on all profile/list pages
    heroBgFrom: '#1A1E2A',     // gradient start
    heroBgMid: '#2d1a0e',      // gradient mid
    heroBgTo: '#1a0d05',       // gradient end
    heroAccentGlow: 'rgba(234,88,12,0.35)',   // primary-colored radial glow orb
    heroOrb2: 'rgba(253,186,116,0.10)',        // secondary soft orb
    heroText: '#FFFFFF',                        // h1 / name on banner
    heroSubText: 'rgba(253,186,116,0.85)',      // subtitle / email on banner
    heroBadgeBg: 'rgba(234,88,12,0.28)',       // role/type badge background
    heroBadgeText: '#FDBA74',                  // role/type badge text
    heroBadgeBorder: 'rgba(253,186,116,0.25)', // role/type badge border
    // ── Avatar gradient & glow ─────────────────────────────────
    avatarGradFrom: '#EA580C',  // avatar circle gradient start
    avatarGradTo: '#9A3412',    // avatar circle gradient end
    avatarGlow: 'rgba(234,88,12,0.50)', // avatar drop-shadow color
    avatarBorderColor: '#1A1E2A',       // online-dot border matches banner bg
    onlineDot: '#22C55E',              // online indicator dot color
    // ── Sidebar active text & indicator ───────────────────────
    sidebarActiveText: '#FDBA74',       // active nav item text / border-left indicator
    progressGradEnd: '#FB923C',         // progress bar gradient end color
    // ── Role badge colors ─────────────────────────────────────
    // Purple = SUPER_ADMIN role accent (stays purple across all themes — it's a role identity color)
    superAdminColor: '#7C3AED',         // SUPER_ADMIN text / icon color
    superAdminDim: 'rgba(139,92,246,0.15)',  // SUPER_ADMIN badge background
    superAdminFaint: 'rgba(124,58,237,0.10)', // SUPER_ADMIN very faint tint
    superAdminLight: '#A78BFA',         // SUPER_ADMIN light text on dark bg
    // ── Status light colors (light versions of semantic colors) ─
    errorLight: '#FCA5A5',              // light red text on dark/error backgrounds
    successLight: '#86EFAC',            // light green text on dark/success backgrounds
    successLightBg: '#DCFCE7',          // very light green badge background
    completedAccent: '#4ADE80',         // bright green for completed state on dark banners
    // ── Activity type colors (for TopBar search & timeline) ───
    activityEmail: '#10b981',           // EMAIL activity accent
    activityMeeting: '#8b5cf6',         // MEETING activity accent
    activityNote: '#f59e0b',            // NOTE activity accent
    // ── Chart accent colors (secondary data series) ────────────
    chartBlue: '#2563EB',              // primary data series
    chartTeal: '#538D8D',              // secondary data series
    chartPink: '#DB2777',              // tertiary data series
    // ── Hero accent gradients (cycling avatar tints) ───────────
    // Used by ContactProfile / AccountProfile avatar hero banners
    heroAccents: [
        { from: '#1e3a8a', to: '#1e40af' },   // blue
        { from: '#6b21a8', to: '#7C3AED'  },  // purple
        { from: '#065f46', to: '#0f766e'  },  // teal
        { from: '#7c2d12', to: '#c2410c'  },  // amber-brown
    ],
}


// Theme 11: Nordic Frost
// export const T = {
//     bg: '#F0FDFF', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
//     surfaceHigh: '#CFFAFE', border: '#A5F3FC', borderSubtle: '#CFFAFE',
//     textPrimary: '#083344', textSecondary: '#164E63', textMuted: '#06B6D4',
//     textInverse: '#FFFFFF',
//     primary: '#06B6D4', primaryHover: '#0891B2', primaryDim: 'rgba(6,182,212,0.15)',
//     primaryFaint: 'rgba(6,182,212,0.07)', primaryText: '#0891B2',
//     secondary: '#1C2B3A', secondaryDim: 'rgba(28,43,58,0.10)',
//     secondaryFaint: 'rgba(28,43,58,0.05)', secondaryText: '#1C2B3A',
//     tertiary: '#64748B', tertiaryDim: 'rgba(100,116,139,0.12)',
//     tertiaryFaint: 'rgba(100,116,139,0.06)', tertiaryText: '#64748B',
//     neutral: '#334155', neutralDim: 'rgba(51,65,85,0.12)', neutralText: '#334155',
//     success: '#16A34A', successDim: 'rgba(22,163,74,0.12)', successFaint: 'rgba(22,163,74,0.06)',
//     error: '#DC2626', errorDim: 'rgba(220,38,38,0.12)',
//     warning: '#D97706', warningDim: 'rgba(217,119,6,0.12)',
//     sidebar: '#1C2B3A', sidebarRaised: '#2A3F52', sidebarHover: 'rgba(165,243,252,0.08)',
//     sidebarBorder: 'rgba(165,243,252,0.10)', sidebarText: '#A5F3FC',
//     sidebarTextHover: '#CFFAFE', sidebarActive: '#67E8F9',
//     // ── Hero banner tokens ─────────────────────────────────
//     heroBgFrom: '#1C2B3A', heroBgMid: '#2A3F52', heroBgTo: '#1C2B3A',
//     heroAccentGlow: 'rgba(6,182,212,0.35)', heroOrb2: 'rgba(165,243,252,0.10)',
//     heroText: '#FFFFFF', heroSubText: 'rgba(165,243,252,0.80)',
//     heroBadgeBg: 'rgba(6,182,212,0.25)', heroBadgeText: '#A5F3FC', heroBadgeBorder: 'rgba(165,243,252,0.20)',
//     avatarGradFrom: '#06B6D4', avatarGradTo: '#0891B2',
//     avatarGlow: 'rgba(6,182,212,0.50)',
//     avatarBorderColor: '#1C2B3A',
//     onlineDot: '#22C55E',
// }


// Theme 14: Obsidian & Gold
// export const T = {
//     bg: '#FFFDF5', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
//     surfaceHigh: '#FEF9C3', border: '#FDE68A', borderSubtle: '#FEF9C3',
//     textPrimary: '#0A0A0A', textSecondary: '#4A3700', textMuted: '#A16207',
//     textInverse: '#FFFFFF',
//     primary: '#F59E0B', primaryHover: '#D97706', primaryDim: 'rgba(245,158,11,0.15)',
//     primaryFaint: 'rgba(245,158,11,0.07)', primaryText: '#D97706',
//     secondary: '#0F0F0F', secondaryDim: 'rgba(15,15,15,0.10)',
//     secondaryFaint: 'rgba(15,15,15,0.05)', secondaryText: '#0F0F0F',
//     tertiary: '#78716C', tertiaryDim: 'rgba(120,113,108,0.12)',
//     tertiaryFaint: 'rgba(120,113,108,0.06)', tertiaryText: '#78716C',
//     neutral: '#44403C', neutralDim: 'rgba(68,64,60,0.12)', neutralText: '#44403C',
//     success: '#16A34A', successDim: 'rgba(22,163,74,0.12)', successFaint: 'rgba(22,163,74,0.06)',
//     error: '#DC2626', errorDim: 'rgba(220,38,38,0.12)',
//     warning: '#D97706', warningDim: 'rgba(217,119,6,0.12)',
//     sidebar: '#0F0F0F', sidebarRaised: '#1A1A1A', sidebarHover: 'rgba(252,211,77,0.08)',
//     sidebarBorder: 'rgba(252,211,77,0.10)', sidebarText: '#FCD34D',
//     sidebarTextHover: '#FEF9C3', sidebarActive: '#FBBF24',
//     // ── Hero banner tokens ─────────────────────────────────
//     heroBgFrom: '#0F0F0F', heroBgMid: '#1A1A1A', heroBgTo: '#0A0A0A',
//     heroAccentGlow: 'rgba(245,158,11,0.35)', heroOrb2: 'rgba(252,211,77,0.10)',
//     heroText: '#FFFFFF', heroSubText: 'rgba(252,211,77,0.85)',
//     heroBadgeBg: 'rgba(245,158,11,0.25)', heroBadgeText: '#FCD34D', heroBadgeBorder: 'rgba(252,211,77,0.25)',
//     avatarGradFrom: '#F59E0B', avatarGradTo: '#D97706',
//     avatarGlow: 'rgba(245,158,11,0.50)',
//     avatarBorderColor: '#0F0F0F',
//     onlineDot: '#22C55E',
// }




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
    { to: '/calls', icon: 'call', label: 'Calls' },
    { to: '/conversations', icon: 'forum', label: 'Conversations' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
]