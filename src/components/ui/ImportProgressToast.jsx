import { useEffect, useRef, useState } from 'react'
import { T, SHADOW } from '../../constants/theme'

export default function ImportProgressToast() {
    const [state, setState] = useState({
        visible: false,
        status: 'importing', // 'importing' | 'success' | 'error'
        progress: 0,
        fileName: '',
        message: '',
    })

    const progressTimerRef = useRef(null)
    const closeTimerRef = useRef(null)

    useEffect(() => {
        const onStart = (e) => {
            clearTimeout(progressTimerRef.current)
            clearTimeout(closeTimerRef.current)
            setState({
                visible: true,
                status: 'importing',
                progress: 0,
                fileName: e.detail.fileName || 'file.csv',
                message: 'Uploading and processing file...',
            })

            // Simulate progress bar increments
            let currentProgress = 0
            const tick = () => {
                if (currentProgress < 30) {
                    currentProgress += Math.random() * 5 + 3
                } else if (currentProgress < 70) {
                    currentProgress += Math.random() * 3 + 1
                } else if (currentProgress < 92) {
                    currentProgress += Math.random() * 1.5 + 0.5
                }
                currentProgress = Math.min(currentProgress, 92)
                
                setState(prev => {
                    if (prev.status !== 'importing') return prev
                    return { ...prev, progress: Math.round(currentProgress) }
                })

                if (currentProgress < 92) {
                    progressTimerRef.current = setTimeout(tick, 300 + Math.random() * 300)
                }
            }
            progressTimerRef.current = setTimeout(tick, 200)
        }

        const onSuccess = (e) => {
            clearTimeout(progressTimerRef.current)
            const result = e.detail.result || {}
            const imported = result.imported ?? 0
            const total = result.totalProcessed ?? 0
            const skipped = result.skippedDuplicates ?? 0

            if (result.limitReached) {
                setState(prev => ({
                    ...prev,
                    status: 'error',
                    progress: 100,
                    message: result.errorMessage || `Limit reached. Successfully imported ${imported} contacts! (${total} processed, ${skipped} skipped)`,
                }))

                closeTimerRef.current = setTimeout(() => {
                    setState(prev => ({ ...prev, visible: false }))
                }, 9000)
            } else {
                setState(prev => ({
                    ...prev,
                    status: 'success',
                    progress: 100,
                    message: `Successfully imported ${imported} contacts! (${total} processed, ${skipped} skipped)`,
                }))

                closeTimerRef.current = setTimeout(() => {
                    setState(prev => ({ ...prev, visible: false }))
                }, 6000)
            }
        }

        const onError = (e) => {
            clearTimeout(progressTimerRef.current)
            setState(prev => ({
                ...prev,
                status: 'error',
                progress: 100,
                message: e.detail.message || 'Import failed. Please check the file formatting.',
            }))

            closeTimerRef.current = setTimeout(() => {
                setState(prev => ({ ...prev, visible: false }))
            }, 9000)
        }

        window.addEventListener('crm-import-start', onStart)
        window.addEventListener('crm-import-success', onSuccess)
        window.addEventListener('crm-import-error', onError)

        return () => {
            clearTimeout(progressTimerRef.current)
            clearTimeout(closeTimerRef.current)
            window.removeEventListener('crm-import-start', onStart)
            window.removeEventListener('crm-import-success', onSuccess)
            window.removeEventListener('crm-import-error', onError)
        }
    }, [])

    if (!state.visible) return null

    const isSuccess = state.status === 'success'
    const isError = state.status === 'error'

    let statusColor = T.primary
    let icon = 'sync'
    let iconClass = 'animate-spin'

    if (isSuccess) {
        statusColor = T.success
        icon = 'check_circle'
        iconClass = ''
    } else if (isError) {
        statusColor = T.error
        icon = 'cancel'
        iconClass = ''
    }

    return (
        <div className="fixed top-5 right-5 z-[110] w-96 max-w-[calc(100vw-32px)] flex flex-col rounded-xl overflow-hidden"
            style={{ 
                background: T.surface, 
                border: `1px solid ${isSuccess ? T.success + '40' : isError ? T.error + '40' : T.border}`, 
                boxShadow: SHADOW.lg 
            }}>
            
            <div className="px-4 py-3.5 flex items-start gap-3">
                <span className={`material-symbols-outlined text-[22px] shrink-0 mt-0.5 ${iconClass}`} 
                    style={{ color: statusColor }}>
                    {icon}
                </span>
                
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>
                        CSV Contact Import ({state.fileName})
                    </p>
                    <p className="text-sm mt-1 leading-normal break-words" style={{ color: T.textPrimary }}>
                        {state.message}
                    </p>
                </div>

                <button type="button" onClick={() => setState(prev => ({ ...prev, visible: false }))} 
                    className="p-1 rounded-lg shrink-0"
                    style={{ color: T.textMuted }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                    <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
            </div>

            {/* Progress bar wrapper */}
            <div className="w-full h-1" style={{ background: T.surfaceRaised }}>
                <div className="h-full transition-all duration-300"
                    style={{ 
                        width: `${state.progress}%`, 
                        background: statusColor
                    }} 
                />
            </div>
        </div>
    )
}
