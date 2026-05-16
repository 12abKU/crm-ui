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

// export const T = {
//     bg: PALETTE.cream100,
//     surface: PALETTE.white,
//     surfaceRaised: PALETTE.cream50,
//     surfaceHigh: PALETTE.cream200,
//     border: PALETTE.cream200,
//     borderSubtle: PALETTE.cream50,
//     textPrimary: PALETTE.slate800,
//     textSecondary: PALETTE.slate500,
//     textMuted: PALETTE.slate400,
//     textInverse: PALETTE.white,
//     primary: PALETTE.blue600,
//     primaryHover: PALETTE.blue700,
//     primaryDim: PALETTE.blue100,
//     primaryFaint: PALETTE.blue50,
//     primaryText: PALETTE.blue600,
//     secondary: PALETTE.teal600,
//     secondaryDim: PALETTE.teal100,
//     secondaryFaint: PALETTE.teal50,
//     secondaryText: PALETTE.teal600,
//     tertiary: PALETTE.pink400,
//     tertiaryDim: PALETTE.pink100,
//     tertiaryFaint: PALETTE.pink50,
//     tertiaryText: PALETTE.pink600,
//     neutral: PALETTE.stone600,
//     neutralDim: PALETTE.stone100,
//     neutralText: PALETTE.stone600,
//     success: PALETTE.green600,
//     successDim: PALETTE.green100,
//     successFaint: PALETTE.green50,
//     error: PALETTE.red600,
//     errorDim: PALETTE.red100,
//     warning: PALETTE.amber600,
//     warningDim: PALETTE.amber100,
//     sidebar: PALETTE.slate800,
//     sidebarRaised: PALETTE.slate700,
//     sidebarHover: 'rgba(255,255,255,0.07)',
//     sidebarBorder: 'rgba(255,255,255,0.08)',
//     sidebarText: PALETTE.slate400,
//     sidebarTextHover: PALETTE.white,
//     sidebarActive: PALETTE.blue600,
// }



// ── OPTION 31 — Warm Linen
// Sidebar: Warm taupe | Content: Soft linen white
// export const T = {
//     bg: '#F7F3EE', surface: '#FFFFFF', surfaceRaised: '#FBF9F6',
//     surfaceHigh: '#EDE6DC', border: '#DDD5C8', borderSubtle: '#F2EDE6',
//     textPrimary: '#2C2218', textSecondary: '#6B5744', textMuted: '#A08878',
//     textInverse: '#FFFFFF',
//     primary: '#8B6347', primaryHover: '#6E4D36', primaryDim: 'rgba(139,99,71,0.12)',
//     primaryFaint: 'rgba(139,99,71,0.06)', primaryText: '#8B6347',
//     secondary: '#6B8E6E', secondaryDim: 'rgba(107,142,110,0.12)',
//     secondaryFaint: 'rgba(107,142,110,0.06)', secondaryText: '#6B8E6E',
//     tertiary: '#A0788A', tertiaryDim: 'rgba(160,120,138,0.12)',
//     tertiaryFaint: 'rgba(160,120,138,0.06)', tertiaryText: '#A0788A',
//     neutral: '#8C7868', neutralDim: 'rgba(140,120,104,0.12)', neutralText: '#8C7868',
//     success: '#5A8A5A', successDim: 'rgba(90,138,90,0.12)', successFaint: 'rgba(90,138,90,0.06)',
//     error: '#B85050', errorDim: 'rgba(184,80,80,0.12)',
//     warning: '#C89040', warningDim: 'rgba(200,144,64,0.12)',
//     sidebar: '#3D2E22', sidebarRaised: '#4F3C2E', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#B09888',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#C4956A',
// }

// ── OPTION 32 — Dusty Blue Mist
// Sidebar: Steel blue-grey | Content: Misty light blue
// export const T = {
//     bg: '#EEF2F6', surface: '#FFFFFF', surfaceRaised: '#F5F8FB',
//     surfaceHigh: '#DDE5EE', border: '#C8D5E2', borderSubtle: '#EAF0F6',
//     textPrimary: '#1A2535', textSecondary: '#445570', textMuted: '#7A90A8',
//     textInverse: '#FFFFFF',
//     primary: '#4A7298', primaryHover: '#365A7A', primaryDim: 'rgba(74,114,152,0.12)',
//     primaryFaint: 'rgba(74,114,152,0.06)', primaryText: '#4A7298',
//     secondary: '#5A8A80', secondaryDim: 'rgba(90,138,128,0.12)',
//     secondaryFaint: 'rgba(90,138,128,0.06)', secondaryText: '#5A8A80',
//     tertiary: '#8878A8', tertiaryDim: 'rgba(136,120,168,0.12)',
//     tertiaryFaint: 'rgba(136,120,168,0.06)', tertiaryText: '#8878A8',
//     neutral: '#6E84A0', neutralDim: 'rgba(110,132,160,0.12)', neutralText: '#6E84A0',
//     success: '#4A8870', successDim: 'rgba(74,136,112,0.12)', successFaint: 'rgba(74,136,112,0.06)',
//     error: '#A85858', errorDim: 'rgba(168,88,88,0.12)',
//     warning: '#A88840', warningDim: 'rgba(168,136,64,0.12)',
//     sidebar: '#253545', sidebarRaised: '#304558', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#7A90A8',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#7AAED4',
// }

// ── OPTION 33 — Fern & Parchment
// Sidebar: Deep fern green | Content: Parchment warm white
// export const T = {
//     bg: '#F5F4EE', surface: '#FFFFFF', surfaceRaised: '#FAF9F5',
//     surfaceHigh: '#E8E6DA', border: '#D5D0C0', borderSubtle: '#F0EEDE',
//     textPrimary: '#1E2818', textSecondary: '#4A5E40', textMuted: '#7A9070',
//     textInverse: '#FFFFFF',
//     primary: '#5A7A48', primaryHover: '#456035', primaryDim: 'rgba(90,122,72,0.12)',
//     primaryFaint: 'rgba(90,122,72,0.06)', primaryText: '#5A7A48',
//     secondary: '#6A7A9A', secondaryDim: 'rgba(106,122,154,0.12)',
//     secondaryFaint: 'rgba(106,122,154,0.06)', secondaryText: '#6A7A9A',
//     tertiary: '#9A7A68', tertiaryDim: 'rgba(154,122,104,0.12)',
//     tertiaryFaint: 'rgba(154,122,104,0.06)', tertiaryText: '#9A7A68',
//     neutral: '#7A7868', neutralDim: 'rgba(122,120,104,0.12)', neutralText: '#7A7868',
//     success: '#5A7A48', successDim: 'rgba(90,122,72,0.12)', successFaint: 'rgba(90,122,72,0.06)',
//     error: '#A85848', errorDim: 'rgba(168,88,72,0.12)',
//     warning: '#B08840', warningDim: 'rgba(176,136,64,0.12)',
//     sidebar: '#263520', sidebarRaised: '#334528', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#90B878',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#90C870',
// }

// ── OPTION 34 — Soft Graphite
// Sidebar: Warm dark graphite | Content: Very light cool grey
// export const T = {
//     bg: '#F3F3F2', surface: '#FFFFFF', surfaceRaised: '#F8F8F7',
//     surfaceHigh: '#E6E6E3', border: '#D5D4D0', borderSubtle: '#EEEEEC',
//     textPrimary: '#1C1C1A', textSecondary: '#525250', textMuted: '#909088',
//     textInverse: '#FFFFFF',
//     primary: '#5A6878', primaryHover: '#424E5C', primaryDim: 'rgba(90,104,120,0.12)',
//     primaryFaint: 'rgba(90,104,120,0.06)', primaryText: '#5A6878',
//     secondary: '#6A8878', secondaryDim: 'rgba(106,136,120,0.12)',
//     secondaryFaint: 'rgba(106,136,120,0.06)', secondaryText: '#6A8878',
//     tertiary: '#907888', tertiaryDim: 'rgba(144,120,136,0.12)',
//     tertiaryFaint: 'rgba(144,120,136,0.06)', tertiaryText: '#907888',
//     neutral: '#787870', neutralDim: 'rgba(120,120,112,0.12)', neutralText: '#787870',
//     success: '#5A8870', successDim: 'rgba(90,136,112,0.12)', successFaint: 'rgba(90,136,112,0.06)',
//     error: '#A85850', errorDim: 'rgba(168,88,80,0.12)',
//     warning: '#A88848', warningDim: 'rgba(168,136,72,0.12)',
//     sidebar: '#2A2A28', sidebarRaised: '#383835', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#888880',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#8AAAC8',
// }

// ── OPTION 35 — Blush & Ivory
// Sidebar: Muted dusty rose-grey | Content: Soft ivory blush
// export const T = {
//     bg: '#FAF4F4', surface: '#FFFFFF', surfaceRaised: '#FDF9F9',
//     surfaceHigh: '#F0E4E4', border: '#E0CECE', borderSubtle: '#F7EEEE',
//     textPrimary: '#2A1A1A', textSecondary: '#6A4848', textMuted: '#A08080',
//     textInverse: '#FFFFFF',
//     primary: '#9A6868', primaryHover: '#7A5050', primaryDim: 'rgba(154,104,104,0.12)',
//     primaryFaint: 'rgba(154,104,104,0.06)', primaryText: '#9A6868',
//     secondary: '#6A8A88', secondaryDim: 'rgba(106,138,136,0.12)',
//     secondaryFaint: 'rgba(106,138,136,0.06)', secondaryText: '#6A8A88',
//     tertiary: '#8A7AAA', tertiaryDim: 'rgba(138,122,170,0.12)',
//     tertiaryFaint: 'rgba(138,122,170,0.06)', tertiaryText: '#8A7AAA',
//     neutral: '#907878', neutralDim: 'rgba(144,120,120,0.12)', neutralText: '#907878',
//     success: '#5A8A6A', successDim: 'rgba(90,138,106,0.12)', successFaint: 'rgba(90,138,106,0.06)',
//     error: '#B86868', errorDim: 'rgba(184,104,104,0.12)',
//     warning: '#B89050', warningDim: 'rgba(184,144,80,0.12)',
//     sidebar: '#3A2828', sidebarRaised: '#4A3535', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#C09898',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#D4A0A0',
// }

// ── OPTION 36 — Slate Moss
// Sidebar: Slate with moss tint | Content: Light grey-green
// export const T = {
//     bg: '#F1F4F1', surface: '#FFFFFF', surfaceRaised: '#F6F8F6',
//     surfaceHigh: '#E2E8E2', border: '#CEDAD0', borderSubtle: '#EBF0EB',
//     textPrimary: '#1A221A', textSecondary: '#425042', textMuted: '#728072',
//     textInverse: '#FFFFFF',
//     primary: '#507A60', primaryHover: '#3C5E48', primaryDim: 'rgba(80,122,96,0.12)',
//     primaryFaint: 'rgba(80,122,96,0.06)', primaryText: '#507A60',
//     secondary: '#507888', secondaryDim: 'rgba(80,120,136,0.12)',
//     secondaryFaint: 'rgba(80,120,136,0.06)', secondaryText: '#507888',
//     tertiary: '#887A60', tertiaryDim: 'rgba(136,122,96,0.12)',
//     tertiaryFaint: 'rgba(136,122,96,0.06)', tertiaryText: '#887A60',
//     neutral: '#708070', neutralDim: 'rgba(112,128,112,0.12)', neutralText: '#708070',
//     success: '#507A60', successDim: 'rgba(80,122,96,0.12)', successFaint: 'rgba(80,122,96,0.06)',
//     error: '#A06050', errorDim: 'rgba(160,96,80,0.12)',
//     warning: '#A09050', warningDim: 'rgba(160,144,80,0.12)',
//     sidebar: '#222E24', sidebarRaised: '#2E3C30', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#80A882',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#80C890',
// }

