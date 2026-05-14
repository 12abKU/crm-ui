import { useEffect, useRef, useState } from 'react'
import { T } from '../../constants/theme'

export default function DealCard({ deal, isDragging, onDragStart, onDragEnd, onRemove, highlighted, onClick }) {
    const [blink, setBlink] = useState(false)
    const wasDragging = useRef(false)

    useEffect(() => {
        if (!highlighted) return
        const timer = setTimeout(() => {
            setBlink(true)
            setTimeout(() => {
                setBlink(false)
                setTimeout(() => { setBlink(true); setTimeout(() => setBlink(false), 500) }, 500)
            }, 500)
        }, 300)
        return () => clearTimeout(timer)
    }, [highlighted])

    return (
        <div
            draggable
            onDragStart={() => { wasDragging.current = true; onDragStart() }}
            onDragEnd={() => { onDragEnd(); setTimeout(() => { wasDragging.current = false }, 50) }}
            onClick={() => { if (!wasDragging.current) onClick() }}
            className="rounded-xl p-4 cursor-pointer active:cursor-grabbing group select-none"
            style={{
                background: blink ? 'rgba(37,99,235,0.28)' : T.surface,
                border: isDragging ? `1px solid ${T.primary}` : `1px solid ${T.border}`,
                boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.18)' : '0 1px 4px rgba(0,0,0,0.06)',
                opacity: isDragging ? 0.5 : 1,
                transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
            }}>
            <div className="flex items-start justify-between gap-2">
                <p className="text-[15px] font-bold leading-snug" style={{ color: T.textPrimary }}>{deal.title}</p>
                <button
                    onClick={e => { e.stopPropagation(); onRemove() }}
                    className="material-symbols-outlined text-[15px] opacity-0 group-hover:opacity-100 p-1 rounded shrink-0"
                    style={{ color: T.textMuted }}
                    onMouseEnter={e => { e.currentTarget.style.color = T.error; e.currentTarget.style.background = T.errorDim }}
                    onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = 'transparent' }}>
                    delete
                </button>
            </div>
            {deal.amount > 0 && (
                <p className="text-[17px] font-black mt-2" style={{ color: T.primaryText }}>
                    ₹{deal.amount.toLocaleString()}
                </p>
            )}
            {deal.account && (
                <div className="flex items-center gap-1.5 mt-2">
                    <span className="material-symbols-outlined text-[14px]" style={{ color: T.textSecondary }}>business</span>
                    <p className="text-[13px] font-semibold" style={{ color: T.textSecondary }}>{deal.account.name}</p>
                </div>
            )}
            {deal.contact && (
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-[14px]" style={{ color: T.textSecondary }}>person</span>
                    <p className="text-[13px] font-semibold" style={{ color: T.textSecondary }}>{deal.contact.firstName} {deal.contact.lastName}</p>
                </div>
            )}
            {deal.expectedCloseDate && (
                <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]" style={{ color: T.textSecondary }}>schedule</span>
                    <p className="text-[13px] font-medium" style={{ color: T.textSecondary }}>Closes {deal.expectedCloseDate}</p>
                </div>
            )}
            <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                <span className="material-symbols-outlined text-[13px]" style={{ color: T.primary }}>open_in_new</span>
                <p className="text-[12px] font-medium" style={{ color: T.primary }}>Click to view details</p>
            </div>
        </div>
    )
}
