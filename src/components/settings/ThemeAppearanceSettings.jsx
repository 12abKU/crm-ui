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
    resetCustomTheme
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

    // Listen to live theme broadcasts
    useEffect(() => {
        const handler = () => setTick(t => t + 1)
        window.addEventListener('crm-theme-changed', handler)
        return () => window.removeEventListener('crm-theme-changed', handler)
    }, [])

    const isDark = currentMode === 'dark'

    // Custom Theme Builder state
    const [customConfig, setCustomConfig] = useState(() => getCustomThemeConfig())
    const [savedSuccess, setSavedSuccess] = useState(false)

    const handleModeSwitch = (mode) => {
        setThemeName(mode)
    }

    const handleSelectPalette = (paletteId) => {
        setPaletteName(paletteId)
    }

    const handleApplyCustomTheme = (e) => {
        e?.preventDefault()
        saveCustomTheme(customConfig)
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 3000)
    }

    const handleReset = () => {
        resetCustomTheme()
        setCustomConfig({
            primary: '#6366F1',
            sidebarLight: '#FFFFFF',
            sidebarDark: '#0D111D',
            name: 'My Custom Theme'
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* ── Section 1: Color Mode (Light / Dark) ───────────── */}
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
                            Choose between crisp daytime clarity or deep obsidian dark mode.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleModeSwitch('light')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                !isDark
                                    ? 'shadow-md scale-[1.02]'
                                    : 'hover:opacity-80'
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
                                isDark
                                    ? 'shadow-md scale-[1.02]'
                                    : 'hover:opacity-80'
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
                                High contrast white surfaces with crisp typography and vibrant accent colors.
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
                                Carbon obsidian surfaces designed to reduce eye strain during prolonged sessions.
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

            {/* ── Section 2: Curated Designer Themes ───────────── */}
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
                            Award-winning SaaS color presets tested for perfect contrast and visual harmony.
                        </p>
                    </div>

                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full border self-start sm:self-auto"
                        style={{ background: T.primaryDim, color: T.primary, borderColor: `${T.primary}40` }}>
                        7 Curated Palettes
                    </span>
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

                                {/* Mini Palette Swatch Preview */}
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

            {/* ── Section 3: Bespoke Custom Theme Studio ───────── */}
            <div
                className="p-6 rounded-2xl border shadow-xs transition-all duration-200"
                style={{ background: T.surface, borderColor: T.border }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b" style={{ borderColor: T.border }}>
                    <div>
                        <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: T.textPrimary }}>
                            <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>tune</span>
                            Custom Theme Studio
                        </h2>
                        <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                            Design your own personalized brand theme. Choose any primary accent color, sidebar background, and preview live.
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
                        {/* Theme Name */}
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: T.textSecondary }}>
                                Theme Name
                            </label>
                            <input
                                type="text"
                                value={customConfig.name}
                                onChange={e => setCustomConfig(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. My Brand Tech"
                                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all"
                                style={{
                                    background: T.surfaceRaised,
                                    color: T.textPrimary,
                                    borderColor: T.border,
                                }}
                            />
                        </div>

                        {/* Primary Brand Accent Color */}
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: T.textSecondary }}>
                                Primary Brand Accent Color
                            </label>
                            <div className="flex items-center gap-3 mb-3">
                                {/* Color Input swatch */}
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
                                    Pick any custom brand color or choose from swatches below
                                </span>
                            </div>

                            {/* Quick Swatches */}
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

                        {/* Sidebar Background in Light Mode */}
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: T.textSecondary }}>
                                Sidebar Style in Light Mode
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                    { label: 'Pure White (Default)', value: '#FFFFFF', hint: 'Clean & minimalist' },
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

                        {/* Action buttons */}
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
                                onClick={handleReset}
                                className="px-4 py-2.5 rounded-xl font-semibold text-xs border transition-all cursor-pointer hover:bg-black/5"
                                style={{
                                    borderColor: T.border,
                                    color: T.textMuted,
                                }}
                            >
                                Reset to Default
                            </button>

                            {savedSuccess && (
                                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 animate-in fade-in">
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    Custom Theme Applied!
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Live Interactive Preview Card */}
                    <div className="lg:col-span-5">
                        <div
                            className="p-5 rounded-2xl border shadow-md space-y-4 sticky top-6"
                            style={{
                                background: isDark ? '#0D111D' : '#F8FAFC',
                                borderColor: T.border,
                            }}
                        >
                            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: T.border }}>
                                <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.textMuted }}>
                                    Live Real-Time Preview
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: `${customConfig.primary}20`, color: customConfig.primary }}>
                                    {isDark ? 'Dark Preview' : 'Light Preview'}
                                </span>
                            </div>

                            {/* Sample Sidebar Nav Item */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold" style={{ color: T.textMuted }}>Sidebar Nav Item (Active)</span>
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

                            {/* Sample Buttons */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold" style={{ color: T.textMuted }}>Buttons & Badges</span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs"
                                        style={{ background: customConfig.primary }}
                                    >
                                        Primary Button
                                    </button>
                                    <span
                                        className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                                        style={{ background: `${customConfig.primary}20`, color: customConfig.primary }}
                                    >
                                        Badge
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
                                        Sample Metric Card
                                    </span>
                                    <span className="material-symbols-outlined text-[16px]" style={{ color: customConfig.primary }}>
                                        trending_up
                                    </span>
                                </div>
                                <div className="text-lg font-black" style={{ color: customConfig.primary }}>
                                    ₹ 4,85,000
                                </div>
                                <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>
                                    +18.4% growth this quarter
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