// ── OPTION 37 — Warm Pewter
// Sidebar: Cool pewter dark | Content: Warm near-white
// export const T = {
//     bg: '#F4F4F2', surface: '#FFFFFF', surfaceRaised: '#F9F9F8',
//     surfaceHigh: '#E8E8E4', border: '#D8D8D2', borderSubtle: '#F1F1EE',
//     textPrimary: '#1E1E1C', textSecondary: '#545450', textMuted: '#909088',
//     textInverse: '#FFFFFF',
//     primary: '#607080', primaryHover: '#485660', primaryDim: 'rgba(96,112,128,0.12)',
//     primaryFaint: 'rgba(96,112,128,0.06)', primaryText: '#607080',
//     secondary: '#608878', secondaryDim: 'rgba(96,136,120,0.12)',
//     secondaryFaint: 'rgba(96,136,120,0.06)', secondaryText: '#608878',
//     tertiary: '#907090', tertiaryDim: 'rgba(144,112,144,0.12)',
//     tertiaryFaint: 'rgba(144,112,144,0.06)', tertiaryText: '#907090',
//     neutral: '#787874', neutralDim: 'rgba(120,120,116,0.12)', neutralText: '#787874',
//     success: '#608878', successDim: 'rgba(96,136,120,0.12)', successFaint: 'rgba(96,136,120,0.06)',
//     error: '#A86060', errorDim: 'rgba(168,96,96,0.12)',
//     warning: '#A89060', warningDim: 'rgba(168,144,96,0.12)',
//     sidebar: '#2C3038', sidebarRaised: '#383E48', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#8898A8',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#90B0C8',
// }

// ── OPTION 38 — Terracotta Clay
// Sidebar: Dark clay | Content: Soft terracotta warm white
// export const T = {
//     bg: '#F8F2EE', surface: '#FFFFFF', surfaceRaised: '#FCF8F5',
//     surfaceHigh: '#EFE4DC', border: '#DECCBF', borderSubtle: '#F4EEE8',
//     textPrimary: '#28180E', textSecondary: '#6A3E28', textMuted: '#A87858',
//     textInverse: '#FFFFFF',
//     primary: '#A06040', primaryHover: '#7C4A2E', primaryDim: 'rgba(160,96,64,0.12)',
//     primaryFaint: 'rgba(160,96,64,0.06)', primaryText: '#A06040',
//     secondary: '#608878', secondaryDim: 'rgba(96,136,120,0.12)',
//     secondaryFaint: 'rgba(96,136,120,0.06)', secondaryText: '#608878',
//     tertiary: '#907898', tertiaryDim: 'rgba(144,120,152,0.12)',
//     tertiaryFaint: 'rgba(144,120,152,0.06)', tertiaryText: '#907898',
//     neutral: '#907060', neutralDim: 'rgba(144,112,96,0.12)', neutralText: '#907060',
//     success: '#5A8860', successDim: 'rgba(90,136,96,0.12)', successFaint: 'rgba(90,136,96,0.06)',
//     error: '#B85840', errorDim: 'rgba(184,88,64,0.12)',
//     warning: '#B89040', warningDim: 'rgba(184,144,64,0.12)',
//     sidebar: '#362018', sidebarRaised: '#482C20', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#C09070',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#D4906A',
// }

// ── OPTION 39 — Cool Slate (Linear-inspired)
// Sidebar: Blue-tinted dark slate | Content: Very light blue-grey
// export const T = {
//     bg: '#F0F2F5', surface: '#FFFFFF', surfaceRaised: '#F6F7FA',
//     surfaceHigh: '#E2E6EC', border: '#CDD4DE', borderSubtle: '#EBEEf3',
//     textPrimary: '#181E28', textSecondary: '#404C60', textMuted: '#788090',
//     textInverse: '#FFFFFF',
//     primary: '#4A6080', primaryHover: '#364858', primaryDim: 'rgba(74,96,128,0.12)',
//     primaryFaint: 'rgba(74,96,128,0.06)', primaryText: '#4A6080',
//     secondary: '#487880', secondaryDim: 'rgba(72,120,128,0.12)',
//     secondaryFaint: 'rgba(72,120,128,0.06)', secondaryText: '#487880',
//     tertiary: '#807098', tertiaryDim: 'rgba(128,112,152,0.12)',
//     tertiaryFaint: 'rgba(128,112,152,0.06)', tertiaryText: '#807098',
//     neutral: '#687080', neutralDim: 'rgba(104,112,128,0.12)', neutralText: '#687080',
//     success: '#488870', successDim: 'rgba(72,136,112,0.12)', successFaint: 'rgba(72,136,112,0.06)',
//     error: '#986068', errorDim: 'rgba(152,96,104,0.12)',
//     warning: '#9A8858', warningDim: 'rgba(154,136,88,0.12)',
//     sidebar: '#1C2430', sidebarRaised: '#26303E', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#7888A0',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#80A8CC',
// }

// ── OPTION 40 — Sage Smoke
// Sidebar: Smoky sage-dark | Content: Pale sage
// export const T = {
//     bg: '#F2F5F2', surface: '#FFFFFF', surfaceRaised: '#F7F9F7',
//     surfaceHigh: '#E4EAE4', border: '#CEDAD8', borderSubtle: '#ECF0EC',
//     textPrimary: '#1A201C', textSecondary: '#485248', textMuted: '#789078',
//     textInverse: '#FFFFFF',
//     primary: '#5A7870', primaryHover: '#425C55', primaryDim: 'rgba(90,120,112,0.12)',
//     primaryFaint: 'rgba(90,120,112,0.06)', primaryText: '#5A7870',
//     secondary: '#5A7888', secondaryDim: 'rgba(90,120,136,0.12)',
//     secondaryFaint: 'rgba(90,120,136,0.06)', secondaryText: '#5A7888',
//     tertiary: '#887A70', tertiaryDim: 'rgba(136,122,112,0.12)',
//     tertiaryFaint: 'rgba(136,122,112,0.06)', tertiaryText: '#887A70',
//     neutral: '#708078', neutralDim: 'rgba(112,128,120,0.12)', neutralText: '#708078',
//     success: '#5A7870', successDim: 'rgba(90,120,112,0.12)', successFaint: 'rgba(90,120,112,0.06)',
//     error: '#987068', errorDim: 'rgba(152,112,104,0.12)',
//     warning: '#A09060', warningDim: 'rgba(160,144,96,0.12)',
//     sidebar: '#202C28', sidebarRaised: '#2C3C36', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#80A898',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#88C0A8',
// }

// ── OPTION 41 — Fog & Stone
// Sidebar: Cool dark stone | Content: Foggy neutral white
// export const T = {
//     bg: '#F3F3F4', surface: '#FFFFFF', surfaceRaised: '#F8F8F9',
//     surfaceHigh: '#E6E6E8', border: '#D5D5D8', borderSubtle: '#EEEEEF',
//     textPrimary: '#1C1C20', textSecondary: '#505058', textMuted: '#8A8A95',
//     textInverse: '#FFFFFF',
//     primary: '#5C6880', primaryHover: '#46505F', primaryDim: 'rgba(92,104,128,0.12)',
//     primaryFaint: 'rgba(92,104,128,0.06)', primaryText: '#5C6880',
//     secondary: '#5A8080', secondaryDim: 'rgba(90,128,128,0.12)',
//     secondaryFaint: 'rgba(90,128,128,0.06)', secondaryText: '#5A8080',
//     tertiary: '#887888', tertiaryDim: 'rgba(136,120,136,0.12)',
//     tertiaryFaint: 'rgba(136,120,136,0.06)', tertiaryText: '#887888',
//     neutral: '#787880', neutralDim: 'rgba(120,120,128,0.12)', neutralText: '#787880',
//     success: '#588878', successDim: 'rgba(88,136,120,0.12)', successFaint: 'rgba(88,136,120,0.06)',
//     error: '#A06868', errorDim: 'rgba(160,104,104,0.12)',
//     warning: '#A09060', warningDim: 'rgba(160,144,96,0.12)',
//     sidebar: '#242428', sidebarRaised: '#303038', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#858590',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#90A8C0',
// }

// ── OPTION 42 — Antique Rose
// Sidebar: Dark rosewood | Content: Antique blush white
// export const T = {
//     bg: '#FAF4F2', surface: '#FFFFFF', surfaceRaised: '#FDF9F8',
//     surfaceHigh: '#F0E4E0', border: '#E0CECA', borderSubtle: '#F7EEEC',
//     textPrimary: '#281818', textSecondary: '#6A4040', textMuted: '#A07878',
//     textInverse: '#FFFFFF',
//     primary: '#906060', primaryHover: '#6E4848', primaryDim: 'rgba(144,96,96,0.12)',
//     primaryFaint: 'rgba(144,96,96,0.06)', primaryText: '#906060',
//     secondary: '#608880', secondaryDim: 'rgba(96,136,128,0.12)',
//     secondaryFaint: 'rgba(96,136,128,0.06)', secondaryText: '#608880',
//     tertiary: '#8878A0', tertiaryDim: 'rgba(136,120,160,0.12)',
//     tertiaryFaint: 'rgba(136,120,160,0.06)', tertiaryText: '#8878A0',
//     neutral: '#907070', neutralDim: 'rgba(144,112,112,0.12)', neutralText: '#907070',
//     success: '#5A8870', successDim: 'rgba(90,136,112,0.12)', successFaint: 'rgba(90,136,112,0.06)',
//     error: '#B06060', errorDim: 'rgba(176,96,96,0.12)',
//     warning: '#B09050', warningDim: 'rgba(176,144,80,0.12)',
//     sidebar: '#3C2020', sidebarRaised: '#502C2C', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#C09090',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#CC9898',
// }

// ── OPTION 43 — Midnight Indigo (Subtle)
// Sidebar: Soft indigo-dark | Content: Very pale lilac white
// export const T = {
//     bg: '#F4F3FA', surface: '#FFFFFF', surfaceRaised: '#F9F8FD',
//     surfaceHigh: '#E8E6F4', border: '#D5D2EA', borderSubtle: '#EEEcF6',
//     textPrimary: '#1C1828', textSecondary: '#4A4468', textMuted: '#8A84A8',
//     textInverse: '#FFFFFF',
//     primary: '#6860A0', primaryHover: '#504880', primaryDim: 'rgba(104,96,160,0.12)',
//     primaryFaint: 'rgba(104,96,160,0.06)', primaryText: '#6860A0',
//     secondary: '#5A8090', secondaryDim: 'rgba(90,128,144,0.12)',
//     secondaryFaint: 'rgba(90,128,144,0.06)', secondaryText: '#5A8090',
//     tertiary: '#A06888', tertiaryDim: 'rgba(160,104,136,0.12)',
//     tertiaryFaint: 'rgba(160,104,136,0.06)', tertiaryText: '#A06888',
//     neutral: '#7870A0', neutralDim: 'rgba(120,112,160,0.12)', neutralText: '#7870A0',
//     success: '#5A8878', successDim: 'rgba(90,136,120,0.12)', successFaint: 'rgba(90,136,120,0.06)',
//     error: '#A06070', errorDim: 'rgba(160,96,112,0.12)',
//     warning: '#A09050', warningDim: 'rgba(160,144,80,0.12)',
//     sidebar: '#201C38', sidebarRaised: '#2C2848', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#9890C0',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#A8A0D8',
// }

// ── OPTION 44 — Warm Sand Dune
// Sidebar: Dark warm sand | Content: Light dune white
// export const T = {
//     bg: '#F8F5EE', surface: '#FFFFFF', surfaceRaised: '#FBF9F4',
//     surfaceHigh: '#EEE8DA', border: '#DED5C0', borderSubtle: '#F4F0E7',
//     textPrimary: '#24200E', textSecondary: '#5C5030', textMuted: '#908060',
//     textInverse: '#FFFFFF',
//     primary: '#8A7848', primaryHover: '#6C5C34', primaryDim: 'rgba(138,120,72,0.12)',
//     primaryFaint: 'rgba(138,120,72,0.06)', primaryText: '#8A7848',
//     secondary: '#5A8878', secondaryDim: 'rgba(90,136,120,0.12)',
//     secondaryFaint: 'rgba(90,136,120,0.06)', secondaryText: '#5A8878',
//     tertiary: '#8878A0', tertiaryDim: 'rgba(136,120,160,0.12)',
//     tertiaryFaint: 'rgba(136,120,160,0.06)', tertiaryText: '#8878A0',
//     neutral: '#888068', neutralDim: 'rgba(136,128,104,0.12)', neutralText: '#888068',
//     success: '#5A8870', successDim: 'rgba(90,136,112,0.12)', successFaint: 'rgba(90,136,112,0.06)',
//     error: '#A86848', errorDim: 'rgba(168,104,72,0.12)',
//     warning: '#B09040', warningDim: 'rgba(176,144,64,0.12)',
//     sidebar: '#30280E', sidebarRaised: '#403618', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#B0A070',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#C8B068',
// }

