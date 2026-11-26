import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'
import { T } from '../../constants/theme'
import { trackEvent } from '../../utils/telemetry'

export default function OnboardingWizardCard({ onSampleDataChanged }) {
    const navigate = useNavigate()
    const [status, setStatus] = useState(null)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        let mounted = true
        api.get('/api/onboarding/status')
            .then(res => { if (mounted) setStatus(res.data) })
            .catch(() => {})
        return () => { mounted = false }
    }, [])

    if (!status || (status.dismissed && !status.hasSampleData)) return null

    const pct = status.totalSteps > 0 ? Math.round((status.completedSteps / status.totalSteps) * 100) : 0

    const handleToggleSample = async () => {
        setBusy(true)
        try {
            const res = status.hasSampleData
                ? await api.delete('/api/onboarding/sample-data')
                : await api.post('/api/onboarding/sample-data')
            setStatus(res.data)
            trackEvent(status.hasSampleData ? 'sample_data_cleared' : 'sample_data_loaded')
            onSampleDataChanged?.()
        } finally {
            setBusy(false)
        }
    }

    const handleDismiss = async () => {
        setBusy(true)
        try {
            const res = await api.post('/api/onboarding/dismiss', { dismissed: true })
            setStatus(res.data)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div
            className="rounded-2xl p-5 mb-6 border transition-all"
            style={{
                background: T.surface,
                borderColor: T.border,
                boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.08)',
            }}
        >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: T.primaryFaint, color: T.primary }}
                    >
                        <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-black" style={{ color: T.textPrimary }}>
                                Workspace Setup Guide
                            </h3>
                            <span
                                className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                                style={{ background: T.primaryFaint, color: T.primaryText }}
                            >
                                {status.completedSteps}/{status.totalSteps} Complete ({pct}%)
                            </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
                            Finish key steps to get your team selling faster, or explore with sample data.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        disabled={busy}
                        onClick={handleToggleSample}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border cursor-pointer disabled:opacity-50"
                        style={{
                            background: status.hasSampleData ? 'rgba(239,68,68,0.08)' : T.primaryFaint,
                            color: status.hasSampleData ? '#EF4444' : T.primaryText,
                            borderColor: status.hasSampleData ? 'rgba(239,68,68,0.25)' : `${T.primary}40`,
                        }}
                    >
                        <span className="material-symbols-outlined text-[16px]">
                            {status.hasSampleData ? 'cleaning_services' : 'science'}
                        </span>
                        {busy
                            ? 'Working...'
                            : status.hasSampleData
                                ? 'Clear Sample Data'
                                : 'Load Sample Data'}
                    </button>

                    {!status.dismissed && (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={handleDismiss}
                            className="px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:opacity-80"
                            style={{ color: T.textMuted }}
                        >
                            Dismiss
                        </button>
                    )}
                </div>
            </div>

            <div className="w-full h-1.5 rounded-full overflow-hidden mb-4" style={{ background: T.surfaceRaised }}>
                <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, background: T.primary }}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {(status.steps || []).map(step => (
                    <button
                        key={step.key}
                        type="button"
                        onClick={() => navigate(step.route)}
                        className="p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all hover:scale-[1.01] cursor-pointer"
                        style={{
                            background: step.done ? 'rgba(22,163,74,0.06)' : T.surfaceRaised,
                            borderColor: step.done ? 'rgba(22,163,74,0.25)' : T.border,
                        }}
                    >
                        <span
                            className="material-symbols-outlined text-[18px] shrink-0"
                            style={{ color: step.done ? '#16A34A' : T.textMuted }}
                        >
                            {step.done ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className="text-xs font-bold leading-snug" style={{ color: T.textPrimary }}>
                            {step.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}
