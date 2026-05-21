import { T } from '../../constants/theme'

export default function GmailNotConnected({ connecting, onConnect }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: T.primaryDim }}>
                <span className="material-symbols-outlined text-[30px]" style={{ color: T.primary }}>forum</span>
            </div>
            <div className="text-center max-w-xs">
                <p className="text-base font-black" style={{ color: T.textPrimary }}>Connect Gmail to view conversations</p>
                <p className="text-[13px] mt-2 leading-relaxed" style={{ color: T.textMuted }}>
                    See all email threads with your contacts in one place
                </p>
            </div>
            <button onClick={onConnect} disabled={connecting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                style={{ background: T.primary, color: '#fff', opacity: connecting ? 0.7 : 1, boxShadow: '0 4px 14px 4D' }}>
                <span className="material-symbols-outlined text-[16px]">mail</span>
                {connecting ? 'Redirecting...' : 'Connect Gmail'}
            </button>
        </div>
    )
}