// ── OPTION 45 — Denim & Cream
// Sidebar: Faded denim dark | Content: Warm cream white
// export const T = {
//     bg: '#F5F5F0', surface: '#FFFFFF', surfaceRaised: '#FAFAF6',
//     surfaceHigh: '#E8E8E0', border: '#D5D5C8', borderSubtle: '#EEEEEA',
//     textPrimary: '#181C28', textSecondary: '#3A4460', textMuted: '#707898',
//     textInverse: '#FFFFFF',
//     primary: '#4A5C8A', primaryHover: '#364468', primaryDim: 'rgba(74,92,138,0.12)',
//     primaryFaint: 'rgba(74,92,138,0.06)', primaryText: '#4A5C8A',
//     secondary: '#507880', secondaryDim: 'rgba(80,120,128,0.12)',
//     secondaryFaint: 'rgba(80,120,128,0.06)', secondaryText: '#507880',
//     tertiary: '#906870', tertiaryDim: 'rgba(144,104,112,0.12)',
//     tertiaryFaint: 'rgba(144,104,112,0.06)', tertiaryText: '#906870',
//     neutral: '#686878', neutralDim: 'rgba(104,104,120,0.12)', neutralText: '#686878',
//     success: '#508870', successDim: 'rgba(80,136,112,0.12)', successFaint: 'rgba(80,136,112,0.06)',
//     error: '#986068', errorDim: 'rgba(152,96,104,0.12)',
//     warning: '#9A8848', warningDim: 'rgba(154,136,72,0.12)',
//     sidebar: '#1C2238', sidebarRaised: '#262E4A', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#7880A8',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#8898D0',
// }

// ── OPTION 46 — Mint Julep
// Sidebar: Deep cool mint | Content: Pale mint white
// export const T = {
//     bg: '#F0F7F4', surface: '#FFFFFF', surfaceRaised: '#F5FAF8',
//     surfaceHigh: '#DAEEE6', border: '#BCDDD0', borderSubtle: '#E7F4EE',
//     textPrimary: '#102018', textSecondary: '#2E5845', textMuted: '#5A8878',
//     textInverse: '#FFFFFF',
//     primary: '#3A7860', primaryHover: '#2C5C48', primaryDim: 'rgba(58,120,96,0.12)',
//     primaryFaint: 'rgba(58,120,96,0.06)', primaryText: '#3A7860',
//     secondary: '#4A7898', secondaryDim: 'rgba(74,120,152,0.12)',
//     secondaryFaint: 'rgba(74,120,152,0.06)', secondaryText: '#4A7898',
//     tertiary: '#907898', tertiaryDim: 'rgba(144,120,152,0.12)',
//     tertiaryFaint: 'rgba(144,120,152,0.06)', tertiaryText: '#907898',
//     neutral: '#607870', neutralDim: 'rgba(96,120,112,0.12)', neutralText: '#607870',
//     success: '#3A7860', successDim: 'rgba(58,120,96,0.12)', successFaint: 'rgba(58,120,96,0.06)',
//     error: '#986058', errorDim: 'rgba(152,96,88,0.12)',
//     warning: '#A09048', warningDim: 'rgba(160,144,72,0.12)',
//     sidebar: '#183028', sidebarRaised: '#204035', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#70B098',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#70C8A0',
// }

// ── OPTION 47 — Heather & Smoke
// Sidebar: Smoky heather | Content: Pale heather white
// export const T = {
//     bg: '#F4F2F6', surface: '#FFFFFF', surfaceRaised: '#F9F8FA',
//     surfaceHigh: '#E8E4EE', border: '#D8D0E2', borderSubtle: '#F0EDF4',
//     textPrimary: '#201828', textSecondary: '#584868', textMuted: '#907898',
//     textInverse: '#FFFFFF',
//     primary: '#7868A0', primaryHover: '#5C5080', primaryDim: 'rgba(120,104,160,0.12)',
//     primaryFaint: 'rgba(120,104,160,0.06)', primaryText: '#7868A0',
//     secondary: '#5A8090', secondaryDim: 'rgba(90,128,144,0.12)',
//     secondaryFaint: 'rgba(90,128,144,0.06)', secondaryText: '#5A8090',
//     tertiary: '#906878', tertiaryDim: 'rgba(144,104,120,0.12)',
//     tertiaryFaint: 'rgba(144,104,120,0.06)', tertiaryText: '#906878',
//     neutral: '#807090', neutralDim: 'rgba(128,112,144,0.12)', neutralText: '#807090',
//     success: '#5A8878', successDim: 'rgba(90,136,120,0.12)', successFaint: 'rgba(90,136,120,0.06)',
//     error: '#A86878', errorDim: 'rgba(168,104,120,0.12)',
//     warning: '#A09050', warningDim: 'rgba(160,144,80,0.12)',
//     sidebar: '#2C2038', sidebarRaised: '#3A2C4A', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#A090B8',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#B0A0D0',
// }

// ── OPTION 48 — Pebble Beach
// Sidebar: Dark ocean pebble | Content: Light pebble grey-white
// export const T = {
//     bg: '#F2F4F4', surface: '#FFFFFF', surfaceRaised: '#F7F9F9',
//     surfaceHigh: '#E2E8E8', border: '#C8D4D4', borderSubtle: '#EBF0F0',
//     textPrimary: '#141E20', textSecondary: '#364C50', textMuted: '#607878',
//     textInverse: '#FFFFFF',
//     primary: '#407880', primaryHover: '#2E5C62', primaryDim: 'rgba(64,120,128,0.12)',
//     primaryFaint: 'rgba(64,120,128,0.06)', primaryText: '#407880',
//     secondary: '#4A7068', secondaryDim: 'rgba(74,112,104,0.12)',
//     secondaryFaint: 'rgba(74,112,104,0.06)', secondaryText: '#4A7068',
//     tertiary: '#786880', tertiaryDim: 'rgba(120,104,128,0.12)',
//     tertiaryFaint: 'rgba(120,104,128,0.06)', tertiaryText: '#786880',
//     neutral: '#607878', neutralDim: 'rgba(96,120,120,0.12)', neutralText: '#607878',
//     success: '#4A7868', successDim: 'rgba(74,120,104,0.12)', successFaint: 'rgba(74,120,104,0.06)',
//     error: '#906868', errorDim: 'rgba(144,104,104,0.12)',
//     warning: '#908858', warningDim: 'rgba(144,136,88,0.12)',
//     sidebar: '#182428', sidebarRaised: '#223035', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#6898A0',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#70B0B8',
// }

// ── OPTION 49 — Warm Ash
// Sidebar: Dark warm ash | Content: Warm ash near-white
// export const T = {
//     bg: '#F5F4F2', surface: '#FFFFFF', surfaceRaised: '#FAF9F8',
//     surfaceHigh: '#EAE8E4', border: '#D8D5D0', borderSubtle: '#F1F0ED',
//     textPrimary: '#201E18', textSecondary: '#504E46', textMuted: '#8E8C84',
//     textInverse: '#FFFFFF',
//     primary: '#706858', primaryHover: '#564E40', primaryDim: 'rgba(112,104,88,0.12)',
//     primaryFaint: 'rgba(112,104,88,0.06)', primaryText: '#706858',
//     secondary: '#587870', secondaryDim: 'rgba(88,120,112,0.12)',
//     secondaryFaint: 'rgba(88,120,112,0.06)', secondaryText: '#587870',
//     tertiary: '#887880', tertiaryDim: 'rgba(136,120,128,0.12)',
//     tertiaryFaint: 'rgba(136,120,128,0.06)', tertiaryText: '#887880',
//     neutral: '#807C72', neutralDim: 'rgba(128,124,114,0.12)', neutralText: '#807C72',
//     success: '#588870', successDim: 'rgba(88,136,112,0.12)', successFaint: 'rgba(88,136,112,0.06)',
//     error: '#A07060', errorDim: 'rgba(160,112,96,0.12)',
//     warning: '#A09058', warningDim: 'rgba(160,144,88,0.12)',
//     sidebar: '#2A2820', sidebarRaised: '#38362C', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#908E84',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#A8A490',
// }

// ── OPTION 50 — Ocean Slate
// Sidebar: Deep ocean slate-blue | Content: Pale ocean white
// export const T = {
//     bg: '#EFF4F7', surface: '#FFFFFF', surfaceRaised: '#F5F9FB',
//     surfaceHigh: '#DCE8EE', border: '#C0D4DF', borderSubtle: '#E8F0F5',
//     textPrimary: '#101C28', textSecondary: '#2C4A5E', textMuted: '#507088',
//     textInverse: '#FFFFFF',
//     primary: '#386A88', primaryHover: '#285068', primaryDim: 'rgba(56,106,136,0.12)',
//     primaryFaint: 'rgba(56,106,136,0.06)', primaryText: '#386A88',
//     secondary: '#387868', secondaryDim: 'rgba(56,120,104,0.12)',
//     secondaryFaint: 'rgba(56,120,104,0.06)', secondaryText: '#387868',
//     tertiary: '#786898', tertiaryDim: 'rgba(120,104,152,0.12)',
//     tertiaryFaint: 'rgba(120,104,152,0.06)', tertiaryText: '#786898',
//     neutral: '#587888', neutralDim: 'rgba(88,120,136,0.12)', neutralText: '#587888',
//     success: '#387868', successDim: 'rgba(56,120,104,0.12)', successFaint: 'rgba(56,120,104,0.06)',
//     error: '#906068', errorDim: 'rgba(144,96,104,0.12)',
//     warning: '#908858', warningDim: 'rgba(144,136,88,0.12)',
//     sidebar: '#142030', sidebarRaised: '#1E2E40', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#6090A8',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#70A8C8',
// }

// ── OPTION 51 — Dusty Mauve
// Sidebar: Deep mauve-grey | Content: Pale dusty mauve white
// export const T = {
//     bg: '#F6F3F6', surface: '#FFFFFF', surfaceRaised: '#FBF9FB',
//     surfaceHigh: '#EDE5ED', border: '#DDD0DD', borderSubtle: '#F3EEF3',
//     textPrimary: '#221822', textSecondary: '#584858', textMuted: '#907890',
//     textInverse: '#FFFFFF',
//     primary: '#886888', primaryHover: '#6A5068', primaryDim: 'rgba(136,104,136,0.12)',
//     primaryFaint: 'rgba(136,104,136,0.06)', primaryText: '#886888',
//     secondary: '#588880', secondaryDim: 'rgba(88,136,128,0.12)',
//     secondaryFaint: 'rgba(88,136,128,0.06)', secondaryText: '#588880',
//     tertiary: '#8870A0', tertiaryDim: 'rgba(136,112,160,0.12)',
//     tertiaryFaint: 'rgba(136,112,160,0.06)', tertiaryText: '#8870A0',
//     neutral: '#887888', neutralDim: 'rgba(136,120,136,0.12)', neutralText: '#887888',
//     success: '#5A8878', successDim: 'rgba(90,136,120,0.12)', successFaint: 'rgba(90,136,120,0.06)',
//     error: '#A87080', errorDim: 'rgba(168,112,128,0.12)',
//     warning: '#A09058', warningDim: 'rgba(160,144,88,0.12)',
//     sidebar: '#2C1E2C', sidebarRaised: '#3C2A3C', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#B098B0',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#C0A0C0',
// }

// ── OPTION 52 — Birch & Bark
// Sidebar: Dark bark brown | Content: Birch light beige
// export const T = {
//     bg: '#F7F5F0', surface: '#FFFFFF', surfaceRaised: '#FBF9F6',
//     surfaceHigh: '#EDE8E0', border: '#DDD5C8', borderSubtle: '#F3F0E9',
//     textPrimary: '#221C12', textSecondary: '#584830', textMuted: '#907860',
//     textInverse: '#FFFFFF',
//     primary: '#786040', primaryHover: '#5C4830', primaryDim: 'rgba(120,96,64,0.12)',
//     primaryFaint: 'rgba(120,96,64,0.06)', primaryText: '#786040',
//     secondary: '#507868', secondaryDim: 'rgba(80,120,104,0.12)',
//     secondaryFaint: 'rgba(80,120,104,0.06)', secondaryText: '#507868',
//     tertiary: '#786880', tertiaryDim: 'rgba(120,104,128,0.12)',
//     tertiaryFaint: 'rgba(120,104,128,0.06)', tertiaryText: '#786880',
//     neutral: '#807060', neutralDim: 'rgba(128,112,96,0.12)', neutralText: '#807060',
//     success: '#507868', successDim: 'rgba(80,120,104,0.12)', successFaint: 'rgba(80,120,104,0.06)',
//     error: '#A06850', errorDim: 'rgba(160,104,80,0.12)',
//     warning: '#A89050', warningDim: 'rgba(168,144,80,0.12)',
//     sidebar: '#2C2018', sidebarRaised: '#3C2C20', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#B09878',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#C0A870',
// }

