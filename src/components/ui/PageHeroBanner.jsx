import React from 'react'
import { T } from '../../constants/theme'

/**
 * PageHeroBanner
 * Ultra-premium executive hero banner used across all CRM pages:
 * Linear / Stripe / Attio level visual depth, ambient glow mesh,
 * glassmorphic stat chips, role/status badges, and integrated action slots.
 */
export default function PageHeroBanner({
    icon,
    title,
    subtitle,
    badge,
    stats = [],
    actions,
    gradient,
    accentColor = T.primary,
    className = '',
}) {
    const defaultGradient = `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 52%, ${T.heroBgTo} 100%)`
    const bgGradient = gradient || defaultGradient

    return (
        <section
            className={`relative rounded-2xl sm:rounded-3xl mb-7 overflow-hidden border transition-all duration-300 ${className}`}
            style={{
                background: bgGradient,
                borderColor: 'rgba(255, 255, 255, 0.12)',
                boxShadow: '0 16px 40px -12px rgba(15, 23, 42, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
            }}
        >
            {/* Ambient Top Hairline Highlight */}
            <div
                className="absolute inset-x-0 top-0 h-px pointer-events-none"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.50) 45%, rgba(255, 255, 255, 0.50) 55%, transparent 100%)',
                }}
            />

            {/* Ambient Radial Glowing Orbs */}
            <div
                className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`,
                    filter: 'blur(20px)',
                }}
            />
            <div
                className="absolute -bottom-12 left-1/3 w-48 h-48 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
                    filter: 'blur(30px)',
                }}
            />
            <div
                className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
                style={{
                    background: 'linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.04) 100%)',
                }}
            />

            {/* Content Container */}
            <div className="relative z-10 px-5 py-5 sm:px-8 sm:py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Left: Icon, Title, Subtitle, Badge */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                    {icon && (
                        <div
                            className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200"
                            style={{
                                background: 'rgba(255, 255, 255, 0.12)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.22)',
                                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
                            }}
                        >
                            <span
                                className="material-symbols-outlined filled text-[24px] sm:text-[26px]"
                                style={{ color: '#FFFFFF' }}
                            >
                                {icon}
                            </span>
                        </div>
                    )}

                    <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1
                                className="text-xl sm:text-2xl lg:text-[26px] font-black tracking-tight text-white leading-tight truncate"
                                style={{ letterSpacing: '-0.025em' }}
                            >
                                {title}
                            </h1>
                            {badge && (
                                <span
                                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 shrink-0"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.14)',
                                        border: '1px solid rgba(255, 255, 255, 0.25)',
                                        color: '#FFFFFF',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    {badge}
                                </span>
                            )}
                        </div>

                        {subtitle && (
                            <p
                                className="text-xs sm:text-sm mt-1 leading-relaxed line-clamp-2"
                                style={{ color: T.heroSubText || 'rgba(255, 255, 255, 0.72)' }}
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: Quick Stats & Actions */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0 justify-start lg:justify-end">
                    {/* Render optional stats pills */}
                    {stats && stats.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {stats.map((st, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl shrink-0"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.10)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.18)',
                                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                                    }}
                                >
                                    {st.icon && (
                                        <span
                                            className="material-symbols-outlined text-[16px]"
                                            style={{ color: st.color || '#FFFFFF' }}
                                        >
                                            {st.icon}
                                        </span>
                                    )}
                                    <div className="flex flex-col">
                                        <span
                                            className="text-[9.5px] uppercase font-bold tracking-wider"
                                            style={{ color: 'rgba(255, 255, 255, 0.65)' }}
                                        >
                                            {st.label}
                                        </span>
                                        <span className="text-xs sm:text-sm font-black text-white leading-none mt-0.5">
                                            {st.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Render action items (buttons, search, select) */}
                    {actions && (
                        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
