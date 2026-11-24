// ============================================================
//  INVENTIVE CRM — ENTERPRISE MULTI-THEME ENGINE
//  Curated, award-winning SaaS color combinations (Linear, Stripe, Supabase, Raycast)
//  Supports dynamic live theme & palette switching with 0ms reload.
// ============================================================

// ── Palette 1: Obsidian Indigo (Flagship — Linear / Stripe / Attio inspired) ──
const OBSIDIAN_INDIGO = {
    id: 'obsidian-indigo',
    name: 'Obsidian Indigo',
    description: 'Electric indigo on deep obsidian & crisp slate. Flagship enterprise style.',
    accentColor: '#6366F1',
    light: {
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        surfaceRaised: '#FFFFFF',
        surfaceHigh: '#F1F5F9',
        border: '#E2E8F0',
        borderSubtle: '#F1F5F9',
        borderHover: '#CBD5E1',
        textPrimary: '#0F172A',
        textSecondary: '#334155',
        textMuted: '#64748B',
        textInverse: '#FFFFFF',
        primary: '#4F46E5',
        primaryHover: '#4338CA',
        primaryDim: 'rgba(79, 70, 229, 0.12)',
        primaryFaint: 'rgba(79, 70, 229, 0.05)',
        primaryText: '#4F46E5',
        secondary: '#0F172A',
        secondaryDim: 'rgba(15, 23, 42, 0.08)',
        secondaryFaint: 'rgba(15, 23, 42, 0.04)',
        secondaryText: '#0F172A',
        tertiary: '#64748B',
        tertiaryDim: 'rgba(100, 116, 139, 0.10)',
        tertiaryFaint: 'rgba(100, 116, 139, 0.05)',
        tertiaryText: '#64748B',
        neutral: '#475569',
        neutralDim: 'rgba(71, 85, 105, 0.10)',
        neutralText: '#475569',
        success: '#10B981',
        successDim: 'rgba(16, 185, 129, 0.12)',
        successFaint: 'rgba(16, 185, 129, 0.06)',
        error: '#EF4444',
        errorDim: 'rgba(239, 68, 68, 0.12)',
        warning: '#F59E0B',
        warningDim: 'rgba(245, 158, 11, 0.12)',
        sidebar: '#FFFFFF',
        sidebarRaised: '#F8FAFC',
        sidebarHover: 'rgba(0, 0, 0, 0.04)',
        sidebarBorder: '#E2E8F0',
        sidebarText: '#64748B',
        sidebarTextHover: '#0F172A',
        sidebarActive: '#4F46E5',
        sidebarActiveText: '#4F46E5',
        progressGradEnd: '#6366F1',
        heroBgFrom: '#0B0F19',
        heroBgMid: '#1E1B4B',
        heroBgTo: '#0F172A',
        heroAccentGlow: 'rgba(99, 102, 241, 0.35)',
        heroOrb2: 'rgba(56, 189, 248, 0.15)',
        heroText: '#FFFFFF',
        heroSubText: 'rgba(224, 231, 255, 0.85)',
        heroBadgeBg: 'rgba(99, 102, 241, 0.25)',
        heroBadgeText: '#C7D2FE',
        heroBadgeBorder: 'rgba(165, 180, 252, 0.30)',
        avatarGradFrom: '#4F46E5',
        avatarGradTo: '#3730A3',
        avatarGlow: 'rgba(79, 70, 229, 0.50)',
        avatarBorderColor: '#0B0F19',
        onlineDot: '#10B981',
        superAdminColor: '#7C3AED',
        superAdminDim: 'rgba(124, 58, 237, 0.14)',
        superAdminFaint: 'rgba(124, 58, 237, 0.08)',
        superAdminLight: '#A78BFA',
        errorLight: '#FCA5A5',
        successLight: '#86EFAC',
        successLightBg: '#DCFCE7',
        completedAccent: '#10B981',
        activityEmail: '#10B981',
        activityMeeting: '#8B5CF6',
        activityNote: '#F59E0B',
        chartBlue: '#4F46E5',
        chartTeal: '#06B6D4',
        chartPink: '#EC4899',
        heroAccents: [
            { from: '#1E1B4B', to: '#4F46E5' },
            { from: '#312E81', to: '#6366F1' },
            { from: '#064E3B', to: '#10B981' },
            { from: '#581C87', to: '#8B5CF6' },
        ],
    },
    dark: {
        bg: '#080B11',
        surface: '#0F1523',
        surfaceRaised: '#161F33',
        surfaceHigh: '#1C2740',
        border: 'rgba(255, 255, 255, 0.08)',
        borderSubtle: 'rgba(255, 255, 255, 0.04)',
        borderHover: 'rgba(255, 255, 255, 0.14)',
        textPrimary: '#F8FAFC',
        textSecondary: '#CBD5E1',
        textMuted: '#94A3B8',
        textInverse: '#080B11',
        primary: '#6366F1',
        primaryHover: '#818CF8',
        primaryDim: 'rgba(99, 102, 241, 0.20)',
        primaryFaint: 'rgba(99, 102, 241, 0.08)',
        primaryText: '#818CF8',
        secondary: '#F8FAFC',
        secondaryDim: 'rgba(255, 255, 255, 0.10)',
        secondaryFaint: 'rgba(255, 255, 255, 0.05)',
        secondaryText: '#F8FAFC',
        tertiary: '#94A3B8',
        tertiaryDim: 'rgba(148, 163, 184, 0.12)',
        tertiaryFaint: 'rgba(148, 163, 184, 0.06)',
        tertiaryText: '#94A3B8',
        neutral: '#64748B',
        neutralDim: 'rgba(100, 116, 139, 0.12)',
        neutralText: '#94A3B8',
        success: '#10B981',
        successDim: 'rgba(16, 185, 129, 0.18)',
        successFaint: 'rgba(16, 185, 129, 0.08)',
        error: '#EF4444',
        errorDim: 'rgba(239, 68, 68, 0.18)',
        warning: '#F59E0B',
        warningDim: 'rgba(245, 158, 11, 0.18)',
        sidebar: '#0D111D',
        sidebarRaised: '#131929',
        sidebarHover: 'rgba(255, 255, 255, 0.05)',
        sidebarBorder: 'rgba(255, 255, 255, 0.08)',
        sidebarText: '#94A3B8',
        sidebarTextHover: '#FFFFFF',
        sidebarActive: '#6366F1',
        sidebarActiveText: '#818CF8',
        progressGradEnd: '#6366F1',
        heroBgFrom: '#06080E',
        heroBgMid: '#12162A',
        heroBgTo: '#080B11',
        heroAccentGlow: 'rgba(99, 102, 241, 0.30)',
        heroOrb2: 'rgba(56, 189, 248, 0.10)',
        heroText: '#FFFFFF',
        heroSubText: 'rgba(224, 231, 255, 0.78)',
        heroBadgeBg: 'rgba(99, 102, 241, 0.22)',
        heroBadgeText: '#818CF8',
        heroBadgeBorder: 'rgba(99, 102, 241, 0.35)',
        avatarGradFrom: '#6366F1',
        avatarGradTo: '#4338CA',
        avatarGlow: 'rgba(99, 102, 241, 0.45)',
        avatarBorderColor: '#06080E',
        onlineDot: '#10B981',
        superAdminColor: '#8B5CF6',
        superAdminDim: 'rgba(139, 92, 246, 0.18)',
        superAdminFaint: 'rgba(139, 92, 246, 0.10)',
        superAdminLight: '#A78BFA',
        errorLight: '#FCA5A5',
        successLight: '#86EFAC',
        successLightBg: 'rgba(16, 185, 129, 0.15)',
        completedAccent: '#10B981',
        activityEmail: '#10B981',
        activityMeeting: '#8B5CF6',
        activityNote: '#F59E0B',
        chartBlue: '#6366F1',
        chartTeal: '#06B6D4',
        chartPink: '#EC4899',
        heroAccents: [
            { from: '#1E1B4B', to: '#4F46E5' },
            { from: '#312E81', to: '#6366F1' },
            { from: '#064E3B', to: '#10B981' },
            { from: '#581C87', to: '#8B5CF6' },
        ],
    }
}