// ── OPTION 53 — Steel & Pearl
// Sidebar: Cool steel dark | Content: Pearl warm white
// export const T = {
//     bg: '#F4F5F6', surface: '#FFFFFF', surfaceRaised: '#F9FAFA',
//     surfaceHigh: '#E6E8EA', border: '#D2D6DA', borderSubtle: '#EDF0F2',
//     textPrimary: '#181C20', textSecondary: '#40484E', textMuted: '#788088',
//     textInverse: '#FFFFFF',
//     primary: '#506880', primaryHover: '#3C5062', primaryDim: 'rgba(80,104,128,0.12)',
//     primaryFaint: 'rgba(80,104,128,0.06)', primaryText: '#506880',
//     secondary: '#507870', secondaryDim: 'rgba(80,120,112,0.12)',
//     secondaryFaint: 'rgba(80,120,112,0.06)', secondaryText: '#507870',
//     tertiary: '#807898', tertiaryDim: 'rgba(128,120,152,0.12)',
//     tertiaryFaint: 'rgba(128,120,152,0.06)', tertiaryText: '#807898',
//     neutral: '#687078', neutralDim: 'rgba(104,112,120,0.12)', neutralText: '#687078',
//     success: '#508878', successDim: 'rgba(80,136,120,0.12)', successFaint: 'rgba(80,136,120,0.06)',
//     error: '#986870', errorDim: 'rgba(152,104,112,0.12)',
//     warning: '#988860', warningDim: 'rgba(152,136,96,0.12)',
//     sidebar: '#202830', sidebarRaised: '#2C3640', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#7888A0',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#88A8C8',
// }

// ── OPTION 54 — Cadet & Canvas
// Sidebar: Cadet blue-dark | Content: Canvas warm cream
// export const T = {
//     bg: '#F5F6F4', surface: '#FFFFFF', surfaceRaised: '#FAFAF8',
//     surfaceHigh: '#E8EAE4', border: '#D4D8CE', borderSubtle: '#EEF0EC',
//     textPrimary: '#1A1E18', textSecondary: '#3E4C3A', textMuted: '#708068',
//     textInverse: '#FFFFFF',
//     primary: '#506878', primaryHover: '#3C505A', primaryDim: 'rgba(80,104,120,0.12)',
//     primaryFaint: 'rgba(80,104,120,0.06)', primaryText: '#506878',
//     secondary: '#587858', secondaryDim: 'rgba(88,120,88,0.12)',
//     secondaryFaint: 'rgba(88,120,88,0.06)', secondaryText: '#587858',
//     tertiary: '#887068', tertiaryDim: 'rgba(136,112,104,0.12)',
//     tertiaryFaint: 'rgba(136,112,104,0.06)', tertiaryText: '#887068',
//     neutral: '#687068', neutralDim: 'rgba(104,112,104,0.12)', neutralText: '#687068',
//     success: '#587858', successDim: 'rgba(88,120,88,0.12)', successFaint: 'rgba(88,120,88,0.06)',
//     error: '#906860', errorDim: 'rgba(144,104,96,0.12)',
//     warning: '#989058', warningDim: 'rgba(152,144,88,0.12)',
//     sidebar: '#1E2830', sidebarRaised: '#2A3640', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#7898A8',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#80A8B8',
// }

// ── OPTION 55 — Plum Blossom
// Sidebar: Deep plum | Content: Soft blossom white
// export const T = {
//     bg: '#F6F2F5', surface: '#FFFFFF', surfaceRaised: '#FBF8FA',
//     surfaceHigh: '#EDE4EB', border: '#DDD0DA', borderSubtle: '#F3EEF2',
//     textPrimary: '#241420', textSecondary: '#604058', textMuted: '#987888',
//     textInverse: '#FFFFFF',
//     primary: '#806080', primaryHover: '#604860', primaryDim: 'rgba(128,96,128,0.12)',
//     primaryFaint: 'rgba(128,96,128,0.06)', primaryText: '#806080',
//     secondary: '#508880', secondaryDim: 'rgba(80,136,128,0.12)',
//     secondaryFaint: 'rgba(80,136,128,0.06)', secondaryText: '#508880',
//     tertiary: '#9878A8', tertiaryDim: 'rgba(152,120,168,0.12)',
//     tertiaryFaint: 'rgba(152,120,168,0.06)', tertiaryText: '#9878A8',
//     neutral: '#887080', neutralDim: 'rgba(136,112,128,0.12)', neutralText: '#887080',
//     success: '#508870', successDim: 'rgba(80,136,112,0.12)', successFaint: 'rgba(80,136,112,0.06)',
//     error: '#A86880', errorDim: 'rgba(168,104,128,0.12)',
//     warning: '#A89050', warningDim: 'rgba(168,144,80,0.12)',
//     sidebar: '#2E1828', sidebarRaised: '#3E2238', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#B088A0',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#C098B8',
// }

// ── OPTION 56 — Morning Haze
// Sidebar: Hazy blue-grey dark | Content: Morning mist white
// export const T = {
//     bg: '#F2F4F7', surface: '#FFFFFF', surfaceRaised: '#F7F9FB',
//     surfaceHigh: '#E2E8EE', border: '#CAD4E0', borderSubtle: '#EBF0F6',
//     textPrimary: '#141C28', textSecondary: '#384860', textMuted: '#688098',
//     textInverse: '#FFFFFF',
//     primary: '#4A6888', primaryHover: '#385068', primaryDim: 'rgba(74,104,136,0.12)',
//     primaryFaint: 'rgba(74,104,136,0.06)', primaryText: '#4A6888',
//     secondary: '#48806E', secondaryDim: 'rgba(72,128,110,0.12)',
//     secondaryFaint: 'rgba(72,128,110,0.06)', secondaryText: '#48806E',
//     tertiary: '#806888', tertiaryDim: 'rgba(128,104,136,0.12)',
//     tertiaryFaint: 'rgba(128,104,136,0.06)', tertiaryText: '#806888',
//     neutral: '#607888', neutralDim: 'rgba(96,120,136,0.12)', neutralText: '#607888',
//     success: '#488870', successDim: 'rgba(72,136,112,0.12)', successFaint: 'rgba(72,136,112,0.06)',
//     error: '#986068', errorDim: 'rgba(152,96,104,0.12)',
//     warning: '#989058', warningDim: 'rgba(152,144,88,0.12)',
//     sidebar: '#182030', sidebarRaised: '#222C3E', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#6888A8',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#80A8CC',
// }

// ── OPTION 57 — Weathered Teal
// Sidebar: Weathered dark teal | Content: Light seafoam
// export const T = {
//     bg: '#F0F6F5', surface: '#FFFFFF', surfaceRaised: '#F5FAFA',
//     surfaceHigh: '#DCF0EC', border: '#B8DAD5', borderSubtle: '#E7F4F2',
//     textPrimary: '#0E2220', textSecondary: '#285850', textMuted: '#508880',
//     textInverse: '#FFFFFF',
//     primary: '#347870', primaryHover: '#245C55', primaryDim: 'rgba(52,120,112,0.12)',
//     primaryFaint: 'rgba(52,120,112,0.06)', primaryText: '#347870',
//     secondary: '#386888', secondaryDim: 'rgba(56,104,136,0.12)',
//     secondaryFaint: 'rgba(56,104,136,0.06)', secondaryText: '#386888',
//     tertiary: '#786888', tertiaryDim: 'rgba(120,104,136,0.12)',
//     tertiaryFaint: 'rgba(120,104,136,0.06)', tertiaryText: '#786888',
//     neutral: '#508878', neutralDim: 'rgba(80,136,120,0.12)', neutralText: '#508878',
//     success: '#347870', successDim: 'rgba(52,120,112,0.12)', successFaint: 'rgba(52,120,112,0.06)',
//     error: '#906860', errorDim: 'rgba(144,104,96,0.12)',
//     warning: '#909050', warningDim: 'rgba(144,144,80,0.12)',
//     sidebar: '#142820', sidebarRaised: '#1E3830', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#60A898',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#70C0A8',
// }

// ── OPTION 58 — Moonstone
// Sidebar: Moonstone dark grey-blue | Content: Moonstone pale grey
// export const T = {
//     bg: '#F2F4F6', surface: '#FFFFFF', surfaceRaised: '#F7F9FA',
//     surfaceHigh: '#E2E8EE', border: '#C8D4DE', borderSubtle: '#EBF0F4',
//     textPrimary: '#141820', textSecondary: '#384050', textMuted: '#687888',
//     textInverse: '#FFFFFF',
//     primary: '#486080', primaryHover: '#344A60', primaryDim: 'rgba(72,96,128,0.12)',
//     primaryFaint: 'rgba(72,96,128,0.06)', primaryText: '#486080',
//     secondary: '#487080', secondaryDim: 'rgba(72,112,128,0.12)',
//     secondaryFaint: 'rgba(72,112,128,0.06)', secondaryText: '#487080',
//     tertiary: '#706888', tertiaryDim: 'rgba(112,104,136,0.12)',
//     tertiaryFaint: 'rgba(112,104,136,0.06)', tertiaryText: '#706888',
//     neutral: '#607080', neutralDim: 'rgba(96,112,128,0.12)', neutralText: '#607080',
//     success: '#488070', successDim: 'rgba(72,128,112,0.12)', successFaint: 'rgba(72,128,112,0.06)',
//     error: '#906068', errorDim: 'rgba(144,96,104,0.12)',
//     warning: '#908858', warningDim: 'rgba(144,136,88,0.12)',
//     sidebar: '#18202A', sidebarRaised: '#222C38', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#6880A0',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#80A0C8',
// }

// ── OPTION 59 — Rustic Olive
// Sidebar: Rustic dark olive | Content: Warm olive cream
// export const T = {
//     bg: '#F5F5EE', surface: '#FFFFFF', surfaceRaised: '#FAFAF5',
//     surfaceHigh: '#E8E8DA', border: '#D5D5C4', borderSubtle: '#EEEEEA',
//     textPrimary: '#1C1E10', textSecondary: '#484E28', textMuted: '#787E50',
//     textInverse: '#FFFFFF',
//     primary: '#607040', primaryHover: '#485430', primaryDim: 'rgba(96,112,64,0.12)',
//     primaryFaint: 'rgba(96,112,64,0.06)', primaryText: '#607040',
//     secondary: '#507880', secondaryDim: 'rgba(80,120,128,0.12)',
//     secondaryFaint: 'rgba(80,120,128,0.06)', secondaryText: '#507880',
//     tertiary: '#887058', tertiaryDim: 'rgba(136,112,88,0.12)',
//     tertiaryFaint: 'rgba(136,112,88,0.06)', tertiaryText: '#887058',
//     neutral: '#707058', neutralDim: 'rgba(112,112,88,0.12)', neutralText: '#707058',
//     success: '#607040', successDim: 'rgba(96,112,64,0.12)', successFaint: 'rgba(96,112,64,0.06)',
//     error: '#986050', errorDim: 'rgba(152,96,80,0.12)',
//     warning: '#989048', warningDim: 'rgba(152,144,72,0.12)',
//     sidebar: '#222618', sidebarRaised: '#2E3220', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#909870',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#A8B878',
// }

// ── OPTION 60 — Dove & Dusk
// Sidebar: Dusky warm dark | Content: Dove feather white
// export const T = {
//     bg: '#F6F5F4', surface: '#FFFFFF', surfaceRaised: '#FBFAF9',
//     surfaceHigh: '#EBE8E5', border: '#DAD6D0', borderSubtle: '#F2F0ED',
//     textPrimary: '#201E1C', textSecondary: '#504C48', textMuted: '#908A84',
//     textInverse: '#FFFFFF',
//     primary: '#706860', primaryHover: '#564E48', primaryDim: 'rgba(112,104,96,0.12)',
//     primaryFaint: 'rgba(112,104,96,0.06)', primaryText: '#706860',
//     secondary: '#5A7870', secondaryDim: 'rgba(90,120,112,0.12)',
//     secondaryFaint: 'rgba(90,120,112,0.06)', secondaryText: '#5A7870',
//     tertiary: '#887080', tertiaryDim: 'rgba(136,112,128,0.12)',
//     tertiaryFaint: 'rgba(136,112,128,0.06)', tertiaryText: '#887080',
//     neutral: '#807870', neutralDim: 'rgba(128,120,112,0.12)', neutralText: '#807870',
//     success: '#5A8878', successDim: 'rgba(90,136,120,0.12)', successFaint: 'rgba(90,136,120,0.06)',
//     error: '#A07068', errorDim: 'rgba(160,112,104,0.12)',
//     warning: '#A09058', warningDim: 'rgba(160,144,88,0.12)',
//     sidebar: '#28221E', sidebarRaised: '#342E28', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#908884',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#B0A89C',
// }

