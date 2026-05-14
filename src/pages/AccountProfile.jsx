import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { T, TAG_COLORS, ACTIVITY_STYLES, STAGE_STYLES } from '../constants/theme'
import TopBar from '../components/TopBar'
import api from '../api'
import Skeleton from 'react-loading-skeleton'

const timeAgo = (str) => {
    if (!str) return '—'
    const h = Math.floor((Date.now() - new Date(str)) / 3600000)
    if (h < 1) return 'Just now'; if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24); return d === 1 ? 'Yesterday' : `${d} days ago`
}
const InfoRow = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: value ? T.textPrimary : T.border }}>{value || 'Not provided'}</p>
    </div>
)
const AVATARS = [T.primaryDim, T.secondaryDim, T.tertiaryDim, 'rgba(76,175,125,0.15)']
const AVATAR_COLORS_LIST = [T.primaryText, T.secondaryText, T.tertiaryText, '#4CAF7D']

export default function AccountProfile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get(`/api/accounts/${id}/profile`).then(r => setProfile(r.data)).catch(() => setProfile(null)).finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div>
            <TopBar />
            <main className="p-8 max-w-360 mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton circle width={64} height={64} />
                    <div>
                        <Skeleton height={28} width={220} borderRadius={8} />
                        <Skeleton height={14} width={140} borderRadius={6} className="mt-2" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i}>
                            <Skeleton height={10} width={80} borderRadius={4} />
                            <Skeleton height={16} width={150} borderRadius={6} className="mt-2" />
                        </div>
                    ))}
                </div>
                <Skeleton height={180} borderRadius={16} className="mb-6" />
                <div className="flex flex-col gap-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <Skeleton circle width={32} height={32} />
                            <div className="flex-1">
                                <Skeleton height={13} width={200} borderRadius={6} />
                                <Skeleton height={13} width={130} borderRadius={6} className="mt-1.5" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )

    if (!profile) return (
        <div><TopBar />
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                        <span className="material-symbols-outlined text-[28px]" style={{ color: T.primary }}>business</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>Account not found</p>
                    <button onClick={() => navigate('/accounts')} className="crm-btn-ghost text-sm">← Back</button>
                </div>
            </div>
        </div>
    )

    const tag = TAG_COLORS[profile.tag] || { bg: T.surfaceRaised, color: T.textSecondary }

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-360 mx-auto">
                <button onClick={() => navigate('/accounts')}
                    className="flex items-center gap-2 mb-6 text-sm font-semibold hover:underline"
                    style={{ color: T.primary }}>
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>Back to Accounts
                </button>

                {/* Header */}
                <div className="rounded-2xl p-6 mb-6 flex items-start justify-between gap-6"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black"
                            style={{ background: T.primaryDim, color: T.primary }}>
                            {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.01em' }}>{profile.name}</h1>
                                {profile.tag && <span className="px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: tag.bg, color: tag.color }}>{profile.tag}</span>}
                            </div>
                            {profile.industry && <p className="text-sm mt-1" style={{ color: T.textMuted }}>{profile.industry}</p>}
                            {profile.website && (
                                <a href={`https://${profile.website}`} target="_blank" rel="noreferrer"
                                    className="text-sm font-semibold mt-1 flex items-center gap-1 hover:underline w-fit"
                                    style={{ color: T.primaryText }}>
                                    <span className="material-symbols-outlined text-[14px]">link</span>{profile.website}
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button className="crm-btn-ghost flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-[16px]">call</span>Call</button>
                        <button className="crm-btn-ghost flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-[16px]">mail</span>Email</button>
                        <button className="crm-btn-primary flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-[16px]">handshake</span>Add Deal</button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 flex flex-col gap-6">
                        {/* Overview */}
                        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <h3 className="text-sm font-bold mb-5" style={{ color: T.textPrimary }}>Overview</h3>
                            <div className="grid grid-cols-3 gap-6">
                                <InfoRow label="Phone" value={profile.phone} />
                                <InfoRow label="Website" value={profile.website} />
                                <InfoRow label="Industry" value={profile.industry} />
                                <InfoRow label="Employees" value={profile.employeeRange} />
                                <InfoRow label="Tag" value={profile.tag} />
                                <InfoRow label="Account ID" value={`#${profile.id}`} />
                            </div>
                        </div>

                        {/* Contacts */}
                        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>Related Contacts</h3>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: T.primaryDim, color: T.primaryText }}>{profile.contacts?.length || 0}</span>
                            </div>
                            {profile.contacts?.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {profile.contacts.map((c, i) => (
                                        <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                                            style={{ background: T.surfaceRaised }}
                                            onClick={() => navigate(`/contacts/${c.id}`)}
                                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                                            onMouseLeave={e => e.currentTarget.style.background = T.surfaceRaised}>
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                                                style={{ background: AVATARS[i % 4], color: AVATAR_COLORS_LIST[i % 4] }}>
                                                {c.firstName.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{c.firstName} {c.lastName}</p>
                                                <p className="text-[12px]" style={{ color: T.textMuted }}>{c.designation || '—'}</p>
                                            </div>
                                            <p className="text-[12px]" style={{ color: T.textMuted }}>{c.email}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-center py-6" style={{ color: T.textMuted }}>No contacts linked</p>}
                        </div>

                        {/* Open Deals */}
                        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-bold" style={{ color: T.textPrimary }}>Open Deals</h3>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: T.primaryDim, color: T.primaryText }}>{profile.openDeals?.length || 0}</span>
                            </div>
                            {profile.openDeals?.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {profile.openDeals.map(d => {
                                        const s = STAGE_STYLES[d.stage] || STAGE_STYLES.NEW
                                        return (
                                            <div key={d.id} className="flex items-center justify-between p-4 rounded-xl"
                                                style={{ background: T.surfaceRaised, border: `1px solid ${T.border}` }}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                                                        <span className="material-symbols-outlined text-[18px]" style={{ color: T.primary }}>handshake</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{d.title}</p>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 inline-block"
                                                            style={{ background: s.badgeBg, color: s.badgeColor }}>{d.stage}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black" style={{ color: T.primaryText }}>₹{(d.amount || 0).toLocaleString()}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : <p className="text-sm text-center py-6" style={{ color: T.textMuted }}>No open deals</p>}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-6">
                        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <h3 className="text-sm font-bold mb-5" style={{ color: T.textPrimary }}>Quick Stats</h3>
                            <div className="flex flex-col gap-4">
                                {[
                                    { icon: 'handshake', label: 'Open Deals', value: profile.openDealCount, bg: T.primaryDim, color: T.primary },
                                    { icon: 'groups', label: 'Contacts', value: profile.contactCount, bg: T.secondaryDim, color: T.secondaryText },
                                    { icon: 'payments', label: 'Deal Value', value: '₹' + (profile.openDealAmount || 0).toLocaleString(), bg: T.successDim, color: T.success },
                                ].map(({ icon, label, value, bg, color }) => (
                                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: T.surfaceRaised }}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                                            <span className="material-symbols-outlined text-[18px]" style={{ color }}>{icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
                                            <p className="text-lg font-black" style={{ color: T.textPrimary }}>{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <h3 className="text-sm font-bold mb-5" style={{ color: T.textPrimary }}>Recent Activity</h3>
                            {profile.recentActivities?.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {profile.recentActivities.map(a => {
                                        const s = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
                                        return (
                                            <div key={a.id} className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                                                    <span className="material-symbols-outlined text-[15px]" style={{ color: s.color }}>{s.icon}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[12px] font-semibold" style={{ color: T.textPrimary }}>{a.subject}</p>
                                                    <p className="text-[11px]" style={{ color: T.textMuted }}>{timeAgo(a.createdAt)}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : <p className="text-sm text-center py-4" style={{ color: T.textMuted }}>No recent activity</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}