// ── Palette 2: Luxe Emerald (Supabase / High-Tech FinTech) ──
const LUXE_EMERALD = {
    id: 'luxe-emerald',
    name: 'Luxe Emerald',
    description: 'Postgres & Supabase emerald green with deep charcoal depth.',
    accentColor: '#10B981',
    light: {
        ...OBSIDIAN_INDIGO.light,
        primary: '#059669',
        primaryHover: '#047857',
        primaryDim: 'rgba(16, 185, 129, 0.14)',
        primaryFaint: 'rgba(16, 185, 129, 0.05)',
        primaryText: '#047857',
        sidebarActive: '#10B981',
        sidebarActiveText: '#047857',
        heroBgMid: '#064E3B',
        heroAccentGlow: 'rgba(16, 185, 129, 0.35)',
        heroBadgeText: '#A7F3D0',
        heroBadgeBg: 'rgba(16, 185, 129, 0.22)',
        avatarGradFrom: '#10B981',
        avatarGradTo: '#047857',
        avatarGlow: 'rgba(16, 185, 129, 0.45)',
        chartBlue: '#10B981',
    },
    dark: {
        ...OBSIDIAN_INDIGO.dark,
        bg: '#080A0E',
        surface: '#0E1319',
        surfaceRaised: '#131A22',
        surfaceHigh: '#19232F',
        border: 'rgba(255, 255, 255, 0.08)',
        borderSubtle: 'rgba(255, 255, 255, 0.04)',
        borderHover: 'rgba(16, 185, 129, 0.35)',
        primary: '#10B981',
        primaryHover: '#34D399',
        primaryDim: 'rgba(16, 185, 129, 0.18)',
        primaryFaint: 'rgba(16, 185, 129, 0.06)',
        primaryText: '#34D399',
        sidebar: '#0D1514',
        sidebarRaised: '#121E1C',
        sidebarActive: '#10B981',
        sidebarActiveText: '#A7F3D0',
        heroBgFrom: '#0D1514',
        heroBgMid: '#0A1813',
        heroBgTo: '#080A0E',
        heroAccentGlow: 'rgba(16, 185, 129, 0.30)',
        heroBadgeText: '#34D399',
        heroBadgeBg: 'rgba(16, 185, 129, 0.18)',
        avatarGradFrom: '#10B981',
        avatarGradTo: '#059669',
        avatarGlow: 'rgba(16, 185, 129, 0.45)',
        chartBlue: '#10B981',
    }
}

