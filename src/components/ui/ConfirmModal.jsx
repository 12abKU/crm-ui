import { useState, useEffect } from 'react'
import { T, SHADOW } from '../../constants/theme'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmColor = T.error, type = 'confirm', defaultValue = '' }) {
    const [inputValue, setInputValue] = useState(defaultValue)

    useEffect(() => {
        if (isOpen) {
            setInputValue(defaultValue)
        }
    }, [isOpen, defaultValue])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
                style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: SHADOW.xl }}>
                
                <div className="px-6 py-5 flex flex-col gap-2">
                    <h3 className="font-black text-lg" style={{ color: T.textPrimary }}>
                        {title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: T.textSecondary }}>
                        {message}
                    </p>
                    {type === 'prompt' && (
                        <div className="mt-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderColor: T.border, background: T.surface, color: T.textPrimary }}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onConfirm(inputValue);
                                    if (e.key === 'Escape' && onCancel) onCancel();
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ background: T.surfaceRaised, borderTop: `1px solid ${T.border}` }}>
                    {onCancel && (
                        <button 
                            type="button" 
                            onClick={onCancel} 
                            className="px-4 py-2 text-sm font-bold rounded-xl transition-all" 
                            style={{ color: T.textPrimary, background: 'transparent' }} 
                            onMouseEnter={e => e.currentTarget.style.background = T.borderSubtle} 
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            Cancel
                        </button>
                    )}
                    <button 
                        type="button" 
                        onClick={() => type === 'prompt' ? onConfirm(inputValue) : onConfirm(true)} 
                        className="px-4 py-2 text-sm font-bold rounded-xl text-white transition-all shadow-sm" 
                        style={{ background: confirmColor }} 
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'} 
                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
