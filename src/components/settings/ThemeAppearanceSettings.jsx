import { useState, useEffect } from 'react'
import {
    T,
    getThemeName,
    setThemeName,
    getPaletteName,
    setPaletteName,
    CURATED_PALETTES,
    getCustomThemeConfig,
    saveCustomTheme,
    resetCustomTheme,
    AVAILABLE_FONTS,
    FONT_SCALES,
    LETTER_SPACINGS,
    BORDER_RADII,
    ELEVATION_MODES,
    getAppearanceConfig,
    saveAppearanceConfig,
    resetAppearanceConfig,
    applyAppearanceConfig
} from '../../constants/theme'

// Preset popular brand accent swatches
const QUICK_SWATCHES = [
    { label: 'Indigo', hex: '#6366F1' },
    { label: 'Emerald', hex: '#10B981' },
    { label: 'Violet', hex: '#8B5CF6' },
    { label: 'Cyan', hex: '#06B6D4' },
    { label: 'Amber', hex: '#F59E0B' },
    { label: 'Rose', hex: '#F43F5E' },
    { label: 'Sky', hex: '#0EA5E9' },
    { label: 'Teal', hex: '#0D9488' },
    { label: 'Crimson', hex: '#DC2626' },
    { label: 'Orange', hex: '#F97316' },
    { label: 'Fuchsia', hex: '#D946EF' },
    { label: 'Blue', hex: '#2563EB' },
]