// ── Palette 3: Cyber Violet (Raycast / Modern Creative Tech) ──
const CYBER_VIOLET = {
    id: 'cyber-violet',
    name: 'Cyber Violet',
    description: 'Electric violet-purple on deep space night.',
    accentColor: '#8B5CF6',
    light: {
        ...OBSIDIAN_INDIGO.light,
        primary: '#7C3AED',
        primaryHover: '#6D28D9',
        primaryDim: 'rgba(139, 92, 246, 0.14)',
        primaryFaint: 'rgba(139, 92, 246, 0.05)',
        primaryText: '#7C3AED',
        sidebarActive: '#7C3AED',
        sidebarActiveText: '#7C3AED',
        heroBgMid: '#4C1D95',
        heroAccentGlow: 'rgba(139, 92, 246, 0.35)',
        heroBadgeText: '#DDD6FE',
        heroBadgeBg: 'rgba(139, 92, 246, 0.25)',
        avatarGradFrom: '#8B5CF6',
        avatarGradTo: '#6D28D9',
        avatarGlow: 'rgba(139, 92, 246, 0.45)',
        chartBlue: '#8B5CF6',
    },
    dark: {
        ...OBSIDIAN_INDIGO.dark,
        bg: '#080A0E',
        surface: '#0F131C',
        surfaceRaised: '#141A27',
        surfaceHigh: '#1C2335',
        border: 'rgba(255, 255, 255, 0.08)',
        borderSubtle: 'rgba(255, 255, 255, 0.04)',
        borderHover: 'rgba(139, 92, 246, 0.35)',
        primary: '#8B5CF6',
        primaryHover: '#A78BFA',
        primaryDim: 'rgba(139, 92, 246, 0.20)',
        primaryFaint: 'rgba(139, 92, 246, 0.07)',
        primaryText: '#A78BFA',
        sidebar: '#11101E',
        sidebarRaised: '#18152A',
        sidebarBorder: 'rgba(139, 92, 246, 0.15)',
        sidebarActive: '#8B5CF6',
        sidebarActiveText: '#C4B5FD',
        heroBgFrom: '#11101E',
        heroBgMid: '#161129',
        heroBgTo: '#080A0E',
        heroAccentGlow: 'rgba(139, 92, 246, 0.30)',
        heroBadgeText: '#C4B5FD',
        heroBadgeBg: 'rgba(139, 92, 246, 0.20)',
        avatarGradFrom: '#8B5CF6',
        avatarGradTo: '#7C3AED',
        avatarGlow: 'rgba(139, 92, 246, 0.45)',
        chartBlue: '#8B5CF6',
    }
}

// ── Palette 4: Oceanic Azure (Stripe Enterprise Classic Blue) ──
const OCEANIC_AZURE = {
    id: 'oceanic-azure',
    name: 'Oceanic Azure',
    description: 'Precision sapphire blue on high-contrast crisp surfaces.',
    accentColor: '#0284C7',
    light: {
        ...OBSIDIAN_INDIGO.light,
        primary: '#0284C7',
        primaryHover: '#0369A1',
        primaryDim: 'rgba(2, 132, 199, 0.14)',
        primaryFaint: 'rgba(2, 132, 199, 0.05)',
        primaryText: '#0369A1',
        sidebarActive: '#0284C7',
        sidebarActiveText: '#0284C7',
        heroBgMid: '#075985',
        heroAccentGlow: 'rgba(2, 132, 199, 0.35)',
        heroBadgeText: '#BAE6FD',
        heroBadgeBg: 'rgba(2, 132, 199, 0.22)',
        avatarGradFrom: '#0284C7',
        avatarGradTo: '#0369A1',
        avatarGlow: 'rgba(2, 132, 199, 0.45)',
        chartBlue: '#0284C7',
    },
    dark: {
        ...OBSIDIAN_INDIGO.dark,
        bg: '#080A0E',
        surface: '#0E131B',
        surfaceRaised: '#131A26',
        surfaceHigh: '#192334',
        border: 'rgba(255, 255, 255, 0.08)',
        borderSubtle: 'rgba(255, 255, 255, 0.04)',
        borderHover: 'rgba(56, 189, 248, 0.35)',
        primary: '#38BDF8',
        primaryHover: '#7DD3FC',
        primaryDim: 'rgba(56, 189, 248, 0.18)',
        primaryFaint: 'rgba(56, 189, 248, 0.06)',
        primaryText: '#7DD3FC',
        sidebar: '#0C141F',
        sidebarRaised: '#111D2D',
        sidebarBorder: 'rgba(56, 189, 248, 0.15)',
        sidebarActive: '#38BDF8',
        sidebarActiveText: '#BAE6FD',
        heroBgFrom: '#0C141F',
        heroBgMid: '#0A1728',
        heroBgTo: '#080A0E',
        heroAccentGlow: 'rgba(56, 189, 248, 0.30)',
        heroBadgeText: '#7DD3FC',
        heroBadgeBg: 'rgba(56, 189, 248, 0.18)',
        avatarGradFrom: '#0284C7',
        avatarGradTo: '#0369A1',
        avatarGlow: 'rgba(56, 189, 248, 0.45)',
        chartBlue: '#38BDF8',
    }
}