// ==========================================
// CATEGORY 1: EARTHY & ORGANIC (Your base style variations)
// ==========================================

// Theme 1: Sage & Warm Cedar
// export const T = {
//     bg: '#F4F6F0', surface: '#FFFFFF', surfaceRaised: '#FAFBF8',
//     surfaceHigh: '#E6EAE0', border: '#D2D9CA', borderSubtle: '#EDF0EB',
//     textPrimary: '#1A1F16', textSecondary: '#4A5443', textMuted: '#7B8774',
//     textInverse: '#FFFFFF',
//     primary: '#4F6642', primaryHover: '#3D5033', primaryDim: 'rgba(79,102,66,0.12)',
//     primaryFaint: 'rgba(79,102,66,0.06)', primaryText: '#4F6642',
//     secondary: '#8C6D53', secondaryDim: 'rgba(140,109,83,0.12)',
//     secondaryFaint: 'rgba(140,109,83,0.06)', secondaryText: '#8C6D53',
//     tertiary: '#4A6B6C', tertiaryDim: 'rgba(74,107,108,0.12)',
//     tertiaryFaint: 'rgba(74,107,108,0.06)', tertiaryText: '#4A6B6C',
//     neutral: '#6B6D65', neutralDim: 'rgba(107,109,101,0.12)', neutralText: '#6B6D65',
//     success: '#4F6642', successDim: 'rgba(79,102,66,0.12)', successFaint: 'rgba(79,102,66,0.06)',
//     error: '#A65B53', errorDim: 'rgba(166,91,83,0.12)',
//     warning: '#A6924E', warningDim: 'rgba(166,146,78,0.12)',
//     sidebar: '#1E241A', sidebarRaised: '#293023', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#8FA184',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#A7BF99',
// }

// Theme 2: Desert Oasis (Sand & Terracotta)
// export const T = {
//     bg: '#F7F4F0', surface: '#FFFFFF', surfaceRaised: '#FAF8F5',
//     surfaceHigh: '#ECE5DC', border: '#DAD0C2', borderSubtle: '#F1ECE6',
//     textPrimary: '#241E17', textSecondary: '#544A3D', textMuted: '#877B6C',
//     textInverse: '#FFFFFF',
//     primary: '#BC6C25', primaryHover: '#9E581D', primaryDim: 'rgba(188,108,37,0.12)',
//     primaryFaint: 'rgba(188,108,37,0.06)', primaryText: '#BC6C25',
//     secondary: '#283618', secondaryDim: 'rgba(40,54,24,0.12)',
//     secondaryFaint: 'rgba(40,54,24,0.06)', secondaryText: '#283618',
//     tertiary: '#606C38', tertiaryDim: 'rgba(96,108,56,0.12)',
//     tertiaryFaint: 'rgba(96,108,56,0.06)', tertiaryText: '#606C38',
//     neutral: '#70685C', neutralDim: 'rgba(112,104,92,0.12)', neutralText: '#70685C',
//     success: '#606C38', successDim: 'rgba(96,108,56,0.12)', successFaint: 'rgba(96,108,56,0.06)',
//     error: '#B23A3A', errorDim: 'rgba(178,58,58,0.12)',
//     warning: '#D4A373', warningDim: 'rgba(212,163,115,0.12)',
//     sidebar: '#261F17', sidebarRaised: '#332B20', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#BAA790',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#D4A373',
// }

// Theme 3: Forest Moss & Clay
// export const T = {
//     bg: '#F2F5F3', surface: '#FFFFFF', surfaceRaised: '#F7F9F8',
//     surfaceHigh: '#E1E6E3', border: '#CCD4CE', borderSubtle: '#ECF0EE',
//     textPrimary: '#141A16', textSecondary: '#3E4D43', textMuted: '#6E8074',
//     textInverse: '#FFFFFF',
//     primary: '#2D5A27', primaryHover: '#22441D', primaryDim: 'rgba(45,90,39,0.12)',
//     primaryFaint: 'rgba(45,90,39,0.06)', primaryText: '#2D5A27',
//     secondary: '#A0522D', secondaryDim: 'rgba(160,82,45,0.12)',
//     secondaryFaint: 'rgba(160,82,45,0.06)', secondaryText: '#A0522D',
//     tertiary: '#4A7A96', tertiaryDim: 'rgba(74,122,150,0.12)',
//     tertiaryFaint: 'rgba(74,122,150,0.06)', tertiaryText: '#4A7A96',
//     neutral: '#616E65', neutralDim: 'rgba(97,110,101,0.12)', neutralText: '#616E65',
//     success: '#2D5A27', successDim: 'rgba(45,90,39,0.12)', successFaint: 'rgba(45,90,39,0.06)',
//     error: '#B24C4C', errorDim: 'rgba(178,76,76,0.12)',
//     warning: '#C29938', warningDim: 'rgba(194,153,56,0.12)',
//     sidebar: '#162419', sidebarRaised: '#223326', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#87A18E',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#6BB379',
// }

// Theme 4: Autumn Orchard
// export const T = {
//     bg: '#F6F3EE', surface: '#FFFFFF', surfaceRaised: '#FAF8F5',
//     surfaceHigh: '#EAE2D5', border: '#D5C9B3', borderSubtle: '#F0ECE4',
//     textPrimary: '#261D11', textSecondary: '#594A35', textMuted: '#8C7C64',
//     textInverse: '#FFFFFF',
//     primary: '#854442', primaryHover: '#693533', primaryDim: 'rgba(133,68,66,0.12)',
//     primaryFaint: 'rgba(133,68,66,0.06)', primaryText: '#854442',
//     secondary: '#435844', secondaryDim: 'rgba(67,88,68,0.12)',
//     secondaryFaint: 'rgba(67,88,68,0.06)', secondaryText: '#435844',
//     tertiary: '#D1A153', tertiaryDim: 'rgba(209,161,83,0.12)',
//     tertiaryFaint: 'rgba(209,161,83,0.06)', tertiaryText: '#D1A153',
//     neutral: '#6E6659', neutralDim: 'rgba(110,102,89,0.12)', neutralText: '#6E6659',
//     success: '#435844', successDim: 'rgba(67,88,68,0.12)', successFaint: 'rgba(67,88,68,0.06)',
//     error: '#A83232', errorDim: 'rgba(168,50,50,0.12)',
//     warning: '#D99136', warningDim: 'rgba(217,145,54,0.12)',
//     sidebar: '#2B1F16', sidebarRaised: '#3A2C20', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#AA9681',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#D1A153',
// }

// Theme 5: Eucalyptus & Slate
// export const T = {
//     bg: '#F0F3F3', surface: '#FFFFFF', surfaceRaised: '#F6F8F8',
//     surfaceHigh: '#DDE2E3', border: '#C7CFD1', borderSubtle: '#EAEDED',
//     textPrimary: '#172021', textSecondary: '#404E52', textMuted: '#718287',
//     textInverse: '#FFFFFF',
//     primary: '#4A6B6C', primaryHover: '#385354', primaryDim: 'rgba(74,107,108,0.12)',
//     primaryFaint: 'rgba(74,107,108,0.06)', primaryText: '#4A6B6C',
//     secondary: '#7A6B58', secondaryDim: 'rgba(122,107,88,0.12)',
//     secondaryFaint: 'rgba(122,107,88,0.06)', secondaryText: '#7A6B58',
//     tertiary: '#5B7A61', tertiaryDim: 'rgba(91,122,97,0.12)',
//     tertiaryFaint: 'rgba(91,122,97,0.06)', tertiaryText: '#5B7A61',
//     neutral: '#626E70', neutralDim: 'rgba(98,110,112,0.12)', neutralText: '#626E70',
//     success: '#5B7A61', successDim: 'rgba(91,122,97,0.12)', successFaint: 'rgba(91,122,97,0.06)',
//     error: '#A35252', errorDim: 'rgba(163,82,82,0.12)',
//     warning: '#B5943B', warningDim: 'rgba(181,148,59,0.12)',
//     sidebar: '#192426', sidebarRaised: '#243236', sidebarHover: 'rgba(255,255,255,0.06)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#869BA1',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#72A3A6',
// }


// ==========================================
// CATEGORY 2: MINIMAL & MODERN LIGHT
// ==========================================

// Theme 6: Nordic Snow & Graphite
// export const T = {
//     bg: '#F8F9FA', surface: '#FFFFFF', surfaceRaised: '#FDFDFD',
//     surfaceHigh: '#E9ECEF', border: '#DEE2E6', borderSubtle: '#F1F3F5',
//     textPrimary: '#212529', textSecondary: '#495057', textMuted: '#adb5bd',
//     textInverse: '#FFFFFF',
//     primary: '#343A40', primaryHover: '#212529', primaryDim: 'rgba(52,58,64,0.12)',
//     primaryFaint: 'rgba(52,58,64,0.06)', primaryText: '#343A40',
//     secondary: '#495057', secondaryDim: 'rgba(73,80,87,0.12)',
//     secondaryFaint: 'rgba(73,80,87,0.06)', secondaryText: '#495057',
//     tertiary: '#6C757D', tertiaryDim: 'rgba(108,117,125,0.12)',
//     tertiaryFaint: 'rgba(108,117,125,0.06)', tertiaryText: '#6C757D',
//     neutral: '#495057', neutralDim: 'rgba(73,80,87,0.12)', neutralText: '#495057',
//     success: '#2B8A3E', successDim: 'rgba(43,138,62,0.12)', successFaint: 'rgba(43,138,62,0.06)',
//     error: '#C92A2A', errorDim: 'rgba(201,42,42,0.12)',
//     warning: '#E67E22', warningDim: 'rgba(230,126,34,0.12)',
//     sidebar: '#1A1D20', sidebarRaised: '#2B3035', sidebarHover: 'rgba(255,255,255,0.04)',
//     sidebarBorder: 'rgba(255,255,255,0.06)', sidebarText: '#CED4DA',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#FFFFFF',
// }

// Theme 7: Soft Minimal Gray
// export const T = {
//     bg: '#F5F5F5', surface: '#FFFFFF', surfaceRaised: '#FAFAFA',
//     surfaceHigh: '#E5E5E5', border: '#D4D4D4', borderSubtle: '#EAEAEA',
//     textPrimary: '#171717', textSecondary: '#404040', textMuted: '#737373',
//     textInverse: '#FFFFFF',
//     primary: '#000000', primaryHover: '#262626', primaryDim: 'rgba(0,0,0,0.08)',
//     primaryFaint: 'rgba(0,0,0,0.04)', primaryText: '#000000',
//     secondary: '#525252', secondaryDim: 'rgba(82,82,82,0.12)',
//     secondaryFaint: 'rgba(82,82,82,0.06)', secondaryText: '#525252',
//     tertiary: '#737373', tertiaryDim: 'rgba(115,115,115,0.12)',
//     tertiaryFaint: 'rgba(115,115,115,0.06)', tertiaryText: '#737373',
//     neutral: '#525252', neutralDim: 'rgba(82,82,82,0.12)', neutralText: '#525252',
//     success: '#16A34A', successDim: 'rgba(22,163,74,0.12)', successFaint: 'rgba(22,163,74,0.06)',
//     error: '#DC2626', errorDim: 'rgba(220,38,38,0.12)',
//     warning: '#D97706', warningDim: 'rgba(217,119,6,0.12)',
//     sidebar: '#171717', sidebarRaised: '#262626', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.05)', sidebarText: '#A3A3A3',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#FFFFFF',
// }

