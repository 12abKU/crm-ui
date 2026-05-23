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


// ── Theme 11: Nordic Frost ────────────────────────────────────
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
//     avatarGlow: 'rgba(6,182,212,0.50)', avatarBorderColor: '#1C2B3A', onlineDot: '#22C55E',
//     // ── Sidebar active & progress ──────────────────────────
//     sidebarActiveText: '#A5F3FC', progressGradEnd: '#67E8F9',
//     // ── Role badge colors ──────────────────────────────────
//     superAdminColor: '#7C3AED', superAdminDim: 'rgba(139,92,246,0.15)',
//     superAdminFaint: 'rgba(124,58,237,0.10)', superAdminLight: '#A78BFA',
//     // ── Status light colors ────────────────────────────────
//     errorLight: '#FCA5A5', successLight: '#86EFAC', successLightBg: '#DCFCE7',
//     completedAccent: '#4ADE80',
//     // ── Activity type colors ───────────────────────────────
//     activityEmail: '#10b981', activityMeeting: '#8b5cf6', activityNote: '#f59e0b',
//     // ── Chart colors ──────────────────────────────────────
//     chartBlue: '#2563EB', chartTeal: '#538D8D', chartPink: '#DB2777',
//     // ── Hero accent gradients (cycling avatar tints) ───────
//     heroAccents: [
//         { from: '#1e3a8a', to: '#1e40af' },
//         { from: '#6b21a8', to: '#7C3AED' },
//         { from: '#065f46', to: '#0f766e' },
//         { from: '#7c2d12', to: '#c2410c' },
//     ],
// }










// ── Theme E: Deep Navy & Coral ────────────────────────────────
// Deep navy-blue sidebar, warm coral primary. Trustworthy yet energetic.
// export const T = {
//     bg: '#FFF8F5', surface: '#FFFFFF', surfaceRaised: '#FFF4EE',
//     surfaceHigh: '#FFEADF', border: '#F4C4AE', borderSubtle: '#FDDDD0',
//     textPrimary: '#180A04', textSecondary: '#7C2D12', textMuted: '#9A4520',
//     textInverse: '#FFFFFF',
//     primary: '#E05A38', primaryHover: '#C44B2C', primaryDim: 'rgba(224,90,56,0.15)',
//     primaryFaint: 'rgba(224,90,56,0.07)', primaryText: '#C44B2C',
//     secondary: '#0B1829', secondaryDim: 'rgba(11,24,41,0.10)',
//     secondaryFaint: 'rgba(11,24,41,0.05)', secondaryText: '#0B1829',
//     tertiary: '#5E6E7A', tertiaryDim: 'rgba(94,110,122,0.12)',
//     tertiaryFaint: 'rgba(94,110,122,0.06)', tertiaryText: '#5E6E7A',
//     neutral: '#2E3E4A', neutralDim: 'rgba(46,62,74,0.12)', neutralText: '#2E3E4A',
//     success: '#16A34A', successDim: 'rgba(22,163,74,0.12)', successFaint: 'rgba(22,163,74,0.06)',
//     error: '#DC2626', errorDim: 'rgba(220,38,38,0.12)',
//     warning: '#D97706', warningDim: 'rgba(217,119,6,0.12)',
//     sidebar: '#0B1829', sidebarRaised: '#14273E', sidebarHover: 'rgba(253,186,116,0.08)',
//     sidebarBorder: 'rgba(253,186,116,0.10)', sidebarText: '#FBB07A',
//     sidebarTextHover: '#FDDDC0', sidebarActive: '#FB923C',
//     heroBgFrom: '#0B1829', heroBgMid: '#16283E', heroBgTo: '#071020',
//     heroAccentGlow: 'rgba(224,90,56,0.38)', heroOrb2: 'rgba(253,186,116,0.10)',
//     heroText: '#FFFFFF', heroSubText: 'rgba(253,186,116,0.88)',
//     heroBadgeBg: 'rgba(224,90,56,0.30)', heroBadgeText: '#FBB07A', heroBadgeBorder: 'rgba(253,186,116,0.25)',
//     avatarGradFrom: '#E05A38', avatarGradTo: '#9A3412',
//     avatarGlow: 'rgba(224,90,56,0.50)', avatarBorderColor: '#0B1829', onlineDot: '#22C55E',
//     sidebarActiveText: '#FBB07A', progressGradEnd: '#FB923C',
//     superAdminColor: '#7C3AED', superAdminDim: 'rgba(139,92,246,0.15)',
//     superAdminFaint: 'rgba(124,58,237,0.10)', superAdminLight: '#A78BFA',
//     errorLight: '#FCA5A5', successLight: '#86EFAC', successLightBg: '#DCFCE7',
//     completedAccent: '#4ADE80',
//     activityEmail: '#10b981', activityMeeting: '#8b5cf6', activityNote: '#f59e0b',
//     chartBlue: '#2563EB', chartTeal: '#538D8D', chartPink: '#DB2777',
//     heroAccents: [
//         { from: '#1e3a8a', to: '#1e40af' },
//         { from: '#6b21a8', to: '#7C3AED' },
//         { from: '#065f46', to: '#0f766e' },
//         { from: '#7c2d12', to: '#c2410c' },
//     ],
// }