// ── Palette 5: Sunset Amber (Executive Bronze / Warm Tech) ──
const SUNSET_AMBER = {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    description: 'Sophisticated warm bronze and copper accents.',
    accentColor: '#F59E0B',
    light: {
        ...OBSIDIAN_INDIGO.light,
        primary: '#D97706',
        primaryHover: '#B45309',
        primaryDim: 'rgba(217, 119, 6, 0.14)',
        primaryFaint: 'rgba(217, 119, 6, 0.05)',
        primaryText: '#B45309',
        sidebarActive: '#D97706',
        sidebarActiveText: '#D97706',
        heroBgMid: '#78350F',
        heroAccentGlow: 'rgba(245, 158, 11, 0.35)',
        heroBadgeText: '#FDE68A',
        heroBadgeBg: 'rgba(217, 119, 6, 0.25)',
        avatarGradFrom: '#D97706',
        avatarGradTo: '#92400E',
        avatarGlow: 'rgba(217, 119, 6, 0.45)',
        chartBlue: '#D97706',
    },
    dark: {
        ...OBSIDIAN_INDIGO.dark,
        bg: '#080A0E',
        surface: '#0F131A',
        surfaceRaised: '#151B24',
        surfaceHigh: '#1D2430',
        border: 'rgba(255, 255, 255, 0.08)',
        borderSubtle: 'rgba(255, 255, 255, 0.04)',
        borderHover: 'rgba(245, 158, 11, 0.35)',
        primary: '#F59E0B',
        primaryHover: '#FBBF24',
        primaryDim: 'rgba(245, 158, 11, 0.18)',
        primaryFaint: 'rgba(245, 158, 11, 0.06)',
        primaryText: '#FDE68A',
        sidebar: '#141210',
        sidebarRaised: '#1E1915',
        sidebarBorder: 'rgba(245, 158, 11, 0.15)',
        sidebarActive: '#F59E0B',
        sidebarActiveText: '#FDE68A',
        heroBgFrom: '#141210',
        heroBgMid: '#18140B',
        heroBgTo: '#080A0E',
        heroAccentGlow: 'rgba(245, 158, 11, 0.28)',
        heroBadgeText: '#FDE68A',
        heroBadgeBg: 'rgba(245, 158, 11, 0.18)',
        avatarGradFrom: '#F59E0B',
        avatarGradTo: '#B45309',
        avatarGlow: 'rgba(245, 158, 11, 0.45)',
        chartBlue: '#F59E0B',
    }
}

// ── Palette 6: Crimson Rose (Modern Vibrant Tech) ──
const CRIMSON_ROSE = {
    id: 'crimson-rose',
    name: 'Crimson Rose',
    description: 'Vibrant ruby rose and crimson tech accents.',
    accentColor: '#F43F5E',
    light: {
        ...OBSIDIAN_INDIGO.light,
        primary: '#E11D48',
        primaryHover: '#BE123C',
        primaryDim: 'rgba(244, 63, 94, 0.14)',
        primaryFaint: 'rgba(244, 63, 94, 0.05)',
        primaryText: '#BE123C',
        sidebarActive: '#E11D48',
        sidebarActiveText: '#BE123C',
        heroBgMid: '#881337',
        heroAccentGlow: 'rgba(244, 63, 94, 0.35)',
        heroBadgeText: '#FECDD3',
        heroBadgeBg: 'rgba(244, 63, 94, 0.22)',
        avatarGradFrom: '#F43F5E',
        avatarGradTo: '#BE123C',
        avatarGlow: 'rgba(244, 63, 94, 0.45)',
        chartBlue: '#F43F5E',
    },
    dark: {
        ...OBSIDIAN_INDIGO.dark,
        bg: '#080A0E',
        surface: '#120F14',
        surfaceRaised: '#19151C',
        surfaceHigh: '#241E28',
        border: 'rgba(255, 255, 255, 0.08)',
        borderSubtle: 'rgba(255, 255, 255, 0.04)',
        borderHover: 'rgba(244, 63, 94, 0.35)',
        primary: '#FB7185',
        primaryHover: '#FDA4AF',
        primaryDim: 'rgba(244, 63, 94, 0.20)',
        primaryFaint: 'rgba(244, 63, 94, 0.07)',
        primaryText: '#FECDD3',
        sidebar: '#140E13',
        sidebarRaised: '#1D141C',
        sidebarBorder: 'rgba(244, 63, 94, 0.15)',
        sidebarActive: '#F43F5E',
        sidebarActiveText: '#FECDD3',
        heroBgFrom: '#140E13',
        heroBgMid: '#24101A',
        heroBgTo: '#080A0E',
        heroAccentGlow: 'rgba(244, 63, 94, 0.30)',
        heroBadgeText: '#FECDD3',
        heroBadgeBg: 'rgba(244, 63, 94, 0.20)',
        avatarGradFrom: '#F43F5E',
        avatarGradTo: '#E11D48',
        avatarGlow: 'rgba(244, 63, 94, 0.45)',
        chartBlue: '#FB7185',
    }
}

