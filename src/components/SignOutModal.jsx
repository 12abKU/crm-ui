import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { T } from '../constants/theme'

/**
 * SignOutModal — renders via React Portal so it always appears
 * centred on the full viewport, regardless of parent stacking context.
 */
export default function SignOutModal({ open, onConfirm, onCancel, userName = '', role = 'AGENT' }) {
    const confirmRef = useRef(null)

    // Focus confirm button & handle Escape key
    useEffect(() => {
        if (!open) return
        const prev = document.activeElement
        confirmRef.current?.focus()
        const onKey = (e) => { if (e.key === 'Escape') onCancel() }
        document.addEventListener('keydown', onKey)
        // Prevent body scroll while modal open
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
            prev?.focus()
        }
    }, [open, onCancel])

    if (!open) return null

    const isSuperAdmin = role === 'SUPER_ADMIN'
    const isCompanySuperAdmin = role === 'COMPANY_SUPER_ADMIN'
    const roleLabel = isSuperAdmin ? 'Super Admin' : isCompanySuperAdmin ? 'Company Super Admin' : role === 'ADMIN' ? 'Admin' : 'Agent'
    const roleDot   = isSuperAdmin ? T.superAdminColor : isCompanySuperAdmin ? '#F59E0B' : role === 'ADMIN' ? T.primary : T.success
    const roleBg    = isSuperAdmin ? T.superAdminDim   : isCompanySuperAdmin ? 'rgba(245, 158, 11, 0.12)' : role === 'ADMIN' ? T.primaryDim : T.successDim

    const modal = (
        <>
            {/* ── Keyframe styles ──────────────────────────────── */}
            <style>{`
                @keyframes soBackdropIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes soModalIn {
                    from { opacity: 0; transform: scale(0.86) translateY(20px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0);    }
                }
            `}</style>

            {/* ── Backdrop ─────────────────────────────────────── */}
            <div
                onClick={onCancel}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99998,
                    background: 'rgba(8, 6, 4, 0.70)',
                    backdropFilter: 'blur(7px)',
                    WebkitBackdropFilter: 'blur(7px)',
                    animation: 'soBackdropIn 0.2s ease forwards',
                }}
            />

            {/* ── Centred card wrapper ─────────────────────────── */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    pointerEvents: 'none',
                }}
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="so-title"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        pointerEvents: 'all',
                        width: '100%',
                        maxWidth: '410px',
                        borderRadius: '22px',
                        overflow: 'hidden',
                        background: T.surface,
                        border: `1.5px solid ${T.border}`,
                        boxShadow: '0 40px 100px rgba(0,0,0,0.35), 0 10px 30px rgba(0,0,0,0.18)',
                        animation: 'soModalIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards',
                    }}
                >
                    {/* ── Header ───────────────────────────── */}
                    <div style={{
                        position: 'relative',
                        background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
                        padding: '26px 26px 22px',
                        overflow: 'hidden',
                    }}>
                        {/* Decorative orbs */}
                        <div style={{
                            position: 'absolute', top: -35, right: -35,
                            width: 120, height: 120, borderRadius: '50%',
                            background: `radial-gradient(circle, ${T.heroAccentGlow} 0%, transparent 68%)`,
                            pointerEvents: 'none',
                        }} />
                        <div style={{
                            position: 'absolute', bottom: -24, left: -24,
                            width: 90, height: 90, borderRadius: '50%',
                            background: `radial-gradient(circle, ${T.heroOrb2} 0%, transparent 70%)`,
                            pointerEvents: 'none',
                        }} />

                        {/* User row */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '13px' }}>
                            {/* Avatar */}
                            <div style={{
                                width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                                background: `linear-gradient(135deg, ${T.avatarGradFrom} 0%, ${T.avatarGradTo} 100%)`,
                                boxShadow: `0 0 0 3px rgba(255,255,255,0.14), 0 6px 18px ${T.avatarGlow}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: '19px', fontWeight: 900,
                            }}>
                                {userName.charAt(0).toUpperCase() || 'U'}
                            </div>

                            {/* Name & badge */}
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '14px', lineHeight: 1.3 }}>
                                    {userName || 'User'}
                                </p>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                                    marginTop: '4px', padding: '2px 8px', borderRadius: '999px',
                                    background: roleBg, fontSize: '10px', fontWeight: 700,
                                    color: roleDot, letterSpacing: '0.04em',
                                }}>
                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: roleDot, flexShrink: 0 }} />
                                    {roleLabel}
                                </span>
                            </div>

                            {/* Close X */}
                            <button
                                onClick={onCancel}
                                aria-label="Cancel sign out"
                                style={{
                                    flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
                                    border: 'none', cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.10)',
                                    color: 'rgba(255,255,255,0.65)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.22)'
                                    e.currentTarget.style.color = '#fff'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
                            </button>
                        </div>

                        {/* Sign out label row */}
                        <div style={{
                            position: 'relative', marginTop: '18px',
                            display: 'flex', alignItems: 'center', gap: '10px',
                        }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: '11px', flexShrink: 0,
                                background: 'rgba(220,38,38,0.22)',
                                border: '1px solid rgba(220,38,38,0.32)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <span className="material-symbols-outlined filled" style={{ fontSize: '19px', color: '#FCA5A5' }}>
                                    logout
                                </span>
                            </div>
                            <div>
                                <p id="so-title" style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '16px' }}>
                                    Sign out?
                                </p>
                                <p style={{ margin: '2px 0 0', fontSize: '11px', fontWeight: 500, color: T.heroSubText }}>
                                    Your session will end and you'll be redirected to login.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Body ─────────────────────────────── */}
                    <div style={{ padding: '18px 24px 22px' }}>
                        {/* Info pill */}
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '9px',
                            padding: '10px 13px', borderRadius: '11px', marginBottom: '18px',
                            background: T.borderSubtle, border: `1px solid ${T.border}`,
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '15px', color: T.warning, flexShrink: 0, marginTop: '1px' }}>
                                info
                            </span>
                            <p style={{ margin: 0, fontSize: '12px', color: T.textSecondary, lineHeight: 1.55 }}>
                                Any unsaved changes will be discarded. Make sure to save your work before signing out.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={onCancel}
                                id="so-cancel-btn"
                                style={{
                                    flex: 1, padding: '11px 0', borderRadius: '12px', cursor: 'pointer',
                                    border: `1.5px solid ${T.border}`, background: T.surface,
                                    color: T.textSecondary, fontWeight: 700, fontSize: '14px',
                                    transition: 'all 0.15s', fontFamily: 'inherit',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = T.surfaceHigh
                                    e.currentTarget.style.borderColor = T.primary + '50'
                                    e.currentTarget.style.color = T.textPrimary
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = T.surface
                                    e.currentTarget.style.borderColor = T.border
                                    e.currentTarget.style.color = T.textSecondary
                                }}
                            >
                                Stay
                            </button>

                            <button
                                ref={confirmRef}
                                onClick={onConfirm}
                                id="so-confirm-btn"
                                style={{
                                    flex: 1.5, padding: '11px 0', borderRadius: '12px', cursor: 'pointer',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #DC2626 0%, #9B1C1C 100%)',
                                    color: '#fff', fontWeight: 800, fontSize: '14px',
                                    boxShadow: '0 4px 14px rgba(220,38,38,0.38)',
                                    transition: 'all 0.15s', fontFamily: 'inherit',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)'
                                    e.currentTarget.style.boxShadow = '0 6px 22px rgba(220,38,38,0.52)'
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626 0%, #9B1C1C 100%)'
                                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(220,38,38,0.38)'
                                    e.currentTarget.style.transform = 'none'
                                }}
                            >
                                <span className="material-symbols-outlined filled" style={{ fontSize: '15px' }}>logout</span>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

    // ── Portal: render directly into <body> to escape all stacking contexts ──
    return createPortal(modal, document.body)
}