// ── Theme L: Ash & Burgundy ───────────────────────────────────
// Dark ash-charcoal sidebar, deep muted burgundy. Aged wine cellar, velvety.
// export const T = {
//     bg: '#F8F4F4', surface: '#FFFFFF', surfaceRaised: '#F4EEEE',
//     surfaceHigh: '#EDE4E4', border: '#D4C4C4', borderSubtle: '#E8DCDC',
//     textPrimary: '#1E1414', textSecondary: '#3C2020', textMuted: '#785050',
//     textInverse: '#FFFFFF',
//     primary: '#7D3040', primaryHover: '#6A2535', primaryDim: 'rgba(125,48,64,0.15)',
//     primaryFaint: 'rgba(125,48,64,0.07)', primaryText: '#6A2535',
//     secondary: '#1E1A1A', secondaryDim: 'rgba(30,26,26,0.10)',
//     secondaryFaint: 'rgba(30,26,26,0.05)', secondaryText: '#1E1A1A',
//     tertiary: '#785060', tertiaryDim: 'rgba(120,80,96,0.12)',
//     tertiaryFaint: 'rgba(120,80,96,0.06)', tertiaryText: '#785060',
//     neutral: '#4C3038', neutralDim: 'rgba(76,48,56,0.12)', neutralText: '#4C3038',
//     success: '#4A7050', successDim: 'rgba(74,112,80,0.15)', successFaint: 'rgba(74,112,80,0.07)',
//     error: '#9A2A2A', errorDim: 'rgba(154,42,42,0.12)',
//     warning: '#8A6420', warningDim: 'rgba(138,100,32,0.12)',
//     sidebar: '#1E1818', sidebarRaised: '#2A2020', sidebarHover: 'rgba(200,160,160,0.08)',
//     sidebarBorder: 'rgba(200,160,160,0.10)', sidebarText: '#C09090',
//     sidebarTextHover: '#D8B4B4', sidebarActive: '#A86070',
//     heroBgFrom: '#1E1818', heroBgMid: '#2A1820', heroBgTo: '#141010',
//     heroAccentGlow: 'rgba(125,48,64,0.42)', heroOrb2: 'rgba(200,160,160,0.10)',
//     heroText: '#FFFFFF', heroSubText: 'rgba(214,180,184,0.90)',
//     heroBadgeBg: 'rgba(125,48,64,0.32)', heroBadgeText: '#C09090', heroBadgeBorder: 'rgba(200,160,160,0.25)',
//     avatarGradFrom: '#7D3040', avatarGradTo: '#4E1824',
//     avatarGlow: 'rgba(125,48,64,0.45)', avatarBorderColor: '#1E1818', onlineDot: '#4A8A50',
//     sidebarActiveText: '#C09090', progressGradEnd: '#A86070',
//     superAdminColor: '#7C3AED', superAdminDim: 'rgba(139,92,246,0.15)',
//     superAdminFaint: 'rgba(124,58,237,0.10)', superAdminLight: '#A78BFA',
//     errorLight: '#D49090', successLight: '#90C090', successLightBg: '#D4ECD4',
//     completedAccent: '#70B070',
//     activityEmail: '#5A8A70', activityMeeting: '#8b5cf6', activityNote: '#8A6420',
//     chartBlue: '#5A6A8A', chartTeal: '#5A7A70', chartPink: '#9A4A5A',
//     heroAccents: [
//         { from: '#2C3A5A', to: '#3A4E6E' },
//         { from: '#5C2C4A', to: '#7A3C60' },
//         { from: '#2C4A3A', to: '#3A6050' },
//         { from: '#5A3018', to: '#7A4020' },
//     ],
// }