// ── Palette 7: Nordic Teal (Deep Sea & Pine) ──
const NORDIC_TEAL = {
    id: 'nordic-teal',
    name: 'Nordic Teal',
    description: 'Clean Scandinavian teal on deep pine surfaces.',
    accentColor: '#0D9488',
    light: {
        ...OBSIDIAN_INDIGO.light,
        primary: '#0D9488',
        primaryHover: '#0F766E',
        primaryDim: 'rgba(13, 148, 136, 0.14)',
        primaryFaint: 'rgba(13, 148, 136, 0.05)',
        primaryText: '#0F766E',
        sidebarActive: '#0D9488',
        sidebarActiveText: '#0F766E',
        heroBgMid: '#134E4A',
        heroAccentGlow: 'rgba(13, 148, 136, 0.35)',
        heroBadgeText: '#99F6E4',
        heroBadgeBg: 'rgba(13, 148, 136, 0.22)',
        avatarGradFrom: '#0D9488',
        avatarGradTo: '#0F766E',
        avatarGlow: 'rgba(13, 148, 136, 0.45)',
        chartBlue: '#0D9488',
    },
    dark: {
        ...OBSIDIAN_INDIGO.dark,
        bg: '#080A0E',
        surface: '#0E1416',
        surfaceRaised: '#131B1E',
        surfaceHigh: '#1A252A',
        border: 'rgba(255, 255, 255, 0.08)',
        borderSubtle: 'rgba(255, 255, 255, 0.04)',
        borderHover: 'rgba(13, 148, 136, 0.35)',
        primary: '#2DD4BF',
        primaryHover: '#5EEAD4',
        primaryDim: 'rgba(45, 212, 191, 0.18)',
        primaryFaint: 'rgba(45, 212, 191, 0.06)',
        primaryText: '#99F6E4',
        sidebar: '#0C1517',
        sidebarRaised: '#111D20',
        sidebarBorder: 'rgba(13, 148, 136, 0.15)',
        sidebarActive: '#2DD4BF',
        sidebarActiveText: '#99F6E4',
        heroBgFrom: '#0C1517',
        heroBgMid: '#0F2628',
        heroBgTo: '#080A0E',
        heroAccentGlow: 'rgba(45, 212, 191, 0.30)',
        heroBadgeText: '#99F6E4',
        heroBadgeBg: 'rgba(45, 212, 191, 0.18)',
        avatarGradFrom: '#0D9488',
        avatarGradTo: '#0F766E',
        avatarGlow: 'rgba(45, 212, 191, 0.45)',
        chartBlue: '#2DD4BF',
    }
}

export const CURATED_PALETTES = [
    OBSIDIAN_INDIGO,
    LUXE_EMERALD,
    CYBER_VIOLET,
    OCEANIC_AZURE,
    SUNSET_AMBER,
    CRIMSON_ROSE,
    NORDIC_TEAL,
]

// ── Dynamic Custom Theme Builder ────────────────────────────────
export function buildCustomPalette(config = {}) {
    const primary = config.primary || '#6366F1'
    const name = config.name || 'Custom Theme'
    const sidebarLight = config.sidebarLight || '#FFFFFF'
    const sidebarDark = config.sidebarDark || '#0D111D'
    const isSidebarWhiteLight = sidebarLight.toUpperCase() === '#FFFFFF' || sidebarLight.toUpperCase() === '#FFF'

    return {
        id: 'custom',
        name,
        description: 'Personalized user theme created in Settings',
        accentColor: primary,
        isCustom: true,
        config,
        light: {
            ...OBSIDIAN_INDIGO.light,
            primary: primary,
            primaryHover: primary,
            primaryDim: `${primary}22`,
            primaryFaint: `${primary}0D`,
            primaryText: primary,
            sidebar: sidebarLight,
            sidebarRaised: isSidebarWhiteLight ? '#F8FAFC' : '#1E293B',
            sidebarBorder: isSidebarWhiteLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
            sidebarText: isSidebarWhiteLight ? '#475569' : '#94A3B8',
            sidebarTextHover: isSidebarWhiteLight ? '#0F172A' : '#FFFFFF',
            sidebarActive: primary,
            sidebarActiveText: isSidebarWhiteLight ? primary : '#FFFFFF',
            avatarGradFrom: primary,
            avatarGradTo: primary,
            avatarGlow: `${primary}60`,
            chartBlue: primary,
            heroAccentGlow: `${primary}40`,
        },
        dark: {
            ...OBSIDIAN_INDIGO.dark,
            primary: primary,
            primaryHover: primary,
            primaryDim: `${primary}30`,
            primaryFaint: `${primary}15`,
            primaryText: primary,
            sidebar: sidebarDark,
            sidebarRaised: '#161F33',
            sidebarBorder: `${primary}25`,
            sidebarActive: primary,
            sidebarActiveText: primary,
            avatarGradFrom: primary,
            avatarGradTo: primary,
            avatarGlow: `${primary}60`,
            chartBlue: primary,
            heroAccentGlow: `${primary}35`,
        }
    }
}

