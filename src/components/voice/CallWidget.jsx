import { useState, useEffect, useRef } from 'react'
import { T, SHADOW } from '../../constants/theme'
import { twilioService } from '../../services/twilioService'
import api, { extractApiErrorMessage } from '../../api'

const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
}

const STATUS_LABEL = {
    idle: 'Ready',
    ringing: 'Ringing...',
    'in-progress': 'Connected',
    completed: 'Call ended',
    failed: 'Failed',
    initializing: 'Connecting...',
}

const STATUS_COLOR = {
    idle: T.textMuted,
    ringing: T.warning,
    'in-progress': T.success,
    completed: T.textMuted,
    failed: T.error,
    initializing: T.textMuted,
}

// ── Classify Twilio/browser errors into user-friendly messages ──
function classifyError(err) {
    const msg = err?.message || err?.toString() || ''
    const code = err?.code || 0

    if (code === 31402 || msg.includes('31402') || msg.includes('AcquisitionFailed')) {
        return {
            title: 'Microphone unavailable',
            detail: 'Your mic couldn\'t be accessed. Make sure your headset/earphone is plugged in and no other app is using the mic.',
            icon: 'mic_off',
            color: T.warning,
            bg: T.warningDim,
        }
    }
    if (msg.includes('Permission') || msg.includes('NotAllowed') || msg.includes('PermissionDenied')) {
        return {
            title: 'Mic permission denied',
            detail: 'Click the lock icon in the address bar and allow Microphone access, then try again.',
            icon: 'mic_off',
            color: T.error,
            bg: T.errorDim,
        }
    }
    if (msg.includes('NotFound') || msg.includes('DevicesNotFound') || msg.includes('31400')) {
        return {
            title: 'No audio device found',
            detail: 'No microphone detected. Plug in a headset or earphone and try again.',
            icon: 'headset_off',
            color: T.error,
            bg: T.errorDim,
        }
    }
    if (msg.includes('31100') || msg.includes('application SID')) {
        return {
            title: 'Configuration error',
            detail: 'Invalid Twilio app configuration. Contact your admin.',
            icon: 'error',
            color: T.error,
            bg: T.errorDim,
        }
    }
    return {
        title: 'Call failed',
        detail: extractApiErrorMessage(err, msg || 'An unexpected error occurred. Please try again.'),
        icon: 'call_end',
        color: T.error,
        bg: T.errorDim,
    }
}