// ── Theme M: Charcoal & Brick ─────────────────────────────────
// Deep charcoal sidebar, muted brick-red primary. Raw industrial, workshop feel.
// export const T = {
//     bg: '#F6F3F0', surface: '#FFFFFF', surfaceRaised: '#F2EDE8',
//     surfaceHigh: '#E8E0D8', border: '#CCC0B0', borderSubtle: '#DED8D0',
//     textPrimary: '#1C1814', textSecondary: '#3A2C22', textMuted: '#706050',
//     textInverse: '#FFFFFF',
//     primary: '#9A4A32', primaryHover: '#843D28', primaryDim: 'rgba(154,74,50,0.15)',
//     primaryFaint: 'rgba(154,74,50,0.07)', primaryText: '#843D28',
//     secondary: '#1C1A18', secondaryDim: 'rgba(28,26,24,0.10)',
//     secondaryFaint: 'rgba(28,26,24,0.05)', secondaryText: '#1C1A18',
//     tertiary: '#706050', tertiaryDim: 'rgba(112,96,80,0.12)',
//     tertiaryFaint: 'rgba(112,96,80,0.06)', tertiaryText: '#706050',
//     neutral: '#4A3C30', neutralDim: 'rgba(74,60,48,0.12)', neutralText: '#4A3C30',
//     success: '#4E6E48', successDim: 'rgba(78,110,72,0.15)', successFaint: 'rgba(78,110,72,0.07)',
//     error: '#9A3030', errorDim: 'rgba(154,48,48,0.12)',
//     warning: '#8A6830', warningDim: 'rgba(138,104,48,0.12)',
//     sidebar: '#1C1814', sidebarRaised: '#28221C', sidebarHover: 'rgba(196,160,128,0.08)',
//     sidebarBorder: 'rgba(196,160,128,0.10)', sidebarText: '#C09070',
//     sidebarTextHover: '#D8B090', sidebarActive: '#B07050',
//     heroBgFrom: '#1C1814', heroBgMid: '#261A10', heroBgTo: '#120E08',
//     heroAccentGlow: 'rgba(154,74,50,0.42)', heroOrb2: 'rgba(196,160,128,0.10)',
//     heroText: '#FFFFFF', heroSubText: 'rgba(210,182,158,0.90)',
//     heroBadgeBg: 'rgba(154,74,50,0.32)', heroBadgeText: '#C09070', heroBadgeBorder: 'rgba(196,160,128,0.25)',
//     avatarGradFrom: '#9A4A32', avatarGradTo: '#5C2814',
//     avatarGlow: 'rgba(154,74,50,0.45)', avatarBorderColor: '#1C1814', onlineDot: '#4E8A48',
//     sidebarActiveText: '#C09070', progressGradEnd: '#B07050',
//     superAdminColor: '#7C3AED', superAdminDim: 'rgba(139,92,246,0.15)',
//     superAdminFaint: 'rgba(124,58,237,0.10)', superAdminLight: '#A78BFA',
//     errorLight: '#D49080', successLight: '#90C090', successLightBg: '#D4ECD4',
//     completedAccent: '#70B070',
//     activityEmail: '#5A8A70', activityMeeting: '#8b5cf6', activityNote: '#8A6830',
//     chartBlue: '#5A6E8A', chartTeal: '#5A7A70', chartPink: '#9A5050',
//     heroAccents: [
//         { from: '#2C3A5A', to: '#3A4E6E' },
//         { from: '#5C2C4A', to: '#7A3C60' },
//         { from: '#2C4A3A', to: '#3A6050' },
//         { from: '#5A3018', to: '#7A4020' },
//     ],
// }