export function getCustomThemeConfig() {
    try {
        const saved = localStorage.getItem('crm-custom-palette-config')
        if (saved) return JSON.parse(saved)
    } catch {}
    return {
        primary: '#6366F1',
        sidebarLight: '#FFFFFF',
        sidebarDark: '#0D111D',
        name: 'My Custom Theme'
    }
}

const PALETTE_MAP = {
    'obsidian-indigo': OBSIDIAN_INDIGO,
    'luxe-emerald': LUXE_EMERALD,
    'cyber-violet': CYBER_VIOLET,
    'oceanic-azure': OCEANIC_AZURE,
    'sunset-amber': SUNSET_AMBER,
    'crimson-rose': CRIMSON_ROSE,
    'nordic-teal': NORDIC_TEAL,
}

// Initialize custom theme from localStorage if present
try {
    const savedCustom = localStorage.getItem('crm-custom-palette-config')
    if (savedCustom) {
        PALETTE_MAP['custom'] = buildCustomPalette(JSON.parse(savedCustom))
    }
} catch {}

export function saveCustomTheme(config) {
    localStorage.setItem('crm-custom-palette-config', JSON.stringify(config))
    const customPalette = buildCustomPalette(config)
    PALETTE_MAP['custom'] = customPalette
    currentPaletteId = 'custom'
    localStorage.setItem('crm-palette', 'custom')
    window.dispatchEvent(new CustomEvent('crm-theme-changed', {
        detail: { mode: currentMode, palette: 'custom' }
    }))
}

export function resetCustomTheme() {
    localStorage.removeItem('crm-custom-palette-config')
    delete PALETTE_MAP['custom']
    setPaletteName('obsidian-indigo')
}

export function getAllPalettes() {
    const list = [...CURATED_PALETTES]
    if (PALETTE_MAP['custom']) {
        list.push(PALETTE_MAP['custom'])
    }
    return list
}

// ── State Persistence & Live Broadcast ─────────────────────────
let currentMode = localStorage.getItem('crm-theme') || 'light'
let currentPaletteId = localStorage.getItem('crm-palette') || 'obsidian-indigo'

export function getThemeName() {
    return currentMode
}

export function getPaletteName() {
    return currentPaletteId
}

export function setThemeName(mode) {
    currentMode = mode === 'dark' ? 'dark' : 'light'
    localStorage.setItem('crm-theme', currentMode)
    window.dispatchEvent(new CustomEvent('crm-theme-changed', {
        detail: { mode: currentMode, palette: currentPaletteId }
    }))
}

export function setPaletteName(paletteId) {
    if (PALETTE_MAP[paletteId]) {
        currentPaletteId = paletteId
        localStorage.setItem('crm-palette', currentPaletteId)
        window.dispatchEvent(new CustomEvent('crm-theme-changed', {
            detail: { mode: currentMode, palette: currentPaletteId }
        }))
    }
}

export function toggleTheme() {
    setThemeName(currentMode === 'light' ? 'dark' : 'light')
}

// Transparent Proxy resolving active theme & palette tokens in 0ms
export const T = new Proxy({}, {
    get(target, prop) {
        const palette = PALETTE_MAP[currentPaletteId] || OBSIDIAN_INDIGO
        const activeTokens = currentMode === 'dark' ? palette.dark : palette.light
        return activeTokens[prop]
    }
})

