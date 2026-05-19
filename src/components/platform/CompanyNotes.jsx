import { IconNote, IconDeviceFloppy } from '@tabler/icons-react'
import { T } from '../../constants/theme'

export default function CompanyNotes({ notes, onChange, saving, saved }) {
    return (
        <div className="rounded-2xl p-5 mb-5"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <IconNote size={15} style={{ color: T.primary }} />
                    <p className="text-sm font-bold" style={{ color: T.textPrimary }}>Internal Notes</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: T.surfaceRaised, color: T.textMuted }}>
                        Only visible to platform admins
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    {saving && <span className="text-[11px]" style={{ color: T.textMuted }}>Saving...</span>}
                    {saved && !saving && (
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: '#16a34a' }}>
                            <IconDeviceFloppy size={12} /> Saved
                        </span>
                    )}
                </div>
            </div>
            <textarea
                value={notes}
                onChange={e => onChange(e.target.value)}
                placeholder="Add internal notes about this company... (e.g. 'Enterprise lead, promised upgrade by Q3', 'Had billing issue June 2026')"
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{
                    background: T.surfaceRaised,
                    border: `1px solid ${T.border}`,
                    color: T.textPrimary,
                    lineHeight: '1.6',
                }}
            />
        </div>
    )
}