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
    TABLE_DENSITIES,
    MOTION_SPEEDS,
    FOCUS_RING_STYLES,
    SIDEBAR_TREATMENTS,
    THEME_MODES,
    getAppearanceConfig,
    saveAppearanceConfig,
    resetAppearanceConfig,
    applyAppearanceConfig,
    exportThemePackage,
    importThemePackage
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

    // Appearance State (Typography, Tables, Motion, Geometry)
    const [appearance, setAppearance] = useState(() => getAppearanceConfig())
    // Custom Color Theme State
    const [customConfig, setCustomConfig] = useState(() => getCustomThemeConfig())
    const [savedSuccess, setSavedSuccess] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')
    const [activeTab, setActiveTab] = useState('typography') // 'typography', 'colors', 'tables', 'accessibility', 'share'
    const [importJsonText, setImportJsonText] = useState('')
    const [importError, setImportError] = useState('')

    // Live preview values
    const selectedFont = AVAILABLE_FONTS.find(f => f.id === appearance.fontFamily) || AVAILABLE_FONTS[0]
    const selectedScale = FONT_SCALES.find(s => s.id === appearance.fontSize) || FONT_SCALES[1]
    const selectedRadius = BORDER_RADII.find(r => r.id === appearance.borderRadius) || BORDER_RADII[1]
    const selectedSpacing = LETTER_SPACINGS.find(l => l.id === appearance.letterSpacing) || LETTER_SPACINGS[1]

    const handleModeSwitch = (mode) => {
        setThemeName(mode)
        handleUpdateAppearance('themeMode', mode)
    }

    const handleSelectPalette = (paletteId) => {
        setPaletteName(paletteId)
    }

    const handleUpdateAppearance = (key, value) => {
        const updated = { ...appearance, [key]: value }
        setAppearance(updated)
        applyAppearanceConfig(updated)
        saveAppearanceConfig(updated)
    }

    const handleApplyCustomTheme = (e) => {
        e?.preventDefault()
        saveCustomTheme(customConfig)
        setSavedSuccess(true)
        setStatusMessage('Custom Theme Applied!')
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
        setStatusMessage('Reset to Enterprise Defaults')
        setTimeout(() => setSavedSuccess(false), 3000)
    }

    const handleExportTheme = () => {
        const pkg = exportThemePackage()
        const jsonStr = JSON.stringify(pkg, null, 2)
        navigator.clipboard.writeText(jsonStr)
        setSavedSuccess(true)
        setStatusMessage('Theme JSON copied to clipboard!')
        setTimeout(() => setSavedSuccess(false), 3000)
    }

    const handleImportTheme = () => {
        setImportError('')
        if (!importJsonText.trim()) return
        const res = importThemePackage(importJsonText)
        if (res.success) {
            setAppearance(getAppearanceConfig())
            setCustomConfig(getCustomThemeConfig())
            setImportJsonText('')
            setSavedSuccess(true)
            setStatusMessage('Theme successfully imported!')
            setTimeout(() => setSavedSuccess(false), 3000)
        } else {
            setImportError('Invalid JSON format: ' + res.error)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* ── Top Header / Status Overview ─────────────────── */}
            <div
                className="p-6 rounded-2xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{ background: T.surface, borderColor: T.border }}
            >
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                            style={{ background: T.primaryDim, color: T.primary, borderColor: `${T.primary}40` }}>
                            Enterprise Theme Studio
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: T.surfaceHigh, color: T.textSecondary }}>
                            Font: {selectedFont.name} ({selectedScale.percentage})
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: T.surfaceHigh, color: T.textSecondary }}>
                            Motion: {appearance.motionSpeed}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: T.surfaceHigh, color: T.textSecondary }}>
                            Density: {appearance.tableDensity}
                        </span>
                    </div>
                    <p className="text-xs" style={{ color: T.textMuted }}>
                        Full visual control: typography, font density, tabular numbers, data grid density, glassmorphism, and shareable themes.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
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
                            {statusMessage}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Enterprise Tab Navigation ───────────────────── */}
            <div
                className="flex p-1.5 rounded-2xl border overflow-x-auto whitespace-nowrap scrollbar-none gap-1 sm:gap-2"
                style={{ background: T.surface, borderColor: T.border }}
            >
                {[
                    { id: 'typography', label: 'Typography & Fonts', icon: 'text_fields' },
                    { id: 'colors', label: 'Color Themes & Palettes', icon: 'palette' },
                    { id: 'tables', label: 'Data Grid & Tables', icon: 'table_chart' },
                    { id: 'accessibility', label: 'Motion & Geometry', icon: 'tune' },
                    { id: 'share', label: 'Shareable Themes', icon: 'share' },
                ].map(tab => {
                    const active = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer shrink-0 ${
                                active ? 'shadow-sm scale-[1.01]' : 'hover:opacity-85'
                            }`}
                            style={{
                                background: active ? T.primary : 'transparent',
                                color: active ? '#FFFFFF' : T.textSecondary,
                            }}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* ── TAB 1: Typography & Text Design Studio ───────── */}
            {activeTab === 'typography' && (
                <div
                    className="p-6 rounded-2xl border shadow-xs space-y-6 animate-in fade-in duration-150"
                    style={{ background: T.surface, borderColor: T.border }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b" style={{ borderColor: T.border }}>
                        <div>
                            <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: T.textPrimary }}>
                                <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>text_fields</span>
                                Typography & Font Studio
                            </h2>
                            <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                                Select your primary typeface. Benchmarked against Stripe, GitHub, Linear, and Supabase for highest legibility.
                            </p>
                        </div>
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full border self-start sm:self-auto"
                            style={{ background: T.primaryDim, color: T.primary, borderColor: `${T.primary}40` }}>
                            {AVAILABLE_FONTS.length} Typefaces
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
                                    Interface Density & Font Scale
                                </label>
                                <p className="text-[11px]" style={{ color: T.textMuted }}>
                                    Scales typography proportionally across all dashboards, sidebars, and dialogs.
                                </p>
                            </div>
                            <span className="text-xs font-black px-2.5 py-1 rounded-lg"
                                style={{ background: T.primaryDim, color: T.primary }}>
                                Scale: {selectedScale.scale} ({selectedScale.percentage})
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

                    {/* Letter Spacing & Tabular Numbers */}
                    <div className="pt-4 border-t grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ borderColor: T.border }}>
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: T.textSecondary }}>
                                Letter Spacing (Tracking)
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {LETTER_SPACINGS.map((spacing) => {
                                    const isSelected = appearance.letterSpacing === spacing.id
                                    return (
                                        <button
                                            key={spacing.id}
                                            type="button"
                                            onClick={() => handleUpdateAppearance('letterSpacing', spacing.id)}
                                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                                isSelected ? 'ring-2 shadow-xs' : 'hover:border-slate-400/50'
                                            }`}
                                            style={{
                                                background: isSelected ? T.primaryFaint : T.surfaceRaised,
                                                borderColor: isSelected ? T.primary : T.border,
                                                letterSpacing: spacing.value,
                                                color: T.textPrimary,
                                            }}
                                        >
                                            <span className="text-xs font-bold">{spacing.name}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Tabular Numbers Feature */}
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: T.textSecondary }}>
                                Tabular Numbers (tnum)
                            </label>
                            <div
                                onClick={() => handleUpdateAppearance('tabularNumbers', !appearance.tabularNumbers)}
                                className="p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all"
                                style={{
                                    background: appearance.tabularNumbers ? T.primaryFaint : T.surfaceRaised,
                                    borderColor: appearance.tabularNumbers ? T.primary : T.border,
                                }}
                            >
                                <div>
                                    <p className="text-xs font-bold" style={{ color: T.textPrimary }}>
                                        Monospace Alignment for Numbers
                                    </p>
                                    <p className="text-[10.5px] mt-0.5" style={{ color: T.textMuted }}>
                                        Prevents horizontal jittering in deal amounts, counters, and table currency columns.
                                    </p>
                                </div>
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                                    appearance.tabularNumbers ? 'bg-emerald-500 text-white' : 'border'
                                }`}>
                                    {appearance.tabularNumbers ? '✓' : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB 2: Color Themes, Palettes & Custom Studio ── */}
            {activeTab === 'colors' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                    {/* Mode Selector (Light, Dark, System, Schedule) */}
                    <div
                        className="p-6 rounded-2xl border shadow-xs"
                        style={{ background: T.surface, borderColor: T.border }}
                    >
                        <h2 className="text-base font-extrabold flex items-center gap-2 mb-1" style={{ color: T.textPrimary }}>
                            <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>contrast</span>
                            Color Mode Automation
                        </h2>
                        <p className="text-xs mb-4" style={{ color: T.textMuted }}>
                            Choose manual mode, sync automatically with your device OS, or follow a solar sunrise/sunset schedule.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {THEME_MODES.map((tm) => {
                                const isSelected = (appearance.themeMode || 'light') === tm.id
                                return (
                                    <button
                                        key={tm.id}
                                        type="button"
                                        onClick={() => handleModeSwitch(tm.id)}
                                        className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                            isSelected ? 'shadow-md scale-[1.01]' : 'hover:border-slate-400/50'
                                        }`}
                                        style={{
                                            background: isSelected ? T.primaryFaint : T.surfaceRaised,
                                            borderColor: isSelected ? T.primary : T.border,
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="material-symbols-outlined text-[19px]" style={{ color: T.primary }}>
                                                {tm.icon}
                                            </span>
                                            <span className="text-xs font-bold" style={{ color: T.textPrimary }}>{tm.name}</span>
                                        </div>
                                        <p className="text-[10.5px]" style={{ color: T.textMuted }}>{tm.description}</p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Curated Theme Palettes */}
                    <div
                        className="p-6 rounded-2xl border shadow-xs"
                        style={{ background: T.surface, borderColor: T.border }}
                    >
                        <div className="flex items-center justify-between pb-4 border-b mb-4" style={{ borderColor: T.border }}>
                            <div>
                                <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: T.textPrimary }}>
                                    <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>palette</span>
                                    Curated Theme Palettes
                                </h2>
                                <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
                                    Engineered SaaS color schemes inspired by Linear, Stripe, Raycast, and Supabase.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {CURATED_PALETTES.map((palette) => {
                                const isSelected = activePaletteId === palette.id
                                return (
                                    <div
                                        key={palette.id}
                                        onClick={() => handleSelectPalette(palette.id)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                                            isSelected ? 'shadow-lg scale-[1.01]' : 'hover:border-slate-400/50'
                                        }`}
                                        style={{
                                            background: isSelected ? T.primaryFaint : T.surfaceRaised,
                                            borderColor: isSelected ? T.primary : T.border,
                                        }}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full shadow-xs" style={{ background: palette.accentColor }} />
                                                    <h3 className="text-xs font-black" style={{ color: T.textPrimary }}>
                                                        {palette.name}
                                                    </h3>
                                                </div>
                                                {isSelected && (
                                                    <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full text-white"
                                                        style={{ background: T.primary }}>
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] mb-3" style={{ color: T.textMuted }}>
                                                {palette.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 pt-2 border-t" style={{ borderColor: T.borderSubtle }}>
                                            <div className="h-2 flex-1 rounded-full" style={{ background: palette.accentColor }} />
                                            <div className="h-2 w-5 rounded-full" style={{ background: palette.light.surface }} />
                                            <div className="h-2 w-5 rounded-full" style={{ background: palette.dark.surface }} />
                                            <div className="h-2 w-5 rounded-full" style={{ background: palette.dark.sidebar }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Bespoke Custom Studio & Sidebar Treatments */}
                    <div
                        className="p-6 rounded-2xl border shadow-xs"
                        style={{ background: T.surface, borderColor: T.border }}
                    >
                        <h2 className="text-base font-extrabold flex items-center gap-2 mb-1" style={{ color: T.textPrimary }}>
                            <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>tune</span>
                            Custom Theme & Sidebar Studio
                        </h2>
                        <p className="text-xs mb-5" style={{ color: T.textMuted }}>
                            Design your bespoke brand colors and sidebar surface style.
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-7 space-y-4">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: T.textSecondary }}>
                                        Theme Name
                                    </label>
                                    <input
                                        type="text"
                                        value={customConfig.name}
                                        onChange={e => setCustomConfig(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. Acme Tech Navy"
                                        className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border outline-none"
                                        style={{ background: T.surfaceRaised, color: T.textPrimary, borderColor: T.border }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: T.textSecondary }}>
                                        Brand Primary Color
                                    </label>
                                    <div className="flex items-center gap-3 mb-3">
                                        <input
                                            type="color"
                                            value={customConfig.primary}
                                            onChange={e => setCustomConfig(prev => ({ ...prev, primary: e.target.value }))}
                                            className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 overflow-hidden shrink-0 shadow-xs"
                                        />
                                        <input
                                            type="text"
                                            value={customConfig.primary}
                                            onChange={e => setCustomConfig(prev => ({ ...prev, primary: e.target.value }))}
                                            className="w-32 px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase border outline-none"
                                            style={{ background: T.surfaceRaised, color: T.textPrimary, borderColor: T.border }}
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {QUICK_SWATCHES.map(s => (
                                            <button
                                                key={s.hex}
                                                type="button"
                                                onClick={() => setCustomConfig(prev => ({ ...prev, primary: s.hex }))}
                                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border cursor-pointer hover:opacity-100"
                                                style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                                            >
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.hex }} />
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sidebar Surface Treatment */}
                                <div className="pt-2">
                                    <label className="block text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: T.textSecondary }}>
                                        Sidebar Material Treatment
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        {SIDEBAR_TREATMENTS.map(st => {
                                            const isSel = (appearance.sidebarTreatment || 'solid') === st.id
                                            return (
                                                <button
                                                    key={st.id}
                                                    type="button"
                                                    onClick={() => handleUpdateAppearance('sidebarTreatment', st.id)}
                                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                        isSel ? 'ring-2 shadow-xs' : 'hover:border-slate-400/50'
                                                    }`}
                                                    style={{
                                                        background: isSel ? T.primaryFaint : T.surfaceRaised,
                                                        borderColor: isSel ? T.primary : T.border,
                                                    }}
                                                >
                                                    <p className="text-xs font-bold" style={{ color: T.textPrimary }}>{st.name}</p>
                                                    <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>{st.description}</p>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={handleApplyCustomTheme}
                                        className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md cursor-pointer hover:opacity-90"
                                        style={{ background: customConfig.primary }}
                                    >
                                        Save & Apply Custom Theme
                                    </button>
                                </div>
                            </div>

                            {/* Live Theme Swatch */}
                            <div className="lg:col-span-5">
                                <div
                                    className="p-5 rounded-2xl border shadow-sm space-y-3"
                                    style={{ background: isDark ? '#0D111D' : '#F8FAFC', borderColor: T.border }}
                                >
                                    <span className="text-[10.5px] font-black uppercase tracking-wider" style={{ color: T.textMuted }}>
                                        Accent Sample
                                    </span>
                                    <div
                                        className="p-3.5 rounded-xl border flex items-center justify-between"
                                        style={{
                                            background: `linear-gradient(90deg, ${customConfig.primary}20 0%, ${customConfig.primary}05 100%)`,
                                            borderColor: `${customConfig.primary}40`,
                                        }}
                                    >
                                        <span className="text-xs font-bold" style={{ color: isDark ? '#FFFFFF' : customConfig.primary }}>
                                            Dashboard (Active)
                                        </span>
                                        <span className="w-2 h-2 rounded-full" style={{ background: customConfig.primary }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB 3: Data Grid & Table Appearance ─────────── */}
            {activeTab === 'tables' && (
                <div
                    className="p-6 rounded-2xl border shadow-xs space-y-6 animate-in fade-in duration-150"
                    style={{ background: T.surface, borderColor: T.border }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b" style={{ borderColor: T.border }}>
                        <div>
                            <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: T.textPrimary }}>
                                <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>table_chart</span>
                                Data Grid & Table Density
                            </h2>
                            <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                                Optimize how large CRM lead lists, deals pipelines, and account records appear on screen.
                            </p>
                        </div>
                    </div>

                    {/* Table Row Density */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider mb-2.5" style={{ color: T.textSecondary }}>
                            Row Density & Height
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {TABLE_DENSITIES.map(td => {
                                const isSel = (appearance.tableDensity || 'standard') === td.id
                                return (
                                    <button
                                        key={td.id}
                                        type="button"
                                        onClick={() => handleUpdateAppearance('tableDensity', td.id)}
                                        className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                            isSel ? 'shadow-md scale-[1.01]' : 'hover:border-slate-400/50'
                                        }`}
                                        style={{
                                            background: isSel ? T.primaryFaint : T.surfaceRaised,
                                            borderColor: isSel ? T.primary : T.border,
                                        }}
                                    >
                                        <p className="text-xs font-bold" style={{ color: T.textPrimary }}>{td.name}</p>
                                        <p className="text-[10.5px] mt-0.5" style={{ color: T.textMuted }}>{td.description}</p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Zebra Striping & Gridlines */}
                    <div className="pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderColor: T.border }}>
                        <div
                            onClick={() => handleUpdateAppearance('tableZebra', !appearance.tableZebra)}
                            className="p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between"
                            style={{
                                background: appearance.tableZebra ? T.primaryFaint : T.surfaceRaised,
                                borderColor: appearance.tableZebra ? T.primary : T.border,
                            }}
                        >
                            <div>
                                <p className="text-xs font-bold" style={{ color: T.textPrimary }}>Zebra Striping</p>
                                <p className="text-[10.5px] mt-0.5" style={{ color: T.textMuted }}>
                                    Alternating row shading to help your eyes scan across wide tables.
                                </p>
                            </div>
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                                appearance.tableZebra ? 'bg-emerald-500 text-white' : 'border'
                            }`}>
                                {appearance.tableZebra ? '✓' : ''}
                            </span>
                        </div>

                        <div
                            onClick={() => handleUpdateAppearance('tableGridlines', appearance.tableGridlines === 'full' ? 'horizontal' : 'full')}
                            className="p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between"
                            style={{
                                background: appearance.tableGridlines === 'full' ? T.primaryFaint : T.surfaceRaised,
                                borderColor: appearance.tableGridlines === 'full' ? T.primary : T.border,
                            }}
                        >
                            <div>
                                <p className="text-xs font-bold" style={{ color: T.textPrimary }}>Full Spreadsheet Gridlines</p>
                                <p className="text-[10.5px] mt-0.5" style={{ color: T.textMuted }}>
                                    Displays vertical column lines between cells for spreadsheet-style scanning.
                                </p>
                            </div>
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                                appearance.tableGridlines === 'full' ? 'bg-emerald-500 text-white' : 'border'
                            }`}>
                                {appearance.tableGridlines === 'full' ? '✓' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Table Live Preview */}
                    <div className="pt-2">
                        <label className="block text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: T.textSecondary }}>
                            Table Appearance Preview
                        </label>
                        <div className="rounded-xl border overflow-hidden" style={{ borderColor: T.border }}>
                            <table className="w-full text-xs text-left">
                                <thead style={{ background: T.surfaceHigh, color: T.textMuted }}>
                                    <tr>
                                        <th className="px-4 py-2 font-bold uppercase tracking-wider text-[10px]">Deal Name</th>
                                        <th className="px-4 py-2 font-bold uppercase tracking-wider text-[10px]">Stage</th>
                                        <th className="px-4 py-2 font-bold uppercase tracking-wider text-[10px] text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                                        <td className="px-4 font-semibold" style={{ color: T.textPrimary }}>Acme Enterprise Cloud</td>
                                        <td className="px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400">Proposal</span></td>
                                        <td className="px-4 font-mono font-bold text-right" style={{ color: T.textPrimary }}>₹ 14,20,000</td>
                                    </tr>
                                    <tr style={{ background: appearance.tableZebra ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') : 'transparent' }}>
                                        <td className="px-4 font-semibold" style={{ color: T.textPrimary }}>Global Logistics CRM Renewal</td>
                                        <td className="px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">Won</span></td>
                                        <td className="px-4 font-mono font-bold text-right" style={{ color: T.textPrimary }}>₹ 8,90,000</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB 4: Motion, Geometry & Accessibility ─────── */}
            {activeTab === 'accessibility' && (
                <div
                    className="p-6 rounded-2xl border shadow-xs space-y-6 animate-in fade-in duration-150"
                    style={{ background: T.surface, borderColor: T.border }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b" style={{ borderColor: T.border }}>
                        <div>
                            <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: T.textPrimary }}>
                                <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>tune</span>
                                Animation Speed & Interface Geometry
                            </h2>
                            <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                                Configure power-user transition speeds, accessibility focus rings, and card roundness.
                            </p>
                        </div>
                    </div>

                    {/* Animation & Motion Speed */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider mb-2.5" style={{ color: T.textSecondary }}>
                            Animation & Transition Latency
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {MOTION_SPEEDS.map(ms => {
                                const isSel = (appearance.motionSpeed || 'smooth') === ms.id
                                return (
                                    <button
                                        key={ms.id}
                                        type="button"
                                        onClick={() => handleUpdateAppearance('motionSpeed', ms.id)}
                                        className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                            isSel ? 'shadow-md scale-[1.01]' : 'hover:border-slate-400/50'
                                        }`}
                                        style={{
                                            background: isSel ? T.primaryFaint : T.surfaceRaised,
                                            borderColor: isSel ? T.primary : T.border,
                                        }}
                                    >
                                        <p className="text-xs font-bold" style={{ color: T.textPrimary }}>{ms.name}</p>
                                        <p className="text-[10.5px] mt-0.5" style={{ color: T.textMuted }}>{ms.description}</p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Corner Radius & Focus Ring */}
                    <div className="pt-4 border-t grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ borderColor: T.border }}>
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: T.textSecondary }}>
                                Component Corner Radius
                            </label>
                            <div className="grid grid-cols-2 gap-2.5">
                                {BORDER_RADII.map(r => {
                                    const isSel = appearance.borderRadius === r.id
                                    return (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => handleUpdateAppearance('borderRadius', r.id)}
                                            className={`p-2.5 border text-left transition-all cursor-pointer ${
                                                isSel ? 'ring-2 shadow-xs' : 'hover:border-slate-400/50'
                                            }`}
                                            style={{
                                                borderRadius: r.value,
                                                background: isSel ? T.primaryFaint : T.surfaceRaised,
                                                borderColor: isSel ? T.primary : T.border,
                                            }}
                                        >
                                            <span className="text-xs font-bold" style={{ color: T.textPrimary }}>{r.name}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: T.textSecondary }}>
                                Focus Ring & Accessibility
                            </label>
                            <div className="space-y-2">
                                {FOCUS_RING_STYLES.map(fr => {
                                    const isSel = (appearance.focusRing || 'standard') === fr.id
                                    return (
                                        <button
                                            key={fr.id}
                                            type="button"
                                            onClick={() => handleUpdateAppearance('focusRing', fr.id)}
                                            className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                isSel ? 'ring-2 shadow-xs' : 'hover:border-slate-400/50'
                                            }`}
                                            style={{
                                                background: isSel ? T.primaryFaint : T.surfaceRaised,
                                                borderColor: isSel ? T.primary : T.border,
                                            }}
                                        >
                                            <p className="text-xs font-bold" style={{ color: T.textPrimary }}>{fr.name}</p>
                                            <p className="text-[10px]" style={{ color: T.textMuted }}>{fr.description}</p>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB 5: Shareable Themes (Import & Export JSON) ── */}
            {activeTab === 'share' && (
                <div
                    className="p-6 rounded-2xl border shadow-xs space-y-6 animate-in fade-in duration-150"
                    style={{ background: T.surface, borderColor: T.border }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b" style={{ borderColor: T.border }}>
                        <div>
                            <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: T.textPrimary }}>
                                <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>share</span>
                                Shareable Theme Packages (JSON)
                            </h2>
                            <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                                Export your custom theme configuration as JSON or import themes created by colleagues.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Export Card */}
                        <div className="p-4 rounded-xl border space-y-3" style={{ background: T.surfaceRaised, borderColor: T.border }}>
                            <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: T.textPrimary }}>
                                Export Active Theme
                            </h3>
                            <p className="text-xs" style={{ color: T.textMuted }}>
                                Copies your entire active theme, typography, font scale, and table density settings as a clean JSON package.
                            </p>
                            <button
                                type="button"
                                onClick={handleExportTheme}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-90 flex items-center gap-2"
                                style={{ background: T.primary }}
                            >
                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                Copy Theme JSON to Clipboard
                            </button>
                        </div>

                        {/* Import Card */}
                        <div className="p-4 rounded-xl border space-y-3" style={{ background: T.surfaceRaised, borderColor: T.border }}>
                            <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: T.textPrimary }}>
                                Import Theme Package
                            </h3>
                            <textarea
                                rows={3}
                                value={importJsonText}
                                onChange={e => setImportJsonText(e.target.value)}
                                placeholder="Paste your theme JSON here..."
                                className="w-full p-2.5 rounded-lg text-xs font-mono border outline-none resize-none"
                                style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                            />
                            {importError && (
                                <p className="text-xs text-rose-500 font-bold">{importError}</p>
                            )}
                            <button
                                type="button"
                                onClick={handleImportTheme}
                                className="px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer hover:bg-black/5"
                                style={{ borderColor: T.primary, color: T.primary }}
                            >
                                Import & Apply Theme
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