// ── Enterprise Typography & Appearance Customization Engine ────
export const AVAILABLE_FONTS = [
    {
        id: 'manrope',
        name: 'Manrope',
        category: 'Modern Geometric Sans',
        value: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
        sample: 'The quick brown fox jumps over the lazy dog',
        badge: 'Default Flagship',
    },
    {
        id: 'inter',
        name: 'Inter',
        category: 'Clean Corporate Sans',
        value: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        sample: 'Clean, legible corporate design standard',
        badge: 'Stripe & GitHub',
    },
    {
        id: 'plus-jakarta-sans',
        name: 'Plus Jakarta Sans',
        category: 'Vibrant SaaS Tech',
        value: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        sample: 'Modern geometric curves and punchy titles',
        badge: 'Supabase & Linear',
    },
    {
        id: 'outfit',
        name: 'Outfit',
        category: 'Executive & Editorial',
        value: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
        sample: 'Sophisticated luxury and refined fintech style',
        badge: 'FinTech Modern',
    },
    {
        id: 'space-grotesk',
        name: 'Space Grotesk',
        category: 'Cyber Tech & Bold',
        value: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
        sample: 'High-tech engineering and distinctive tech personality',
        badge: 'Cyber Tech',
    },
    {
        id: 'system',
        name: 'System UI',
        category: 'Native OS',
        value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        sample: 'Native platform performance and familiar look',
        badge: 'Native OS',
    },
    {
        id: 'jetbrains-mono',
        name: 'JetBrains Mono',
        category: 'Developer & Data',
        value: "'JetBrains Mono', monospace",
        sample: 'Precision technical font for data analytics',
        badge: 'Code & Data',
    },
]

export const FONT_SCALES = [
    { id: 'compact', name: 'Compact Density', scale: '13px', percentage: '92%', description: 'High information density for lists, pipelines, and tables' },
    { id: 'default', name: 'Balanced (Default)', scale: '14px', percentage: '100%', description: 'Standard enterprise readability and proportion' },
    { id: 'comfortable', name: 'Comfortable', scale: '15px', percentage: '108%', description: 'Larger text and breathing room for relaxed reading' },
    { id: 'large', name: 'Large & Accessible', scale: '16px', percentage: '115%', description: 'High legibility and enhanced accessibility' },
]

export const LETTER_SPACINGS = [
    { id: 'tight', name: 'Tight (-0.02em)', value: '-0.02em', description: 'Punchy modern SaaS tracking' },
    { id: 'normal', name: 'Balanced (-0.01em)', value: '-0.01em', description: 'Standard balanced kerning' },
    { id: 'relaxed', name: 'Relaxed (0.01em)', value: '0.01em', description: 'Open, clean breathing room' },
]

export const BORDER_RADII = [
    { id: 'sharp', name: 'Sharp (6px)', value: '6px', description: 'Bloomberg Terminal & AWS console style' },
    { id: 'balanced', name: 'Balanced (12px)', value: '12px', description: 'Modern enterprise SaaS standard' },
    { id: 'rounded', name: 'Soft Rounded (18px)', value: '18px', description: 'Friendly modern fintech curves' },
    { id: 'pill', name: 'Ultra Pill (24px)', value: '24px', description: 'Maximum smooth rounded aesthetic' },
]

export const ELEVATION_MODES = [
    { id: 'flat', name: 'Clean & Flat', description: 'Hairline borders with minimal shadows' },
    { id: 'modern', name: 'Modern Layered (Default)', description: 'Soft ambient depth with balanced shadows' },
    { id: 'high-contrast', name: 'High Contrast', description: 'Prominent borders and clear component separation' },
]

export function getAppearanceConfig() {
    try {
        const saved = localStorage.getItem('crm-appearance-config')
        if (saved) return JSON.parse(saved)
    } catch {}
    return {
        fontFamily: 'manrope',
        fontSize: 'default',
        letterSpacing: 'normal',
        borderRadius: 'balanced',
        elevation: 'modern',
    }
}

export function saveAppearanceConfig(config) {
    localStorage.setItem('crm-appearance-config', JSON.stringify(config))
    applyAppearanceConfig(config)
    window.dispatchEvent(new CustomEvent('crm-appearance-changed', { detail: config }))
}

export function applyAppearanceConfig(config) {
    if (!config) config = getAppearanceConfig()
    const root = document.documentElement

    // Font Family
    const fontObj = AVAILABLE_FONTS.find(f => f.id === config.fontFamily) || AVAILABLE_FONTS[0]
    root.style.setProperty('--crm-font-family', fontObj.value)

    // Font Size
    const scaleObj = FONT_SCALES.find(s => s.id === config.fontSize) || FONT_SCALES[1]
    root.style.setProperty('--crm-font-size-base', scaleObj.scale)

    // Letter Spacing
    const letterObj = LETTER_SPACINGS.find(l => l.id === config.letterSpacing) || LETTER_SPACINGS[1]
    root.style.setProperty('--crm-letter-spacing', letterObj.value)

    // Border Radius
    const radiusObj = BORDER_RADII.find(r => r.id === config.borderRadius) || BORDER_RADII[1]
    root.style.setProperty('--crm-radius-base', radiusObj.value)

    // Elevation / Contrast class on root
    root.classList.remove('elevation-flat', 'elevation-modern', 'elevation-high-contrast')
    root.classList.add(`elevation-${config.elevation || 'modern'}`)
}

export function resetAppearanceConfig() {
    localStorage.removeItem('crm-appearance-config')
    const defaults = {
        fontFamily: 'manrope',
        fontSize: 'default',
        letterSpacing: 'normal',
        borderRadius: 'balanced',
        elevation: 'modern',
    }
    applyAppearanceConfig(defaults)
    window.dispatchEvent(new CustomEvent('crm-appearance-changed', { detail: defaults }))
    return defaults
}