export default function ThemeAppearanceSettings() {
    const [, setTick] = useState(0)
    const currentMode = getThemeName()
    const activePaletteId = getPaletteName()

    // Listen to live theme & appearance broadcasts
    useEffect(() => {
        const handler = () => setTick(t => t + 1)
        window.addEventListener('crm-theme-changed', handler)
        window.addEventListener('crm-appearance-changed', handler)
        return () => {
            window.removeEventListener('crm-theme-changed', handler)
            window.removeEventListener('crm-appearance-changed', handler)
        }
    }, [])

    const isDark = currentMode === 'dark'

    // Appearance State (Typography & UI Geometry)
    const [appearance, setAppearance] = useState(() => getAppearanceConfig())
    // Custom Color Theme State
    const [customConfig, setCustomConfig] = useState(() => getCustomThemeConfig())
    const [savedSuccess, setSavedSuccess] = useState(false)
    const [activeSection, setActiveSection] = useState('all') // 'all', 'typography', 'colors', 'geometry'

    // Live preview values
    const selectedFont = AVAILABLE_FONTS.find(f => f.id === appearance.fontFamily) || AVAILABLE_FONTS[0]
    const selectedScale = FONT_SCALES.find(s => s.id === appearance.fontSize) || FONT_SCALES[1]
    const selectedRadius = BORDER_RADII.find(r => r.id === appearance.borderRadius) || BORDER_RADII[1]
    const selectedSpacing = LETTER_SPACINGS.find(l => l.id === appearance.letterSpacing) || LETTER_SPACINGS[1]

    const handleModeSwitch = (mode) => {
        setThemeName(mode)
    }

    const handleSelectPalette = (paletteId) => {
        setPaletteName(paletteId)
    }

    const handleUpdateAppearance = (key, value) => {
        const updated = { ...appearance, [key]: value }
        setAppearance(updated)
        // Immediately apply live so user feels the change instantly
        applyAppearanceConfig(updated)
        saveAppearanceConfig(updated)
    }

    const handleApplyCustomTheme = (e) => {
        e?.preventDefault()
        saveCustomTheme(customConfig)
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 3000)
    }

    const handleResetAll = () => {
        resetCustomTheme()
        const defaultApp = resetAppearanceConfig()
        setAppearance(defaultApp)
        setCustomConfig({
            primary: '#6366F1',
            sidebarLight: '#FFFFFF',
            sidebarDark: '#0D111D',
            name: 'My Custom Theme'
        })
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 3000)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* ── Top Status & Navigation Bar ─────────────────── */}
            <div
                className="p-5 rounded-2xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{ background: T.surface, borderColor: T.border }}
            >
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                            style={{ background: T.primaryDim, color: T.primary, borderColor: `${T.primary}40` }}>
                            Enterprise Theme Engine
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: T.surfaceHigh, color: T.textSecondary }}>
                            Font: {selectedFont.name} ({selectedScale.percentage})
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: T.surfaceHigh, color: T.textSecondary }}>
                            Mode: {isDark ? 'Obsidian Dark' : 'Crisp Light'}
                        </span>
                    </div>
                    <p className="text-xs" style={{ color: T.textMuted }}>
                        Full visual control: typography, font families, text scaling, letter spacing, UI geometry, and bespoke color palettes.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={handleResetAll}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:bg-black/5"
                        style={{ borderColor: T.border, color: T.textMuted }}
                    >
                        Reset Defaults
                    </button>
                    {savedSuccess && (
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 animate-in fade-in">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            Saved & Applied
                        </span>
                    )}
                </div>
            </div>

            {/* ── Section Quick Filter Tabs ────────────────────── */}
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
                {[
                    { id: 'all', label: 'All Controls', icon: 'dashboard_customize' },
                    { id: 'typography', label: 'Typography & Fonts', icon: 'text_fields' },
                    { id: 'colors', label: 'Color Themes & Palettes', icon: 'palette' },
                    { id: 'geometry', label: 'UI Geometry & Depth', icon: 'shape_line' },
                ].map(tab => {
                    const active = activeSection === tab.id
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveSection(tab.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                active ? 'shadow-xs scale-[1.01]' : 'hover:opacity-80'
                            }`}
                            style={{
                                background: active ? T.primaryDim : T.surface,
                                color: active ? T.primary : T.textSecondary,
                                borderColor: active ? T.primary : T.border,
                            }}
                        >
                            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* ── Section 1: Typography & Text Design Studio ──── */}
            {(activeSection === 'all' || activeSection === 'typography') && (
                <div
                    className="p-6 rounded-2xl border shadow-xs transition-all duration-200 space-y-6"
                    style={{ background: T.surface, borderColor: T.border }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b" style={{ borderColor: T.border }}>
                        <div>
                            <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: T.textPrimary }}>
                                <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>text_fields</span>
                                Typography & Font Studio
                            </h2>
                            <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                                Select your primary interface typeface. Tested for crisp clarity, high data density, and effortless reading.
                            </p>
                        </div>
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full border self-start sm:self-auto"
                            style={{ background: T.primaryDim, color: T.primary, borderColor: `${T.primary}40` }}>
                            {AVAILABLE_FONTS.length} Typefaces Available
                        </span>
                    </div>

                    {/* Font Family Cards */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider mb-3" style={{ color: T.textSecondary }}>
                            Select Font Family
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {AVAILABLE_FONTS.map((font) => {
                                const isSelected = appearance.fontFamily === font.id
                                return (
                                    <div
                                        key={font.id}
                                        onClick={() => handleUpdateAppearance('fontFamily', font.id)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer relative flex flex-col justify-between ${
                                            isSelected ? 'shadow-md scale-[1.01]' : 'hover:border-slate-400/50 hover:shadow-xs'
                                        }`}
                                        style={{
                                            background: isSelected ? T.primaryFaint : T.surfaceRaised,
                                            borderColor: isSelected ? T.primary : T.border,
                                        }}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <h3 className="text-xs font-black tracking-tight" style={{ color: T.textPrimary, fontFamily: font.value }}>
                                                    {font.name}
                                                </h3>
                                                <span className="text-[9.5px] font-black px-2 py-0.5 rounded-md border"
                                                    style={{
                                                        background: isSelected ? T.primary : T.surfaceHigh,
                                                        color: isSelected ? '#FFFFFF' : T.textMuted,
                                                        borderColor: isSelected ? T.primary : T.border,
                                                    }}>
                                                    {font.badge}
                                                </span>
                                            </div>
                                            <p className="text-[10.5px] mb-3" style={{ color: T.textMuted }}>
                                                {font.category}
                                            </p>
                                        </div>

                                        {/* Live pangram preview in that specific font */}
                                        <div
                                            className="p-2.5 rounded-lg border text-xs leading-snug"
                                            style={{
                                                background: isDark ? 'rgba(0,0,0,0.2)' : '#FFFFFF',
                                                borderColor: T.borderSubtle,
                                                fontFamily: font.value,
                                                color: T.textPrimary,
                                            }}
                                        >
                                            <p className="font-semibold text-[12.5px] mb-0.5">₹ 2,45,000 Pipeline</p>
                                            <p className="text-[11px] opacity-80">{font.sample}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Font Size & UI Density */}
                    <div className="pt-4 border-t" style={{ borderColor: T.border }}>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>
                                    Interface Density & Font Size
                                </label>
                                <p className="text-[11px]" style={{ color: T.textMuted }}>
                                    Adjust overall UI scaling to pack more data onto the screen or make text larger and easier to read.
                                </p>
                            </div>
                            <span className="text-xs font-black px-2.5 py-1 rounded-lg"
                                style={{ background: T.primaryDim, color: T.primary }}>
                                Base: {selectedScale.scale} ({selectedScale.percentage})
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {FONT_SCALES.map((scale) => {
                                const isSelected = appearance.fontSize === scale.id
                                return (
                                    <button
                                        key={scale.id}
                                        type="button"
                                        onClick={() => handleUpdateAppearance('fontSize', scale.id)}
                                        className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                            isSelected ? 'shadow-md scale-[1.01]' : 'hover:border-slate-400/50'
                                        }`}
                                        style={{
                                            background: isSelected ? T.primaryFaint : T.surfaceRaised,
                                            borderColor: isSelected ? T.primary : T.border,
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-black" style={{ color: T.textPrimary }}>{scale.name}</span>
                                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded"
                                                style={{ background: T.surfaceHigh, color: T.primary }}>
                                                {scale.percentage}
                                            </span>
                                        </div>
                                        <p className="text-[11px]" style={{ color: T.textMuted }}>{scale.description}</p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Letter Spacing (Tracking) */}
                    <div className="pt-4 border-t" style={{ borderColor: T.border }}>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>
                                    Letter Spacing & Kerning
                                </label>
                                <p className="text-[11px]" style={{ color: T.textMuted }}>
                                    Controls character tightness across headings and navigation labels.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {LETTER_SPACINGS.map((spacing) => {
                                const isSelected = appearance.letterSpacing === spacing.id
                                return (
                                    <button
                                        key={spacing.id}
                                        type="button"
                                        onClick={() => handleUpdateAppearance('letterSpacing', spacing.id)}
                                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                            isSelected ? 'ring-2 shadow-xs' : 'hover:border-slate-400/50'
                                        }`}
                                        style={{
                                            background: isSelected ? T.primaryFaint : T.surfaceRaised,
                                            borderColor: isSelected ? T.primary : T.border,
                                        }}
                                    >
                                        <div className="text-xs font-bold" style={{ color: T.textPrimary, letterSpacing: spacing.value }}>
                                            {spacing.name}
                                        </div>
                                        <p className="text-[10.5px] mt-0.5" style={{ color: T.textMuted }}>
                                            {spacing.description}
                                        </p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Section 2: UI Geometry, Shapes & Depth ──────── */}
            {(activeSection === 'all' || activeSection === 'geometry') && (
                <div
                    className="p-6 rounded-2xl border shadow-xs transition-all duration-200 space-y-6"
                    style={{ background: T.surface, borderColor: T.border }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b" style={{ borderColor: T.border }}>
                        <div>
                            <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: T.textPrimary }}>
                                <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>shape_line</span>
                                Interface Geometry & Card Depth
                            </h2>
                            <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                                Configure component corner roundness, card surface elevations, and visual contrast modes.
                            </p>
                        </div>
                    </div>

                    {/* Corner Radius */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: T.textSecondary }}>
                            Corner Roundness (Border Radius)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {BORDER_RADII.map((r) => {
                                const isSelected = appearance.borderRadius === r.id
                                return (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => handleUpdateAppearance('borderRadius', r.id)}
                                        className={`p-3.5 border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                                            isSelected ? 'shadow-md scale-[1.01]' : 'hover:border-slate-400/50'
                                        }`}
                                        style={{
                                            borderRadius: r.value,
                                            background: isSelected ? T.primaryFaint : T.surfaceRaised,
                                            borderColor: isSelected ? T.primary : T.border,
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-black" style={{ color: T.textPrimary }}>{r.name}</span>
                                            {/* Visual icon demonstrating the corner radius */}
                                            <div
                                                className="w-5 h-5 border-2 border-dashed"
                                                style={{
                                                    borderRadius: r.value,
                                                    borderColor: isSelected ? T.primary : T.textMuted,
                                                }}
                                            />
                                        </div>
                                        <p className="text-[10.5px]" style={{ color: T.textMuted }}>{r.description}</p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Surface Elevation & Depth */}
                    <div className="pt-4 border-t" style={{ borderColor: T.border }}>
                        <label className="block text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: T.textSecondary }}>
                            Card Elevation & Shadow Depth
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {ELEVATION_MODES.map((em) => {
                                const isSelected = (appearance.elevation || 'modern') === em.id
                                return (
                                    <button
                                        key={em.id}
                                        type="button"
                                        onClick={() => handleUpdateAppearance('elevation', em.id)}
                                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                            isSelected ? 'ring-2 shadow-xs' : 'hover:border-slate-400/50'
                                        }`}
                                        style={{
                                            background: isSelected ? T.primaryFaint : T.surfaceRaised,
                                            borderColor: isSelected ? T.primary : T.border,
                                        }}
                                    >
                                        <div className="text-xs font-bold" style={{ color: T.textPrimary }}>
                                            {em.name}
                                        </div>
                                        <p className="text-[10.5px] mt-0.5" style={{ color: T.textMuted }}>
                                            {em.description}
                                        </p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Section 3: Color Themes, Palettes & Custom Studio ── */}
            {(activeSection === 'all' || activeSection === 'colors') && (
                <>
                    {/* Color Mode (Light / Dark) */}
                    <div
                        className="p-6 rounded-2xl border shadow-xs transition-all duration-200"
                        style={{ background: T.surface, borderColor: T.border }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b" style={{ borderColor: T.border }}>
                            <div>
                                <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: T.textPrimary }}>
                                    <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>contrast</span>
                                    Color Mode
                                </h2>
                                <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                                    Switch between daytime crisp light mode and deep obsidian night mode.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleModeSwitch('light')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                        !isDark ? 'shadow-md scale-[1.02]' : 'hover:opacity-80'
                                    }`}
                                    style={{
                                        background: !isDark ? T.primary : T.surfaceHigh,
                                        color: !isDark ? '#FFFFFF' : T.textSecondary,
                                        borderColor: !isDark ? T.primary : T.border,
                                    }}
                                >
                                    <span className="material-symbols-outlined text-[17px]">light_mode</span>
                                    Light Mode
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleModeSwitch('dark')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                        isDark ? 'shadow-md scale-[1.02]' : 'hover:opacity-80'
                                    }`}
                                    style={{
                                        background: isDark ? T.primary : T.surfaceHigh,
                                        color: isDark ? '#FFFFFF' : T.textSecondary,
                                        borderColor: isDark ? T.primary : T.border,
                                    }}
                                >
                                    <span className="material-symbols-outlined text-[17px]">dark_mode</span>
                                    Dark Mode
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
                            <div
                                onClick={() => handleModeSwitch('light')}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer select-none flex items-center gap-4 ${
                                    !isDark ? 'shadow-md' : 'opacity-70 hover:opacity-100'
                                }`}
                                style={{
                                    background: !isDark ? T.primaryFaint : T.surfaceRaised,
                                    borderColor: !isDark ? T.primary : T.border,
                                }}
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                                    <span className="material-symbols-outlined text-[22px]">light_mode</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-xs font-bold" style={{ color: T.textPrimary }}>Crisp Light Mode</h3>
                                    <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>
                                        High contrast white surfaces with clear typography and vibrant primary accents.
                                    </p>
                                </div>
                                {!isDark && (
                                    <span className="material-symbols-outlined text-[20px] font-bold" style={{ color: T.primary }}>
                                        check_circle
                                    </span>
                                )}
                            </div>

                            <div
                                onClick={() => handleModeSwitch('dark')}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer select-none flex items-center gap-4 ${
                                    isDark ? 'shadow-md' : 'opacity-70 hover:opacity-100'
                                }`}
                                style={{
                                    background: isDark ? T.primaryDim : T.surfaceRaised,
                                    borderColor: isDark ? T.primary : T.border,
                                }}
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                                    <span className="material-symbols-outlined text-[22px]">dark_mode</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-xs font-bold" style={{ color: T.textPrimary }}>Obsidian Dark Mode</h3>
                                    <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>
                                        Carbon obsidian depth engineered for reduced eye strain during extended work hours.
                                    </p>
                                </div>
                                {isDark && (
                                    <span className="material-symbols-outlined text-[20px] font-bold" style={{ color: T.primary }}>
                                        check_circle
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Curated Palettes */}
                    <div
                        className="p-6 rounded-2xl border shadow-xs transition-all duration-200"
                        style={{ background: T.surface, borderColor: T.border }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b" style={{ borderColor: T.border }}>
                            <div>
                                <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: T.textPrimary }}>
                                    <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>palette</span>
                                    Curated Theme Palettes
                                </h2>
                                <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                                    Curated SaaS color combinations inspired by Linear, Stripe, Raycast, and Supabase.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
                            {CURATED_PALETTES.map((palette) => {
                                const isSelected = activePaletteId === palette.id
                                return (
                                    <div
                                        key={palette.id}
                                        onClick={() => handleSelectPalette(palette.id)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer relative group flex flex-col justify-between ${
                                            isSelected
                                                ? 'shadow-lg scale-[1.01]'
                                                : 'hover:border-slate-400/50 hover:shadow-xs'
                                        }`}
                                        style={{
                                            background: isSelected ? T.primaryFaint : T.surfaceRaised,
                                            borderColor: isSelected ? T.primary : T.border,
                                        }}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className="w-4.5 h-4.5 rounded-full shrink-0 shadow-sm ring-2 ring-white/20"
                                                        style={{ background: palette.accentColor }}
                                                    />
                                                    <h3 className="text-xs font-black tracking-tight" style={{ color: T.textPrimary }}>
                                                        {palette.name}
                                                    </h3>
                                                </div>
                                                {isSelected && (
                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                                        style={{ background: T.primary, color: '#FFFFFF' }}>
                                                        Active
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-[11px] leading-relaxed mb-4" style={{ color: T.textMuted }}>
                                                {palette.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 pt-2 border-t" style={{ borderColor: T.borderSubtle }}>
                                            <div className="h-2 flex-1 rounded-full" style={{ background: palette.accentColor }} />
                                            <div className="h-2 w-5 rounded-full" style={{ background: palette.light.surface }} title="Light Surface" />
                                            <div className="h-2 w-5 rounded-full" style={{ background: palette.dark.surface }} title="Dark Surface" />
                                            <div className="h-2 w-5 rounded-full" style={{ background: palette.dark.sidebar }} title="Sidebar" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Bespoke Custom Theme Studio */}
                    <div
                        className="p-6 rounded-2xl border shadow-xs transition-all duration-200"
                        style={{ background: T.surface, borderColor: T.border }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b" style={{ borderColor: T.border }}>
                            <div>
                                <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: T.textPrimary }}>
                                    <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>tune</span>
                                    Bespoke Custom Theme Studio
                                </h2>
                                <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                                    Build your company brand theme. Pick any custom accent color, customize sidebar tone, and save with 0ms reload.
                                </p>
                            </div>

                            {activePaletteId === 'custom' && (
                                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border self-start sm:self-auto bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                    Custom Theme Active
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
                            {/* Controls Column */}
                            <div className="lg:col-span-7 space-y-5">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: T.textSecondary }}>
                                        Theme Name
                                    </label>
                                    <input
                                        type="text"
                                        value={customConfig.name}
                                        onChange={e => setCustomConfig(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. Acme Corporate Navy"
                                        className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all"
                                        style={{
                                            background: T.surfaceRaised,
                                            color: T.textPrimary,
                                            borderColor: T.border,
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: T.textSecondary }}>
                                        Primary Brand Accent Color
                                    </label>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="relative flex items-center">
                                            <input
                                                type="color"
                                                value={customConfig.primary}
                                                onChange={e => setCustomConfig(prev => ({ ...prev, primary: e.target.value }))}
                                                className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 overflow-hidden shrink-0 shadow-sm"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={customConfig.primary}
                                            onChange={e => setCustomConfig(prev => ({ ...prev, primary: e.target.value }))}
                                            placeholder="#6366F1"
                                            className="w-32 px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase border outline-none"
                                            style={{
                                                background: T.surfaceRaised,
                                                color: T.textPrimary,
                                                borderColor: T.border,
                                            }}
                                        />
                                        <span className="text-[11px]" style={{ color: T.textMuted }}>
                                            Choose any brand hex or pick from quick swatches
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {QUICK_SWATCHES.map(s => {
                                            const isCurrent = customConfig.primary.toUpperCase() === s.hex.toUpperCase()
                                            return (
                                                <button
                                                    key={s.hex}
                                                    type="button"
                                                    onClick={() => setCustomConfig(prev => ({ ...prev, primary: s.hex }))}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                                                        isCurrent ? 'ring-2 shadow-xs' : 'opacity-85 hover:opacity-100'
                                                    }`}
                                                    style={{
                                                        background: T.surfaceRaised,
                                                        borderColor: isCurrent ? s.hex : T.border,
                                                        color: T.textPrimary,
                                                    }}
                                                >
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.hex }} />
                                                    {s.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: T.textSecondary }}>
                                        Sidebar Style in Light Mode
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {[
                                            { label: 'Pure White (Recommended)', value: '#FFFFFF', hint: 'Clean & minimalist' },
                                            { label: 'Deep Slate', value: '#0F172A', hint: 'High contrast dark' },
                                            { label: 'Soft Slate', value: '#F8FAFC', hint: 'Subtle elevation' },
                                        ].map(opt => {
                                            const isSel = (customConfig.sidebarLight || '#FFFFFF').toUpperCase() === opt.value.toUpperCase()
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => setCustomConfig(prev => ({ ...prev, sidebarLight: opt.value }))}
                                                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                        isSel ? 'ring-2 shadow-xs' : 'opacity-80 hover:opacity-100'
                                                    }`}
                                                    style={{
                                                        background: T.surfaceRaised,
                                                        borderColor: isSel ? customConfig.primary : T.border,
                                                    }}
                                                >
                                                    <p className="text-xs font-bold" style={{ color: T.textPrimary }}>{opt.label}</p>
                                                    <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>{opt.hint}</p>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: T.border }}>
                                    <button
                                        type="button"
                                        onClick={handleApplyCustomTheme}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all cursor-pointer hover:opacity-90 active:scale-95"
                                        style={{
                                            background: customConfig.primary,
                                            boxShadow: `0 8px 20px -4px ${customConfig.primary}50`,
                                        }}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                        Save & Apply Custom Theme
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleResetAll}
                                        className="px-4 py-2.5 rounded-xl font-semibold text-xs border transition-all cursor-pointer hover:bg-black/5"
                                        style={{ borderColor: T.border, color: T.textMuted }}
                                    >
                                        Reset to Default
                                    </button>
                                </div>
                            </div>

                            {/* Live Preview Panel */}
                            <div className="lg:col-span-5">
                                <div
                                    className="p-5 rounded-2xl border shadow-md space-y-4 sticky top-6"
                                    style={{
                                        background: isDark ? '#0D111D' : '#F8FAFC',
                                        borderColor: T.border,
                                        fontFamily: selectedFont.value,
                                    }}
                                >
                                    <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: T.border }}>
                                        <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textMuted }}>
                                            Theme Preview
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: `${customConfig.primary}20`, color: customConfig.primary }}>
                                            {isDark ? 'Dark Preview' : 'Light Preview'}
                                        </span>
                                    </div>

                                    {/* Sample Active Nav Item */}
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-bold" style={{ color: T.textMuted }}>Active Navigation Item</span>
                                        <div
                                            className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold border shadow-xs"
                                            style={{
                                                background: isDark
                                                    ? `linear-gradient(90deg, ${customConfig.primary}30 0%, rgba(255,255,255,0.02) 100%)`
                                                    : `linear-gradient(90deg, ${customConfig.primary}18 0%, ${customConfig.primary}08 100%)`,
                                                borderColor: `${customConfig.primary}50`,
                                                color: isDark ? '#FFFFFF' : customConfig.primary,
                                            }}
                                        >
                                            <div
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.2 h-5 rounded-r-full"
                                                style={{ background: customConfig.primary, boxShadow: `0 0 10px ${customConfig.primary}` }}
                                            />
                                            <span className="material-symbols-outlined text-[18px] filled" style={{ color: customConfig.primary }}>
                                                dashboard
                                            </span>
                                            <span>Dashboard (Active)</span>
                                        </div>
                                    </div>

                                    {/* Sample Button & Badges */}
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-bold" style={{ color: T.textMuted }}>Action Buttons</span>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs"
                                                style={{ background: customConfig.primary }}
                                            >
                                                Primary Action
                                            </button>
                                            <span
                                                className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                                                style={{ background: `${customConfig.primary}20`, color: customConfig.primary }}
                                            >
                                                Live Badge
                                            </span>
                                        </div>
                                    </div>

                                    {/* Sample Metric Box */}
                                    <div
                                        className="p-3.5 rounded-xl border shadow-xs"
                                        style={{
                                            background: isDark ? '#161F33' : '#FFFFFF',
                                            borderColor: `${customConfig.primary}30`,
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: T.textMuted }}>
                                                Sample Revenue Card
                                            </span>
                                            <span className="material-symbols-outlined text-[16px]" style={{ color: customConfig.primary }}>
                                                trending_up
                                            </span>
                                        </div>
                                        <div className="text-lg font-black" style={{ color: customConfig.primary }}>
                                            ₹ 14,85,000
                                        </div>
                                        <p className="text-[10.5px] mt-0.5" style={{ color: T.textMuted }}>
                                            +24.8% growth vs last quarter
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Section 4: Enterprise Live Component Playground ─ */}
            <div
                className="p-6 rounded-2xl border shadow-sm space-y-5"
                style={{
                    background: T.surface,
                    borderColor: T.border,
                    fontFamily: selectedFont.value,
                    letterSpacing: selectedSpacing.value,
                }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b" style={{ borderColor: T.border }}>
                    <div>
                        <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: T.textPrimary }}>
                            <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>preview</span>
                            Live Enterprise Component Playground
                        </h2>
                        <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                            Real-time rendering of your active typography, font scaling ({selectedScale.percentage}), corner radius ({selectedRadius.value}), and theme palette.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg border"
                            style={{ background: T.surfaceHigh, borderColor: T.border, color: T.textPrimary }}>
                            Typeface: {selectedFont.name}
                        </span>
                    </div>
                </div>

                {/* Typography Hierarchy Sample */}
                <div className="space-y-3">
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: T.textPrimary }}>
                        Enterprise Pipeline & Growth Analytics
                    </h1>
                    <p className="text-sm leading-relaxed max-w-3xl" style={{ color: T.textSecondary }}>
                        Every detail of Iinventive CRM adapts dynamically. Font scaling, kerning, and color contrast ensure that high-stakes sales conversations, deal velocity, and pipeline forecasting are readable and crisp on every display.
                    </p>
                </div>

                {/* Sample Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div
                        className="p-4 border transition-all"
                        style={{
                            borderRadius: selectedRadius.value,
                            background: T.surfaceRaised,
                            borderColor: T.border,
                        }}
                    >
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider" style={{ color: T.textMuted }}>
                            Total Pipeline Value
                        </span>
                        <div className="text-xl font-black mt-1" style={{ color: T.primary }}>
                            ₹ 48,20,000
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400">
                                +32.4%
                            </span>
                            <span className="text-[10.5px]" style={{ color: T.textMuted }}>vs last month</span>
                        </div>
                    </div>

                    <div
                        className="p-4 border transition-all"
                        style={{
                            borderRadius: selectedRadius.value,
                            background: T.surfaceRaised,
                            borderColor: T.border,
                        }}
                    >
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider" style={{ color: T.textMuted }}>
                            Win Rate Velocity
                        </span>
                        <div className="text-xl font-black mt-1" style={{ color: T.success }}>
                            64.2%
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400">
                                +8.1%
                            </span>
                            <span className="text-[10.5px]" style={{ color: T.textMuted }}>conversion rate</span>
                        </div>
                    </div>

                    <div
                        className="p-4 border transition-all"
                        style={{
                            borderRadius: selectedRadius.value,
                            background: T.surfaceRaised,
                            borderColor: T.border,
                        }}
                    >
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider" style={{ color: T.textMuted }}>
                            Active Deal Count
                        </span>
                        <div className="text-xl font-black mt-1" style={{ color: T.textPrimary }}>
                            142 Deals
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-indigo-500/15 text-indigo-400">
                                18 Closing
                            </span>
                            <span className="text-[10.5px]" style={{ color: T.textMuted }}>this week</span>
                        </div>
                    </div>
                </div>

                {/* Sample Form Elements */}
                <div className="pt-4 border-t space-y-3" style={{ borderColor: T.border }}>
                    <label className="block text-[11px] font-black uppercase tracking-wider" style={{ color: T.textSecondary }}>
                        Interactive Form Controls & Badges
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]" style={{ color: T.textMuted }}>
                                search
                            </span>
                            <input
                                type="text"
                                readOnly
                                value="Search deals, contacts, accounts..."
                                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold border outline-none cursor-default"
                                style={{
                                    borderRadius: selectedRadius.value,
                                    background: T.surfaceRaised,
                                    color: T.textPrimary,
                                    borderColor: T.border,
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            className="px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer hover:opacity-95"
                            style={{
                                borderRadius: selectedRadius.value,
                                background: T.primary,
                                boxShadow: `0 4px 14px -2px ${T.primary}40`,
                            }}
                        >
                            + New Deal
                        </button>

                        <button
                            type="button"
                            className="px-4 py-2.5 text-xs font-bold border transition-all cursor-pointer hover:bg-black/5"
                            style={{
                                borderRadius: selectedRadius.value,
                                borderColor: T.border,
                                color: T.textPrimary,
                            }}
                        >
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