// Theme 8: Clean Oatmeal
// export const T = {
//     bg: '#F9F6F0', surface: '#FFFFFF', surfaceRaised: '#FDFBFA',
//     surfaceHigh: '#EDE7DC', border: '#DDD5C7', borderSubtle: '#F3EFE6',
//     textPrimary: '#2A241F', textSecondary: '#5C534C', textMuted: '#8E847A',
//     textInverse: '#FFFFFF',
//     primary: '#4E453E', primaryHover: '#3A332E', primaryDim: 'rgba(78,69,62,0.12)',
//     primaryFaint: 'rgba(78,69,62,0.06)', primaryText: '#4E453E',
//     secondary: '#766A60', secondaryDim: 'rgba(118,106,96,0.12)',
//     secondaryFaint: 'rgba(118,106,96,0.06)', secondaryText: '#766A60',
//     tertiary: '#9E9085', tertiaryDim: 'rgba(158,144,133,0.12)',
//     tertiaryFaint: 'rgba(158,144,133,0.06)', tertiaryText: '#9E9085',
//     neutral: '#6E635A', neutralDim: 'rgba(110,99,90,0.12)', neutralText: '#6E635A',
//     success: '#466850', successDim: 'rgba(70,104,80,0.12)', successFaint: 'rgba(70,104,80,0.06)',
//     error: '#A35252', errorDim: 'rgba(163,82,82,0.12)',
//     warning: '#C29447', warningDim: 'rgba(194,148,71,0.12)',
//     sidebar: '#2B2622', sidebarRaised: '#3A332E', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.06)', sidebarText: '#B0A398',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#E8DFD5',
// }

// Theme 9: Soft Cream Concrete
// export const T = {
//     bg: '#F0F1F4', surface: '#FFFFFF', surfaceRaised: '#F6F7F9',
//     surfaceHigh: '#E2E4E9', border: '#CFD2DA', borderSubtle: '#EBECEF',
//     textPrimary: '#1E2229', textSecondary: '#4A505C', textMuted: '#7A818F',
//     textInverse: '#FFFFFF',
//     primary: '#2B3A4A', primaryHover: '#1D2733', primaryDim: 'rgba(43,58,74,0.12)',
//     primaryFaint: 'rgba(43,58,74,0.06)', primaryText: '#2B3A4A',
//     secondary: '#536375', secondaryDim: 'rgba(83,99,117,0.12)',
//     secondaryFaint: 'rgba(83,99,117,0.06)', secondaryText: '#536375',
//     tertiary: '#8091A5', tertiaryDim: 'rgba(128,145,165,0.12)',
//     tertiaryFaint: 'rgba(128,145,165,0.06)', tertiaryText: '#8091A5',
//     neutral: '#5F6875', neutralDim: 'rgba(95,104,117,0.12)', neutralText: '#5F6875',
//     success: '#3A6B4E', successDim: 'rgba(58,107,78,0.12)', successFaint: 'rgba(58,107,78,0.06)',
//     error: '#A84C4C', errorDim: 'rgba(168,76,76,0.12)',
//     warning: '#C29438', warningDim: 'rgba(194,148,56,0.12)',
//     sidebar: '#1E242B', sidebarRaised: '#2B333D', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.06)', sidebarText: '#92A1B0',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#C2D1E0',
// }

// Theme 10: Warm Alabaster
// export const T = {
//     bg: '#F5F3EF', surface: '#FFFFFF', surfaceRaised: '#FAF9F6',
//     surfaceHigh: '#E7E4DD', border: '#D3CFC6', borderSubtle: '#EFECE6',
//     textPrimary: '#211F1C', textSecondary: '#545049', textMuted: '#878278',
//     textInverse: '#FFFFFF',
//     primary: '#3B3630', primaryHover: '#292521', primaryDim: 'rgba(59,54,48,0.12)',
//     primaryFaint: 'rgba(59,54,48,0.06)', primaryText: '#3B3630',
//     secondary: '#696156', secondaryDim: 'rgba(105,97,86,0.12)',
//     secondaryFaint: 'rgba(105,97,86,0.06)', secondaryText: '#696156',
//     tertiary: '#948B7E', tertiaryDim: 'rgba(148,139,126,0.12)',
//     tertiaryFaint: 'rgba(148,139,126,0.06)', tertiaryText: '#948B7E',
//     neutral: '#5E5851', neutralDim: 'rgba(94,88,81,0.12)', neutralText: '#5E5851',
//     success: '#526649', successDim: 'rgba(82,102,73,0.12)', successFaint: 'rgba(82,102,73,0.06)',
//     error: '#9C534A', errorDim: 'rgba(156,83,74,0.12)',
//     warning: '#BFA04A', warningDim: 'rgba(191,160,74,0.12)',
//     sidebar: '#24211D', sidebarRaised: '#332F2A', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.06)', sidebarText: '#A39D93',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#EBE6DC',
// }


// ==========================================
// CATEGORY 3: REFINED JEWEL & ROYAL TONAL
// ==========================================

// Theme 11: Midnight Sapphire
// export const T = {
//     bg: '#F2F5F9', surface: '#FFFFFF', surfaceRaised: '#F7F9FC',
//     surfaceHigh: '#E1E7F0', border: '#CAD4E3', borderSubtle: '#EDF1F6',
//     textPrimary: '#0F1A2B', textSecondary: '#3B4D66', textMuted: '#6B81A1',
//     textInverse: '#FFFFFF',
//     primary: '#1A365D', primaryHover: '#122542', primaryDim: 'rgba(26,54,93,0.12)',
//     primaryFaint: 'rgba(26,54,93,0.06)', primaryText: '#1A365D',
//     secondary: '#2B6CB0', secondaryDim: 'rgba(43,108,176,0.12)',
//     secondaryFaint: 'rgba(43,108,176,0.06)', secondaryText: '#2B6CB0',
//     tertiary: '#4A5568', tertiaryDim: 'rgba(74,85,104,0.12)',
//     tertiaryFaint: 'rgba(74,85,104,0.06)', tertiaryText: '#4A5568',
//     neutral: '#4A5568', neutralDim: 'rgba(74,85,104,0.12)', neutralText: '#4A5568',
//     success: '#2F855A', successDim: 'rgba(47,133,90,0.12)', successFaint: 'rgba(47,133,90,0.06)',
//     error: '#9B2C2C', errorDim: 'rgba(155,44,44,0.12)',
//     warning: '#C05621', warningDim: 'rgba(192,86,33,0.12)',
//     sidebar: '#0C1524', sidebarRaised: '#172438', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.06)', sidebarText: '#879BB8',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#63B3ED',
// }

// Theme 12: Deep Emerald
// export const T = {
//     bg: '#F1F6F4', surface: '#FFFFFF', surfaceRaised: '#F6FAF8',
//     surfaceHigh: '#DDE7E2', border: '#C7D7CF', borderSubtle: '#EBF2EF',
//     textPrimary: '#0D2119', textSecondary: '#365347', textMuted: '#668477',
//     textInverse: '#FFFFFF',
//     primary: '#144D34', primaryHover: '#0D3322', primaryDim: 'rgba(20,77,52,0.12)',
//     primaryFaint: 'rgba(20,77,52,0.06)', primaryText: '#144D34',
//     secondary: '#317A5D', secondaryDim: 'rgba(49,122,93,0.12)',
//     secondaryFaint: 'rgba(49,122,93,0.06)', secondaryText: '#317A5D',
//     tertiary: '#637A70', tertiaryDim: 'rgba(99,122,112,0.12)',
//     tertiaryFaint: 'rgba(99,122,112,0.06)', tertiaryText: '#637A70',
//     neutral: '#4C6157', neutralDim: 'rgba(76,97,87,0.12)', neutralText: '#4C6157',
//     success: '#144D34', successDim: 'rgba(20,77,52,0.12)', successFaint: 'rgba(20,77,52,0.06)',
//     error: '#9C3A3A', errorDim: 'rgba(156,58,58,0.12)',
//     warning: '#BFA13B', warningDim: 'rgba(191,161,59,0.12)',
//     sidebar: '#0A1A14', sidebarRaised: '#132C22', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.06)', sidebarText: '#83A697',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#52C796',
// }

// Theme 13: Vintage Burgundy
// export const T = {
//     bg: '#F7F2F3', surface: '#FFFFFF', surfaceRaised: '#FAF6F7',
//     surfaceHigh: '#EBE0E2', border: '#DBCACC', borderSubtle: '#F3ECEE',
//     textPrimary: '#241215', textSecondary: '#54363B', textMuted: '#87666C',
//     textInverse: '#FFFFFF',
//     primary: '#4A1D24', primaryHover: '#331418', primaryDim: 'rgba(74,29,36,0.12)',
//     primaryFaint: 'rgba(74,29,36,0.06)', primaryText: '#4A1D24',
//     secondary: '#803D4A', secondaryDim: 'rgba(128,61,74,0.12)',
//     secondaryFaint: 'rgba(128,61,74,0.06)', secondaryText: '#803D4A',
//     tertiary: '#85666B', tertiaryDim: 'rgba(133,102,107,0.12)',
//     tertiaryFaint: 'rgba(133,102,107,0.06)', tertiaryText: '#85666B',
//     neutral: '#614E51', neutralDim: 'rgba(97,78,81,0.12)', neutralText: '#614E51',
//     success: '#3A664A', successDim: 'rgba(58,102,74,0.12)', successFaint: 'rgba(58,102,74,0.06)',
//     error: '#9C3A3A', errorDim: 'rgba(156,58,58,0.12)',
//     warning: '#BFA13B', warningDim: 'rgba(191,161,59,0.12)',
//     sidebar: '#1F0B0E', sidebarRaised: '#33161B', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.06)', sidebarText: '#A8848A',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#D47285',
// }

// Theme 14: Royal Amethyst
// export const T = {
//     bg: '#F4F2F7', surface: '#FFFFFF', surfaceRaised: '#F8F6FA',
//     surfaceHigh: '#E3DFE8', border: '#CFCAC7', borderSubtle: '#EFECE6',
//     textPrimary: '#191224', textSecondary: '#463854', textMuted: '#766687',
//     textInverse: '#FFFFFF',
//     primary: '#321D4A', primaryHover: '#221433', primaryDim: 'rgba(50,29,74,0.12)',
//     primaryFaint: 'rgba(50,29,74,0.06)', primaryText: '#321D4A',
//     secondary: '#5E3D80', secondaryDim: 'rgba(94,61,128,0.12)',
//     secondaryFaint: 'rgba(94,61,128,0.06)', secondaryText: '#5E3D80',
//     tertiary: '#706685', tertiaryDim: 'rgba(112,102,133,0.12)',
//     tertiaryFaint: 'rgba(112,102,133,0.06)', tertiaryText: '#706685',
//     neutral: '#534E61', neutralDim: 'rgba(83,78,97,0.12)', neutralText: '#534E61',
//     success: '#3A664A', successDim: 'rgba(58,102,74,0.12)', successFaint: 'rgba(58,102,74,0.06)',
//     error: '#9C3A3A', errorDim: 'rgba(156,58,58,0.12)',
//     warning: '#BFA13B', warningDim: 'rgba(191,161,59,0.12)',
//     sidebar: '#140B1F', sidebarRaised: '#241533', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.06)', sidebarText: '#9A84A8',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#A772D4',
// }

// Theme 15: Teal Topaz
// export const T = {
//     bg: '#F0F5F6', surface: '#FFFFFF', surfaceRaised: '#F5FAFA',
//     surfaceHigh: '#DCE4E6', border: '#C9D5D6', borderSubtle: '#EBF2F3',
//     textPrimary: '#112124', textSecondary: '#365054', textMuted: '#668185',
//     textInverse: '#FFFFFF',
//     primary: '#1D454A', primaryHover: '#143136', primaryDim: 'rgba(29,69,74,0.12)',
//     primaryFaint: 'rgba(29,69,74,0.06)', primaryText: '#1D454A',
//     secondary: '#3D7680', secondaryDim: 'rgba(61,118,128,0.12)',
//     secondaryFaint: 'rgba(61,118,128,0.06)', secondaryText: '#3D7680',
//     tertiary: '#668085', tertiaryDim: 'rgba(102,128,133,0.12)',
//     tertiaryFaint: 'rgba(102,128,133,0.06)', tertiaryText: '#668085',
//     neutral: '#4E5F61', neutralDim: 'rgba(78,95,97,0.12)', neutralText: '#4E5F61',
//     success: '#2B664C', successDim: 'rgba(43,102,76,0.12)', successFaint: 'rgba(43,102,76,0.06)',
//     error: '#9C3A3B', errorDim: 'rgba(156,58,59,0.12)',
//     warning: '#BFA13B', warningDim: 'rgba(191,161,59,0.12)',
//     sidebar: '#0B1A1F', sidebarRaised: '#152E36', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.06)', sidebarText: '#849FA8',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#4AA3B5',
// }


// ==========================================
// CATEGORY 4: COOL TECH & BLUE DEV
// ==========================================

