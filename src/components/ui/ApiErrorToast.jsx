import { useEffect, useRef, useState } from 'react'
import { T, SHADOW } from '../../constants/theme'

export default function ApiErrorToast() {
    const [notice, setNotice] = useState(null)
    const timerRef = useRef(null)

    useEffect(() => {
        const onError = (event) => {
            clearTimeout(timerRef.current)
            setNotice(event.detail)
            timerRef.current = setTimeout(() => setNotice(null), 5000)
        }

        window.addEventListener('crm-api-error', onError)
        return () => {
            clearTimeout(timerRef.current)
            window.removeEventListener('crm-api-error', onError)
        }
    }, [])

    if (!notice?.message) return null

    return (
        <div className="fixed top-5 right-5 z-[100] w-[360px] max-w-[calc(100vw-32px)] px-4 py-3 flex items-start gap-3 rounded-xl"
            style={{ background: T.surface, border: `1px solid ${T.errorDim}`, boxShadow: SHADOW.lg }}>
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5" style={{ color: T.error }}>
                error
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-[12px] font-black uppercase tracking-widest" style={{ color: T.error }}>
                    Request failed
                </p>
                <p className="text-sm mt-0.5 leading-relaxed break-words" style={{ color: T.textPrimary }}>
                    {notice.message}
                </p>
            </div>
            <button type="button" onClick={() => setNotice(null)} className="p-1 rounded-lg"
                style={{ color: T.textMuted }}
                onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
        </div>
    )
}