// Automatically apply saved appearance on initial module load
if (typeof document !== 'undefined') {
    try {
        applyAppearanceConfig(getAppearanceConfig())
    } catch {}
}

// ── Typography ──────────────────────────────────────────────
export const FONT = {
    base: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
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
    radiusSm: '8px',
    radius: '12px',
    radiusMd: '14px',
    radiusLg: '18px',
    radiusXl: '24px',
    radiusFull: '9999px',
}

// ── Elevation Shadows (Soft layered ambient shadows) ────────
export const SHADOW = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    md: '0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 35px -8px rgba(0, 0, 0, 0.12), 0 10px 15px -5px rgba(0, 0, 0, 0.06)',
    glow: (color) => `0 0 20px ${color || 'rgba(99, 102, 241, 0.35)'}`,
}

// ── Data & Domain Constants ──────────────────────────────────
export const ROW_COLORS = [
    'transparent',
    'rgba(255, 255, 255, 0.015)',
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
    NEW: { accent: '#64748B', badgeBg: 'rgba(100, 116, 139, 0.12)', badgeColor: '#64748B' },
    QUALIFIED: { accent: '#6366F1', badgeBg: 'rgba(99, 102, 241, 0.12)', badgeColor: '#6366F1' },
    PROPOSAL: { accent: '#0EA5E9', badgeBg: 'rgba(14, 165, 233, 0.12)', badgeColor: '#0EA5E9' },
    WON: { accent: '#10B981', badgeBg: 'rgba(16, 185, 129, 0.12)', badgeColor: '#10B981' },
    LOST: { accent: '#EF4444', badgeBg: 'rgba(239, 68, 68, 0.12)', badgeColor: '#EF4444' },
}

export const TAG_COLORS = {
    'High-Value': { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366F1' },
    'Low-Value': { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748B' },
    'Enterprise': { bg: 'rgba(236, 72, 153, 0.12)', color: '#EC4899' },
    'Small Business': { bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981' },
    'Mid-Market': { bg: 'rgba(14, 165, 233, 0.12)', color: '#0EA5E9' },
}

export const ACTIVITY_STYLES = {
    CALL: { icon: 'call', bg: 'rgba(99, 102, 241, 0.12)', color: '#6366F1' },
    EMAIL: { icon: 'mail', bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981' },
    NOTE: { icon: 'sticky_note_2', bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' },
    MEETING: { icon: 'groups', bg: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6' },
}

export const TAGS = ['High-Value', 'Low-Value', 'Enterprise', 'Small Business', 'Mid-Market']
export const EMPLOYEE_RANGES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '10000+']
export const ACTIVITY_TYPES = ['CALL', 'EMAIL', 'NOTE', 'MEETING']

export const NAV_GROUPS = [
    {
        id: 'sales',
        label: 'Sales & Pipeline',
        items: [
            { to: '/leads', icon: 'person_search', label: 'Leads' },
            { to: '/deals', icon: 'handshake', label: 'Deals' },
            { to: '/accounts', icon: 'business', label: 'Accounts' },
            { to: '/contacts', icon: 'groups', label: 'Contacts' },
        ],
    },
    {
        id: 'communication',
        label: 'Communication',
        items: [
            { to: '/activities', icon: 'event_note', label: 'Activities' },
            { to: '/calendar', icon: 'calendar_month', label: 'Calendar' },
            { to: '/calls', icon: 'call', label: 'Calls' },
            { to: '/conversations', icon: 'forum', label: 'Conversations' },
            { to: '/chat', icon: 'chat', label: 'Internal Chat' },
        ],
    },
    {
        id: 'organization',
        label: 'Organization & Data',
        adminOnly: true,
        items: [
            { to: '/org', icon: 'corporate_fare', label: 'Organization', adminOnly: true },
            { to: '/documents', icon: 'description', label: 'Documents', adminOnly: true },
            { to: '/de-duplication', icon: 'cleaning_services', label: 'De-Duplication', adminOnly: true },
        ],
    },
    {
        id: 'system',
        label: 'System & Support',
        items: [
            { to: '/settings', icon: 'settings', label: 'Settings' },
            { to: '/erp', icon: 'account_balance', label: 'Accounting & ERP', adminOnly: true },
            { to: '/support', icon: 'contact_support', label: 'Support' },
            { to: '/audit-log', icon: 'history', label: 'Audit Log', adminOnly: true },
            { to: '/privacy', icon: 'privacy_tip', label: 'Privacy & Compliance', adminOnly: true },
        ],
    },
]

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
    { to: '/org', icon: 'corporate_fare', label: 'Organization' },
    { to: '/documents', icon: 'description', label: 'Documents' },
    { to: '/de-duplication', icon: 'cleaning_services', label: 'De-Duplication' },
    { to: '/erp', icon: 'account_balance', label: 'Accounting & ERP', adminOnly: true },
    { to: '/settings', icon: 'settings', label: 'Settings' },
]