// Theme 16: Intercom Blue
// export const T = {
//     bg: '#F8FAFC', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
//     surfaceHigh: '#F1F5F9', border: '#E2E8F0', borderSubtle: '#F1F5F9',
//     textPrimary: '#0F172A', textSecondary: '#334155', textMuted: '#64748B',
//     textInverse: '#FFFFFF',
//     primary: '#0284C7', primaryHover: '#0369A1', primaryDim: 'rgba(2,132,199,0.12)',
//     primaryFaint: 'rgba(2,132,199,0.06)', primaryText: '#0284C7',
//     secondary: '#475569', secondaryDim: 'rgba(71,85,105,0.12)',
//     secondaryFaint: 'rgba(71,85,105,0.06)', secondaryText: '#475569',
//     tertiary: '#94A3B8', tertiaryDim: 'rgba(148,163,184,0.12)',
//     tertiaryFaint: 'rgba(148,163,184,0.06)', tertiaryText: '#94A3B8',
//     neutral: '#475569', neutralDim: 'rgba(71,85,105,0.12)', neutralText: '#475569',
//     success: '#16A34A', successDim: 'rgba(22,163,74,0.12)', successFaint: 'rgba(22,163,74,0.06)',
//     error: '#EF4444', errorDim: 'rgba(239,68,68,0.12)',
//     warning: '#F59E0B', warningDim: 'rgba(245,158,11,0.12)',
//     sidebar: '#0F172A', sidebarRaised: '#1E293B', sidebarHover: 'rgba(255,255,255,0.04)',
//     sidebarBorder: 'rgba(255,255,255,0.05)', sidebarText: '#94A3B8',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#38BDF8',
// }

// Theme 17: Linear Slate & Violet
// export const T = {
//     bg: '#F4F5F6', surface: '#FFFFFF', surfaceRaised: '#FAFBFB',
//     surfaceHigh: '#E4E6E9', border: '#D1D4DB', borderSubtle: '#EFF0F2',
//     textPrimary: '#121316', textSecondary: '#42454E', textMuted: '#727682',
//     textInverse: '#FFFFFF',
//     primary: '#5E5CE6', primaryHover: '#4D4BC9', primaryDim: 'rgba(94,92,230,0.12)',
//     primaryFaint: 'rgba(94,92,230,0.06)', primaryText: '#5E5CE6',
//     secondary: '#6366F1', secondaryDim: 'rgba(99,102,241,0.12)',
//     secondaryFaint: 'rgba(99,102,241,0.06)', secondaryText: '#6366F1',
//     tertiary: '#8B5CF6', tertiaryDim: 'rgba(139,92,246,0.12)',
//     tertiaryFaint: 'rgba(139,92,246,0.06)', tertiaryText: '#8B5CF6',
//     neutral: '#5A5E6B', neutralDim: 'rgba(90,94,107,0.12)', neutralText: '#5A5E6B',
//     success: '#10B981', successDim: 'rgba(16,185,129,0.12)', successFaint: 'rgba(16,185,129,0.06)',
//     error: '#F43F5E', errorDim: 'rgba(244,63,94,0.12)',
//     warning: '#F59E0B', warningDim: 'rgba(245,158,11,0.12)',
//     sidebar: '#121316', sidebarRaised: '#1C1E24', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.06)', sidebarText: '#8E92A0',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#A8A6FF',
// }

// Theme 18: Cyberpunk Mint Light
// export const T = {
//     bg: '#F4F7F6', surface: '#FFFFFF', surfaceRaised: '#FAFCFB',
//     surfaceHigh: '#E3ECE9', border: '#CCDCD7', borderSubtle: '#EEF4F2',
//     textPrimary: '#111A17', textSecondary: '#3B4D47', textMuted: '#6B807A',
//     textInverse: '#FFFFFF',
//     primary: '#00A86B', primaryHover: '#008F5A', primaryDim: 'rgba(0,168,107,0.12)',
//     primaryFaint: 'rgba(0,168,107,0.06)', primaryText: '#00A86B',
//     secondary: '#008080', secondaryDim: 'rgba(0,128,128,0.12)',
//     secondaryFaint: 'rgba(0,128,128,0.06)', secondaryText: '#008080',
//     tertiary: '#4D8070', tertiaryDim: 'rgba(77,128,112,0.12)',
//     tertiaryFaint: 'rgba(77,128,112,0.06)', tertiaryText: '#4D8070',
//     neutral: '#526660', neutralDim: 'rgba(82,102,96,0.12)', neutralText: '#526660',
//     success: '#00A86B', successDim: 'rgba(0,168,107,0.12)', successFaint: 'rgba(0,168,107,0.06)',
//     error: '#E65C5C', errorDim: 'rgba(230,92,92,0.12)',
//     warning: '#E6B800', warningDim: 'rgba(230,184,0,0.12)',
//     sidebar: '#0D1412', sidebarRaised: '#172420', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.06)', sidebarText: '#8CA69E',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#33FFB5',
// }

// Theme 19: Steel Indigo
// export const T = {
//     bg: '#F1F3F9', surface: '#FFFFFF', surfaceRaised: '#F6F8FC',
//     surfaceHigh: '#E2E6F0', border: '#D0D5E3', borderSubtle: '#ECF0F8',
//     textPrimary: '#181B24', textSecondary: '#444A5C', textMuted: '#747C94',
//     textInverse: '#FFFFFF',
//     primary: '#3F51B5', primaryHover: '#303F9F', primaryDim: 'rgba(63,81,181,0.12)',
//     primaryFaint: 'rgba(63,81,181,0.06)', primaryText: '#3F51B5',
//     secondary: '#5C6BC0', secondaryDim: 'rgba(92,107,192,0.12)',
//     secondaryFaint: 'rgba(92,107,192,0.06)', secondaryText: '#5C6BC0',
//     tertiary: '#7986CB', tertiaryDim: 'rgba(121,134,203,0.12)',
//     tertiaryFaint: 'rgba(121,134,203,0.06)', tertiaryText: '#7986CB',
//     neutral: '#575E70', neutralDim: 'rgba(87,94,112,0.12)', neutralText: '#575E70',
//     success: '#4CAF50', successDim: 'rgba(76,175,80,0.12)', successFaint: 'rgba(76,175,80,0.06)',
//     error: '#F44336', errorDim: 'rgba(244,67,54,0.12)',
//     warning: '#FF9800', warningDim: 'rgba(255,152,0,0.12)',
//     sidebar: '#181A21', sidebarRaised: '#242833', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.06)', sidebarText: '#8F97A8',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#9FA8DA',
// }

// Theme 20: Oceanic Deep & Cyan
// export const T = {
//     bg: '#F0F4F8', surface: '#FFFFFF', surfaceRaised: '#F5F8FA',
//     surfaceHigh: '#DDE4ED', border: '#C9D4E0', borderSubtle: '#EBF0F5',
//     textPrimary: '#101A24', textSecondary: '#3C4D5E', textMuted: '#6C8094',
//     textInverse: '#FFFFFF',
//     primary: '#0F4C81', primaryHover: '#0A3357', primaryDim: 'rgba(15,76,129,0.12)',
//     primaryFaint: 'rgba(15,76,129,0.06)', primaryText: '#0F4C81',
//     secondary: '#2A75A0', secondaryDim: 'rgba(42,117,160,0.12)',
//     secondaryFaint: 'rgba(42,117,160,0.06)', secondaryText: '#2A75A0',
//     tertiary: '#5B8FA8', tertiaryDim: 'rgba(91,143,168,0.12)',
//     tertiaryFaint: 'rgba(91,143,168,0.06)', tertiaryText: '#5B8FA8',
//     neutral: '#4E5E6E', neutralDim: 'rgba(78,94,110,0.12)', neutralText: '#4E5E6E',
//     success: '#2E7D32', successDim: 'rgba(46,125,50,0.12)', successFaint: 'rgba(46,125,50,0.06)',
//     error: '#C62828', errorDim: 'rgba(198,40,40,0.12)',
//     warning: '#EF6C00', warningDim: 'rgba(239,108,0,0.12)',
//     sidebar: '#0A121A', sidebarRaised: '#132230', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.06)', sidebarText: '#859BB0',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#4FA3D1',
// }


// ==========================================
// CATEGORY 5: DARK MODE ESSENTIALS
// ==========================================

// Theme 21: Charcoal Slate Dark
// export const T = {
//     bg: '#121214', surface: '#1A1A1E', surfaceRaised: '#222227',
//     surfaceHigh: '#2D2D34', border: '#33333B', borderSubtle: '#222226',
//     textPrimary: '#EEEEF2', textSecondary: '#A9A9B3', textMuted: '#6F6F7A',
//     textInverse: '#121214',
//     primary: '#A8B878', primaryHover: '#B8C888', primaryDim: 'rgba(168,184,120,0.15)',
//     primaryFaint: 'rgba(168,184,120,0.08)', primaryText: '#A8B878',
//     secondary: '#78A8B8', secondaryDim: 'rgba(120,168,184,0.15)',
//     secondaryFaint: 'rgba(120,168,184,0.08)', secondaryText: '#78A8B8',
//     tertiary: '#B89078', tertiaryDim: 'rgba(184,144,120,0.15)',
//     tertiaryFaint: 'rgba(184,144,120,0.08)', tertiaryText: '#B89078',
//     neutral: '#8A8A93', neutralDim: 'rgba(138,138,147,0.15)', neutralText: '#8A8A93',
//     success: '#A8B878', successDim: 'rgba(168,184,120,0.15)', successFaint: 'rgba(168,184,120,0.08)',
//     error: '#D47268', errorDim: 'rgba(212,114,104,0.15)',
//     warning: '#D4C068', warningDim: 'rgba(212,192,104,0.15)',
//     sidebar: '#121214', sidebarRaised: '#1A1A1E', sidebarHover: 'rgba(255,255,255,0.04)',
//     sidebarBorder: '#2D2D34', sidebarText: '#A9A9B3',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#A8B878',
// }

// Theme 22: Deep Ocean Dark
// export const T = {
//     bg: '#0B0F17', surface: '#121824', surfaceRaised: '#1A2233',
//     surfaceHigh: '#242F47', border: '#2B3954', borderSubtle: '#182030',
//     textPrimary: '#E6EDF8', textSecondary: '#94A7C5', textMuted: '#5F7290',
//     textInverse: '#0B0F17',
//     primary: '#38BDF8', primaryHover: '#7DD3FC', primaryDim: 'rgba(56,189,248,0.15)',
//     primaryFaint: 'rgba(56,189,248,0.08)', primaryText: '#38BDF8',
//     secondary: '#818CF8', secondaryDim: 'rgba(129,140,248,0.15)',
//     secondaryFaint: 'rgba(129,140,248,0.08)', secondaryText: '#818CF8',
//     tertiary: '#34D399', tertiaryDim: 'rgba(52,211,153,0.15)',
//     tertiaryFaint: 'rgba(52,211,153,0.08)', tertiaryText: '#34D399',
//     neutral: '#718096', neutralDim: 'rgba(113,128,150,0.15)', neutralText: '#718096',
//     success: '#34D399', successDim: 'rgba(52,211,153,0.15)', successFaint: 'rgba(52,211,153,0.08)',
//     error: '#F87171', errorDim: 'rgba(248,113,113,0.15)',
//     warning: '#FBBF24', warningDim: 'rgba(251,191,36,0.15)',
//     sidebar: '#0B0F17', sidebarRaised: '#121824', sidebarHover: 'rgba(255,255,255,0.04)',
//     sidebarBorder: '#242F47', sidebarText: '#94A7C5',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#38BDF8',
// }

// Theme 23: Obsidian Purple Dark
// export const T = {
//     bg: '#0F0E14', surface: '#171520', surfaceRaised: '#211E2E',
//     surfaceHigh: '#2C283D', border: '#38334D', borderSubtle: '#1F1C2B',
//     textPrimary: '#EBE8F5', textSecondary: '#A39DB8', textMuted: '#6B6580',
//     textInverse: '#0F0E14',
//     primary: '#A78BFA', primaryHover: '#C4B5FD', primaryDim: 'rgba(167,139,250,0.15)',
//     primaryFaint: 'rgba(167,139,250,0.08)', primaryText: '#A78BFA',
//     secondary: '#F472B6', secondaryDim: 'rgba(244,114,182,0.15)',
//     secondaryFaint: 'rgba(244,114,182,0.08)', secondaryText: '#F472B6',
//     tertiary: '#60A5FA', tertiaryDim: 'rgba(96,165,250,0.15)',
//     tertiaryFaint: 'rgba(96,165,250,0.08)', tertiaryText: '#60A5FA',
//     neutral: '#7C7594', neutralDim: 'rgba(124,117,148,0.15)', neutralText: '#7C7594',
//     success: '#34D399', successDim: 'rgba(52,211,153,0.15)', successFaint: 'rgba(52,211,153,0.08)',
//     error: '#F87171', errorDim: 'rgba(248,113,113,0.15)',
//     warning: '#FBBF24', warningDim: 'rgba(251,191,36,0.15)',
//     sidebar: '#0F0E14', sidebarRaised: '#171520', sidebarHover: 'rgba(255,255,255,0.04)',
//     sidebarBorder: '#2C283D', sidebarText: '#A39DB8',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#A78BFA',
// }

