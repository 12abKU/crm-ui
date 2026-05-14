import { T } from '../../constants/theme'

export default function QuickDialerModal({ number, onNumberChange, onClose, onCall }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="w-80 rounded-2xl p-6 flex flex-col gap-4"
                style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>Dial a number</h3>
                    <button onClick={onClose} style={{ color: T.textMuted }}>
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
                <input
                    className="crm-input text-lg font-bold tracking-widest text-center"
                    placeholder="+91XXXXXXXXXX"
                    value={number}
                    onChange={e => onNumberChange(e.target.value)}
                />
                <button
                    disabled={!number.trim()}
                    onClick={() => onCall(number)}
                    className="crm-btn-primary w-full flex items-center justify-center gap-2 py-3">
                    <span className="material-symbols-outlined text-[18px]">call</span>
                    Call
                </button>
            </div>
        </div>
    )
}
