import { useEffect, useState } from 'react';
import { T } from '../../constants/theme';
import api from '../../api';

function formatBytes(bytes) {
    if (bytes == null || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function StorageLimitBar({ refreshTrigger }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/api/dashboard')
            .then(res => setStats(res.data))
            .catch(err => console.error("Failed to load storage stats", err));
    }, [refreshTrigger]);

    if (!stats) return null;

    const value = stats.currentStorageBytes || 0;
    const limit = stats.maxStorageBytes || 0;
    const isUnlimited = limit <= 0;
    const percent = isUnlimited ? 0 : Math.min(100, Math.max(0, value / limit) * 100);

    return (
        <div className="flex flex-col gap-1.5 w-full max-w-sm px-4 py-3 rounded-xl border" style={{ background: T.surface, borderColor: T.borderSubtle }}>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider" style={{ color: T.textMuted }}>
                <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">cloud</span>
                    <span>Storage Limit</span>
                </div>
                <span>{formatBytes(value)} / {isUnlimited ? '∞' : formatBytes(limit)}</span>
            </div>
            {!isUnlimited && (
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: T.borderSubtle }}>
                    <div className="h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${percent}%`,
                                background: percent >= 90 ? T.error : percent >= 75 ? '#D97706' : T.primary
                            }} />
                </div>
            )}
        </div>
    );
}