// Theme 24: Matrix Emerald Dark
// export const T = {
//     bg: '#0A0F0D', surface: '#111A16', surfaceRaised: '#192620',
//     surfaceHigh: '#22332B', border: '#2C4238', borderSubtle: '#15211B',
//     textPrimary: '#E6FAF2', textSecondary: '#94B8A9', textMuted: '#5F8072',
//     textInverse: '#0A0F0D',
//     primary: '#34D399', primaryHover: '#6EE7B7', primaryDim: 'rgba(52,211,153,0.15)',
//     primaryFaint: 'rgba(52,211,153,0.08)', primaryText: '#34D399',
//     secondary: '#22D3EE', secondaryDim: 'rgba(34,211,238,0.15)',
//     secondaryFaint: 'rgba(34,211,238,0.08)', secondaryText: '#22D3EE',
//     tertiary: '#A7F3D0', tertiaryDim: 'rgba(167,243,208,0.15)',
//     tertiaryFaint: 'rgba(167,243,208,0.08)', tertiaryText: '#A7F3D0',
//     neutral: '#6B8C7E', neutralDim: 'rgba(107,140,126,0.15)', neutralText: '#6B8C7E',
//     success: '#34D399', successDim: 'rgba(52,211,153,0.15)', successFaint: 'rgba(52,211,153,0.08)',
//     error: '#F87171', errorDim: 'rgba(248,113,113,0.15)',
//     warning: '#FBBF24', warningDim: 'rgba(251,191,36,0.15)',
//     sidebar: '#0A0F0D', sidebarRaised: '#111A16', sidebarHover: 'rgba(255,255,255,0.04)',
//     sidebarBorder: '#22332B', sidebarText: '#94B8A9',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#34D399',
// }

// Theme 25: Jet Black Minimal Dark
// export const T = {
//     bg: '#000000', surface: '#121212', surfaceRaised: '#1C1C1C',
//     surfaceHigh: '#2C2C2C', border: '#383838', borderSubtle: '#171717',
//     textPrimary: '#FFFFFF', textSecondary: '#A3A3A3', textMuted: '#666666',
//     textInverse: '#000000',
//     primary: '#FFFFFF', primaryHover: '#E5E5E5', primaryDim: 'rgba(255,255,255,0.15)',
//     primaryFaint: 'rgba(255,255,255,0.08)', primaryText: '#FFFFFF',
//     secondary: '#A3A3A3', secondaryDim: 'rgba(163,163,163,0.15)',
//     secondaryFaint: 'rgba(163,163,163,0.08)', secondaryText: '#A3A3A3',
//     tertiary: '#737373', tertiaryDim: 'rgba(115,115,115,0.15)',
//     tertiaryFaint: 'rgba(115,115,115,0.08)', tertiaryText: '#737373',
//     neutral: '#737373', neutralDim: 'rgba(115,115,115,0.15)', neutralText: '#737373',
//     success: '#22C55E', successDim: 'rgba(34,197,94,0.15)', successFaint: 'rgba(34,197,94,0.08)',
//     error: '#EF4444', errorDim: 'rgba(239,68,68,0.15)',
//     warning: '#F59E0B', warningDim: 'rgba(245,158,11,0.15)',
//     sidebar: '#000000', sidebarRaised: '#121212', sidebarHover: 'rgba(255,255,255,0.04)',
//     sidebarBorder: '#2C2C2C', sidebarText: '#A3A3A3',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#FFFFFF',
// }


// ==========================================
// CATEGORY 6: VIBRANT POP & PLAYFUL PASTEST
// ==========================================

// Theme 26: Sakura & Matcha Pastel
// export const T = {
//     bg: '#FBF7F5', surface: '#FFFFFF', surfaceRaised: '#FFFDFD',
//     surfaceHigh: '#F5ECE7', border: '#EAD9D0', borderSubtle: '#F7EFEA',
//     textPrimary: '#33221C', textSecondary: '#664B42', textMuted: '#997B70',
//     textInverse: '#FFFFFF',
//     primary: '#D47A9A', primaryHover: '#BA5D7D', primaryDim: 'rgba(212,122,154,0.12)',
//     primaryFaint: 'rgba(212,122,154,0.06)', primaryText: '#D47A9A',
//     secondary: '#76947A', secondaryDim: 'rgba(118,148,122,0.12)',
//     secondaryFaint: 'rgba(118,148,122,0.06)', secondaryText: '#76947A',
//     tertiary: '#CCA47A', tertiaryDim: 'rgba(204,164,122,0.12)',
//     tertiaryFaint: 'rgba(204,164,122,0.06)', tertiaryText: '#CCA47A',
//     neutral: '#7F6B64', neutralDim: 'rgba(127,107,100,0.12)', neutralText: '#7F6B64',
//     success: '#76947A', successDim: 'rgba(118,148,122,0.12)', successFaint: 'rgba(118,148,122,0.06)',
//     error: '#C46262', errorDim: 'rgba(196,98,98,0.12)',
//     warning: '#D4B24D', warningDim: 'rgba(212,178,77,0.12)',
//     sidebar: '#331C24', sidebarRaised: '#4A2C37', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#C497A7',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#D47A9A',
// }

// Theme 27: Retro Cream Pop (Orange & Teal)
// export const T = {
//     bg: '#FAF6F0', surface: '#FFFFFF', surfaceRaised: '#FFFDFC',
//     surfaceHigh: '#F2E6D5', border: '#E6D0B5', borderSubtle: '#F6ECE0',
//     textPrimary: '#3B240B', textSecondary: '#6E4E29', textMuted: '#A17D54',
//     textInverse: '#FFFFFF',
//     primary: '#E07A5F', primaryHover: '#C95D43', primaryDim: 'rgba(224,122,95,0.12)',
//     primaryFaint: 'rgba(224,122,95,0.06)', primaryText: '#E07A5F',
//     secondary: '#3D5A80', secondaryDim: 'rgba(61,90,128,0.12)',
//     secondaryFaint: 'rgba(61,90,128,0.06)', secondaryText: '#3D5A80',
//     tertiary: '#98C1D9', tertiaryDim: 'rgba(152,193,217,0.12)',
//     tertiaryFaint: 'rgba(152,193,217,0.06)', tertiaryText: '#98C1D9',
//     neutral: '#857564', neutralDim: 'rgba(133,117,100,0.12)', neutralText: '#857564',
//     success: '#52796F', successDim: 'rgba(82,121,111,0.12)', successFaint: 'rgba(82,121,111,0.06)',
//     error: '#C94343', errorDim: 'rgba(201,67,67,0.12)',
//     warning: '#E6A143', warningDim: 'rgba(230,161,67,0.12)',
//     sidebar: '#2B1A0A', sidebarRaised: '#3D2815', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#BAA084',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#E07A5F',
// }

// Theme 28: Ice Cold Lavender
// export const T = {
//     bg: '#F5F5FA', surface: '#FFFFFF', surfaceRaised: '#FBFBFF',
//     surfaceHigh: '#E7E7F2', border: '#D3D3E6', borderSubtle: '#EFEFF7',
//     textPrimary: '#17172B', textSecondary: '#424266', textMuted: '#7171A1',
//     textInverse: '#FFFFFF',
//     primary: '#706FD3', primaryHover: '#5B5AC7', primaryDim: 'rgba(112,111,211,0.12)',
//     primaryFaint: 'rgba(112,111,211,0.06)', primaryText: '#706FD3',
//     secondary: '#474787', secondaryDim: 'rgba(71,71,135,0.12)',
//     secondaryFaint: 'rgba(71,71,135,0.06)', secondaryText: '#474787',
//     tertiary: '#AAA69D', tertiaryDim: 'rgba(170,166,157,0.12)',
//     tertiaryFaint: 'rgba(170,166,157,0.06)', tertiaryText: '#AAA69D',
//     neutral: '#5D5D7A', neutralDim: 'rgba(93,93,122,0.12)', neutralText: '#5D5D7A',
//     success: '#2ECC71', successDim: 'rgba(46,204,113,0.12)', successFaint: 'rgba(46,204,113,0.06)',
//     error: '#FF5252', errorDim: 'rgba(255,82,82,0.12)',
//     warning: '#FFB142', warningDim: 'rgba(255,177,66,0.12)',
//     sidebar: '#17172B', sidebarRaised: '#242442', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#9595C4',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#706FD3',
// }

// Theme 29: Canary & Charcoal (High Contrast Clean)
export const T = {
    bg: '#FAFAFA', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
    surfaceHigh: '#EBEBEB', border: '#D6D6D6', borderSubtle: '#F2F2F2',
    textPrimary: '#1A1A1A', textSecondary: '#4D4D4D', textMuted: '#808080',
    textInverse: '#FFFFFF',
    primary: '#EAB308', primaryHover: '#CA8A04', primaryDim: 'rgba(234,179,8,0.15)',
    primaryFaint: 'rgba(234,179,8,0.07)', primaryText: '#CA8A04',
    secondary: '#1A1A1A', secondaryDim: 'rgba(26,26,26,0.12)',
    secondaryFaint: 'rgba(26,26,26,0.06)', secondaryText: '#1A1A1A',
    tertiary: '#737373', tertiaryDim: 'rgba(115,115,115,0.12)',
    tertiaryFaint: 'rgba(115,115,115,0.06)', tertiaryText: '#737373',
    neutral: '#404040', neutralDim: 'rgba(64,64,64,0.12)', neutralText: '#404040',
    success: '#16A34A', successDim: 'rgba(22,163,74,0.12)', successFaint: 'rgba(22,163,74,0.06)',
    error: '#DC2626', errorDim: 'rgba(220,38,38,0.12)',
    warning: '#EAB308', warningDim: 'rgba(234,179,8,0.12)',
    sidebar: '#1A1A1A', sidebarRaised: '#262626', sidebarHover: 'rgba(255,255,255,0.05)',
    sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#A3A3A3',
    sidebarTextHover: '#FFFFFF', sidebarActive: '#EAB308',
}

// Theme 30: Warm Coral Slate
// export const T = {
//     bg: '#F5F5F7', surface: '#FFFFFF', surfaceRaised: '#FAFAFB',
//     surfaceHigh: '#E5E5EB', border: '#D2D2DC', borderSubtle: '#EEEEF2',
//     textPrimary: '#11111A', textSecondary: '#444454', textMuted: '#77778F',
//     textInverse: '#FFFFFF',
//     primary: '#F26A5A', primaryHover: '#D95243', primaryDim: 'rgba(242,106,90,0.12)',
//     primaryFaint: 'rgba(242,106,90,0.06)', primaryText: '#F26A5A',
//     secondary: '#4A5D6E', secondaryDim: 'rgba(74,93,110,0.12)',
//     secondaryFaint: 'rgba(74,93,110,0.06)', secondaryText: '#4A5D6E',
//     tertiary: '#7C93A6', tertiaryDim: 'rgba(124,147,166,0.12)',
//     tertiaryFaint: 'rgba(124,147,166,0.06)', tertiaryText: '#7C93A6',
//     neutral: '#5C5C6E', neutralDim: 'rgba(92,92,110,0.12)', neutralText: '#5C5C6E',
//     success: '#3A6B52', successDim: 'rgba(58,107,82,0.12)', successFaint: 'rgba(58,107,82,0.06)',
//     error: '#D94343', errorDim: 'rgba(217,67,67,0.12)',
//     warning: '#E6A643', warningDim: 'rgba(230,166,67,0.12)',
//     sidebar: '#11111A', sidebarRaised: '#1E1E2E', sidebarHover: 'rgba(255,255,255,0.05)',
//     sidebarBorder: 'rgba(255,255,255,0.07)', sidebarText: '#8E8EAA',
//     sidebarTextHover: '#FFFFFF', sidebarActive: '#F26A5A',
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