// ── Theme P: Espresso & Dusty Plum ───────────────────────────
// Deep espresso-brown sidebar, muted dusty plum. Coffee and linen, warm & moody.
// export const T = {
//     bg: '#F6F4F8', surface: '#FFFFFF', surfaceRaised: '#F2EEF6',
//     surfaceHigh: '#EAE4F0', border: '#C8BAD8', borderSubtle: '#DDD4EC',
//     textPrimary: '#1C1424', textSecondary: '#342048', textMuted: '#685880',
//     textInverse: '#FFFFFF',
//     primary: '#6A4E7A', primaryHover: '#5A4068', primaryDim: 'rgba(106,78,122,0.15)',
//     primaryFaint: 'rgba(106,78,122,0.07)', primaryText: '#5A4068',
//     secondary: '#1C1018', secondaryDim: 'rgba(28,16,24,0.10)',
//     secondaryFaint: 'rgba(28,16,24,0.05)', secondaryText: '#1C1018',
//     tertiary: '#685880', tertiaryDim: 'rgba(104,88,128,0.12)',
//     tertiaryFaint: 'rgba(104,88,128,0.06)', tertiaryText: '#685880',
//     neutral: '#3C2E4A', neutralDim: 'rgba(60,46,74,0.12)', neutralText: '#3C2E4A',
//     success: '#4A6A50', successDim: 'rgba(74,106,80,0.15)', successFaint: 'rgba(74,106,80,0.07)',
//     error: '#8A3040', errorDim: 'rgba(138,48,64,0.12)',
//     warning: '#7A5A20', warningDim: 'rgba(122,90,32,0.12)',
//     sidebar: '#1C1018', sidebarRaised: '#281A24', sidebarHover: 'rgba(196,176,220,0.08)',
//     sidebarBorder: 'rgba(196,176,220,0.10)', sidebarText: '#B098CC',
//     sidebarTextHover: '#CCBAE0', sidebarActive: '#9078B4',
//     heroBgFrom: '#1C1018', heroBgMid: '#241428', heroBgTo: '#140C14',
//     heroAccentGlow: 'rgba(106,78,122,0.42)', heroOrb2: 'rgba(196,176,220,0.10)',
//     heroText: '#FFFFFF', heroSubText: 'rgba(206,188,228,0.90)',
//     heroBadgeBg: 'rgba(106,78,122,0.32)', heroBadgeText: '#B098CC', heroBadgeBorder: 'rgba(196,176,220,0.25)',
//     avatarGradFrom: '#6A4E7A', avatarGradTo: '#3C2450',
//     avatarGlow: 'rgba(106,78,122,0.45)', avatarBorderColor: '#1C1018', onlineDot: '#4A8A50',
//     sidebarActiveText: '#B098CC', progressGradEnd: '#9078B4',
//     superAdminColor: '#7C3AED', superAdminDim: 'rgba(139,92,246,0.15)',
//     superAdminFaint: 'rgba(124,58,237,0.10)', superAdminLight: '#A78BFA',
//     errorLight: '#D490A0', successLight: '#90C090', successLightBg: '#D4ECD4',
//     completedAccent: '#70B070',
//     activityEmail: '#5A8870', activityMeeting: '#8b5cf6', activityNote: '#7A5A20',
//     chartBlue: '#5A5A8A', chartTeal: '#5A7A70', chartPink: '#9A4A6A',
//     heroAccents: [
//         { from: '#2C3A5A', to: '#3A4E6E' },
//         { from: '#5C2C4A', to: '#7A3C60' },
//         { from: '#2C4A3A', to: '#3A6050' },
//         { from: '#5A3018', to: '#7A4020' },
//     ],
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