// ── Error banner shown inside the widget ──
function ErrorBanner({ error, onDismiss }) {
    if (!error) return null
    return (
        <div className="mx-4 mt-3 mb-1 px-4 py-3 rounded-2xl flex items-start gap-3"
            style={{ background: error.bg, border: `1px solid ${error.color}22` }}>
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5"
                style={{ color: error.color }}>{error.icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black" style={{ color: error.color }}>{error.title}</p>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: T.textSecondary }}>{error.detail}</p>
            </div>
            {onDismiss && (
                <button onClick={onDismiss} style={{ color: T.textMuted }}>
                    <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
            )}
        </div>
    )
}

export default function CallWidget({ contact, onClose, onCallComplete }) {
    const [status, setStatus] = useState('initializing')
    const [callLog, setCallLog] = useState(null)
    const [muted, setMuted] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const [notes, setNotes] = useState('')
    const [outcome, setOutcome] = useState('ANSWERED')
    const [showNotes, setShowNotes] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)       // { title, detail, icon, color, bg }
    const timerRef = useRef(null)
    const deviceRef = useRef(null)

    const toNumber = contact?.phone || ''
    const displayName = contact
        ? `${contact.firstName} ${contact.lastName || ''}`.trim()
        : toNumber

    useEffect(() => {
        let mounted = true

        const start = async () => {
            try {
                deviceRef.current = await twilioService.initDevice(null, () => { })
                if (!mounted) return

                await twilioService.makeCall({
                    toNumber,
                    contactId: contact?.id || null,
                    contactName: displayName,
                    onCallLog: (log) => { if (mounted) setCallLog(log) },
                    onError: (err) => {
                        if (!mounted) return
                        const classified = classifyError(err)
                        setError(classified)
                        setStatus('failed')
                        clearInterval(timerRef.current)
                        setShowNotes(true)
                    },
                    onStateChange: (s) => {
                        if (!mounted) return
                        setStatus(s)
                        // Clear error on successful connection
                        if (s === 'in-progress') {
                            setError(null)
                            timerRef.current = setInterval(() => setSeconds(p => p + 1), 1000)
                        }
                        if (s === 'completed' || s === 'failed') {
                            clearInterval(timerRef.current)
                            setShowNotes(true)
                        }
                    },
                })
            } catch (e) {
                if (!mounted) return
                setError(classifyError(e))
                setStatus('failed')
                setShowNotes(true)
            }
        }

        start()
        return () => {
            mounted = false
            clearInterval(timerRef.current)
            twilioService.hangup()
            twilioService.destroy()
        }
    }, [])

    const handleHangup = () => {
        twilioService.hangup()
        clearInterval(timerRef.current)
        setStatus('completed')
        setShowNotes(true)
    }

    const handleMute = () => {
        const next = !muted
        setMuted(next)
        twilioService.mute(next)
    }

    const handleSaveNotes = async () => {
        if (!callLog) { onClose?.(); return }
        setSaving(true)
        try {
            await api.patch(`/api/voice/call/${callLog.id}/notes`, { notes, outcome })
            onCallComplete?.()
        } finally {
            setSaving(false)
            onClose?.()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
            <div className="w-85 rounded-3xl overflow-hidden shadow-2xl"
                style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: SHADOW.xl }}>

                {/* Header */}
                <div className="px-6 pt-7 pb-5 flex flex-col items-center gap-2"
                    style={{ background: T.sidebar }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mb-1"
                        style={{ background: T.primaryDim, color: T.primary }}>
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-base font-black text-white">{displayName}</p>
                    {toNumber && <p className="text-xs" style={{ color: T.sidebarText }}>{toNumber}</p>}

                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full animate-pulse"
                            style={{ background: STATUS_COLOR[status] }} />
                        <span className="text-xs font-semibold" style={{ color: STATUS_COLOR[status] }}>
                            {STATUS_LABEL[status] || status}
                        </span>
                    </div>

                    {status === 'in-progress' && (
                        <p className="text-2xl font-black text-white mt-1 tabular-nums">{fmt(seconds)}</p>
                    )}
                </div>

                {/* Error banner */}
                <ErrorBanner error={error} onDismiss={() => setError(null)} />

                {/* Controls or post-call notes */}
                {!showNotes ? (
                    <div className="px-6 py-6 flex flex-col gap-4">
                        <div className="flex justify-center gap-4">
                            {/* Mute */}
                            <button onClick={handleMute}
                                className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                                style={{
                                    background: muted ? T.warningDim : T.surfaceRaised,
                                    border: `1px solid ${T.border}`,
                                    color: muted ? T.warning : T.textSecondary
                                }}>
                                <span className="material-symbols-outlined text-[22px]">
                                    {muted ? 'mic_off' : 'mic'}
                                </span>
                            </button>

                            {/* Hang up */}
                            <button onClick={handleHangup}
                                disabled={status === 'completed' || status === 'failed'}
                                className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
                                style={{ background: '#DC2626', color: 'white' }}>
                                <span className="material-symbols-outlined text-[26px]">call_end</span>
                            </button>

                            {/* Speaker (cosmetic) */}
                            <button className="w-14 h-14 rounded-full flex items-center justify-center"
                                style={{ background: T.surfaceRaised, border: `1px solid ${T.border}`, color: T.textSecondary }}>
                                <span className="material-symbols-outlined text-[22px]">volume_up</span>
                            </button>
                        </div>

                        <button onClick={onClose}
                            className="text-xs font-semibold text-center py-2 rounded-xl transition-colors"
                            style={{ color: T.textMuted, background: T.surfaceRaised }}>
                            Minimize
                        </button>
                    </div>
                ) : (
                    /* Post-call notes */
                    <div className="px-6 py-5 flex flex-col gap-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-center"
                            style={{ color: T.textMuted }}>Call Summary</p>

                        <div className="flex items-center justify-between p-3 rounded-xl"
                            style={{ background: T.surfaceRaised }}>
                            <span className="text-xs font-semibold" style={{ color: T.textMuted }}>Duration</span>
                            <span className="text-sm font-black" style={{ color: T.textPrimary }}>{fmt(seconds)}</span>
                        </div>

                        {/* Outcome */}
                        <div>
                            <p className="text-xs font-bold mb-2" style={{ color: T.textMuted }}>Outcome</p>
                            <div className="grid grid-cols-2 gap-2">
                                {['ANSWERED', 'NO_ANSWER', 'BUSY', 'FAILED'].map(o => (
                                    <button key={o} onClick={() => setOutcome(o)}
                                        className="py-2 px-3 rounded-xl text-xs font-bold transition-all"
                                        style={{
                                            background: outcome === o ? T.primaryDim : T.surfaceRaised,
                                            color: outcome === o ? T.primary : T.textSecondary,
                                            border: `1px solid ${outcome === o ? T.primary : T.border}`
                                        }}>
                                        {o.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <p className="text-xs font-bold mb-2" style={{ color: T.textMuted }}>Notes</p>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Add call notes..."
                                rows={3}
                                className="crm-input resize-none text-sm"
                            />
                        </div>

                        <button onClick={handleSaveNotes} disabled={saving}
                            className="crm-btn-primary w-full text-sm font-bold py-3 rounded-xl">
                            {saving ? 'Saving...' : 'Save & Close'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
