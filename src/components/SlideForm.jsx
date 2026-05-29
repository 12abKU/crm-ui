import { useState } from 'react'
import { T, SHADOW } from '../constants/theme'
import { extractApiErrorMessage } from '../api'

export default function SlideForm({ title, open, onClose, onSubmit, children }) {
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    if (!open) return null

    const submit = async (event) => {
        event.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            await onSubmit(event)
        } catch (err) {
            setError(extractApiErrorMessage(err, 'Save failed'))
        } finally {
            setSubmitting(false)
        }
    }

    const close = () => {
        setError('')
        onClose()
    }

    return (
        <>
            <div className="fixed inset-0 z-40 backdrop-blur-sm"
                style={{ background: 'rgba(15,23,42,0.5)' }}
                onClick={close} />
            <div className="fixed right-0 top-0 h-full w-full sm:w-[440px] z-50 flex flex-col"
                style={{ background: T.surface, borderLeft: `1px solid ${T.border}`, boxShadow: SHADOW.xl }}>
                <div className="flex items-center justify-between px-8 py-5"
                    style={{ borderBottom: `1px solid ${T.border}` }}>
                    <h2 className="text-base font-bold" style={{ color: T.textPrimary }}>{title}</h2>
                    <button onClick={close}
                        className="material-symbols-outlined text-[20px] p-1.5 rounded-lg transition-colors"
                        style={{ color: T.textMuted }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh; e.currentTarget.style.color = T.textPrimary }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                        close
                    </button>
                </div>
                <form onSubmit={submit} className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
                    {error && (
                        <div className="px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-2"
                            style={{ background: T.errorDim, color: T.error }}>
                            <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
                            <span className="break-words">{error}</span>
                        </div>
                    )}
                    {children}
                    <div className="flex gap-3 pt-2 mt-auto">
                        <button type="button" onClick={close} className="crm-btn-ghost flex-1">Cancel</button>
                        <button type="submit" disabled={submitting} className="crm-btn-primary flex-1">
                            {submitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}
