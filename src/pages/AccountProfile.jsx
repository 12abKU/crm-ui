import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { T, TAG_COLORS, ACTIVITY_STYLES } from '../constants/theme'
import { usePipelineStages } from '../hooks/usePipelineStages'
import TopBar from '../components/TopBar'
import api from '../api'
import Skeleton from 'react-loading-skeleton'
import InlineEdit from '../components/InlineEdit'
import AddDealSlideForm from '../components/deals/AddDealSlideForm'
import { useSelector } from 'react-redux'
import { usePermissions } from '../hooks/usePermission'
import EntityAuditHistory from '../components/audit/EntityAuditHistory'
import DocumentList from './DocumentList'
import CustomFieldsDisplay from '../components/CustomFieldsDisplay'
import AccountFinancialsTab from '../components/account/AccountFinancialsTab'


// ── Helpers (unchanged) ─────────────────────────────────────────
const timeAgo = (str) => {
    if (!str) return 'No value'
    const h = Math.floor((Date.now() - new Date(str)) / 3600000)
    if (h < 1) return 'Just now'; if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24); return d === 1 ? 'Yesterday' : `${d} days ago`
}
const AVATARS = [T.primaryDim, T.secondaryDim, T.tertiaryDim, 'rgba(76,175,125,0.15)']
const AVATAR_COLORS_LIST = [T.primaryText, T.secondaryText, T.tertiaryText, '#4CAF7D']

// ── InfoRow – redesigned ────────────────────────────────────────
const InfoRow = ({ label, value }) => (
    <div className="flex flex-col gap-1.5 p-4 rounded-xl transition-colors"
        style={{ background: T.borderSubtle }}>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
        <p className="text-sm font-semibold break-all" style={{ color: value ? T.textPrimary : T.textMuted }}>
            {value || 'Not provided'}
        </p>
    </div>
)

// ── SectionCard ─────────────────────────────────────────────────
const SectionCard = ({ title, badge, icon, children, action }) => (
    <div className="rounded-2xl overflow-hidden"
        style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: `1px solid ${T.border}`, background: T.primaryFaint }}>
            <div className="flex items-center gap-2.5">
                {icon && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: T.primaryDim }}>
                        <span className="material-symbols-outlined filled text-[15px]"
                            style={{ color: T.primary }}>{icon}</span>
                    </div>
                )}
                <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>{title}</h3>
                {badge !== undefined && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black"
                        style={{ background: T.primaryDim, color: T.primaryText }}>{badge}</span>
                )}
            </div>
            {action}
        </div>
        <div className="p-5">{children}</div>
    </div>
)

export default function AccountProfile() {
    const { getStageLabel, getStageStyle } = usePipelineStages()
    const { id } = useParams()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [dealFormOpen, setDealFormOpen] = useState(false)

    const role = useSelector(state => state.auth.role)
    const can = usePermissions(['DEALS_CREATE', 'ACCOUNTS_EDIT'])
    const canCreateDeal = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'COMPANY_SUPER_ADMIN' || can.DEALS_CREATE
    const canEditAccount = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'COMPANY_SUPER_ADMIN' || can.ACCOUNTS_EDIT

    useEffect(() => {
        const controller = new AbortController()
        setLoading(true)
        api.get(`/api/accounts/${id}/profile`, { signal: controller.signal, suppressErrorToast: true })
            .then(r => setProfile(r.data))
            .catch(err => { if (!controller.signal.aborted) setProfile(null) })
            .finally(() => { if (!controller.signal.aborted) setLoading(false) })
        return () => controller.abort()
    }, [id])

    const updateField = async (field, value) => {
        const phoneDigits = value ? value.replace(/\D/g, '') : ''
        if (field === 'phone' && value && (phoneDigits.length < 10 || phoneDigits.length > 12)) {
            throw new Error('Phone number must be digits only, between 10 and 12 digits')
        }
        await api.put(`/api/accounts/${id}`, {
            name: profile.name, website: profile.website, phone: profile.phone,
            industry: profile.industry, employeeRange: profile.employeeRange, tag: profile.tag,
            [field]: value
        })
        setProfile(p => ({ ...p, [field]: value }))
    }

    // ── Loading skeleton ─────────────────────────────────────────
    if (loading) return (
        <div>
            <TopBar />
            <main className="p-4 md:p-8">
                {/* Hero skeleton */}
                <div className="rounded-3xl overflow-hidden mb-6 p-8"
                    style={{ background: T.surfaceHigh, minHeight: 140 }}>
                    <div className="flex items-center gap-5">
                        <Skeleton circle width={72} height={72} />
                        <div>
                            <Skeleton height={28} width={240} borderRadius={8} />
                            <Skeleton height={14} width={160} borderRadius={6} className="mt-2" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-xl" style={{ background: T.surfaceHigh }}>
                            <Skeleton height={10} width={80} borderRadius={4} />
                            <Skeleton height={16} width={140} borderRadius={6} className="mt-2" />
                        </div>
                    ))}
                </div>
                <Skeleton height={180} borderRadius={16} className="mb-6" />
                <div className="flex flex-col gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <Skeleton circle width={36} height={36} />
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

    // ── Not found ────────────────────────────────────────────────
    if (!profile) return (
        <div>
            <TopBar />
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: T.primaryDim }}>
                        <span className="material-symbols-outlined filled text-[30px]"
                            style={{ color: T.primary }}>business</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: T.textPrimary }}>Account not found</p>
                    <button onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 group"
                        style={{ background: T.primaryDim, color: T.primary, border: `1.5px solid ${T.primary}30` }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${T.primary}22`; e.currentTarget.style.boxShadow = `0 4px 12px ${T.primary}20` }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.boxShadow = 'none' }}>
                        <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:-translate-x-0.5">arrow_back</span>
                        Back
                    </button>
                </div>
            </div>
        </div>
    )

    const tag = TAG_COLORS[profile.tag] || { bg: T.surfaceRaised, color: T.textSecondary }

    return (
        <div>
            <TopBar />
            <main className="p-4 md:p-8">

                {/* ── Back button ───────────────────────────── */}
                <button onClick={() => navigate(-1)}
                    className="inline-flex items-center justify-center gap-2 mb-5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 group w-full sm:w-auto"
                    style={{ background: T.primaryDim, color: T.primary, border: `1.5px solid ${T.primary}30` }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${T.primary}22`; e.currentTarget.style.boxShadow = `0 4px 12px ${T.primary}20` }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.boxShadow = 'none' }}>
                    <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:-translate-x-0.5">arrow_back</span>
                    Back
                </button>

                {/* ── Hero Profile Banner ───────────────────── */}
                <div className="relative rounded-3xl overflow-hidden mb-6"
                    style={{
                        background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
                    }}>
                    {/* Orbs */}
                    <div style={{
                        position: 'absolute', top: -50, right: -50, width: 220, height: 220,
                        borderRadius: '50%',
                        background: `radial-gradient(circle,  0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -30, left: '45%', width: 150, height: 150,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${T.heroAccentGlow} 0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />

                    <div className="relative px-6 py-6 lg:px-8 lg:py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Left: avatar + name */}
                        <div className="flex items-center gap-5">
                            <div className="w-18 h-18 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black shrink-0"
                                style={{
                                    width: 72, height: 72,
                                    background: 'rgba(255,255,255,0.15)',
                                    border: '2px solid rgba(255,255,255,0.25)',
                                    color: '#fff',
                                    backdropFilter: 'blur(8px)',
                                }}>
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <InlineEdit value={profile.name} onSave={v => updateField('name', v)} placeholder="Account name" readonly={!canEditAccount}>
                                        <h1 className="text-xl sm:text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                            {profile.name}
                                        </h1>
                                    </InlineEdit>
                                    {profile.tag && (
                                        <span className="px-3 py-1 rounded-full text-[11px] font-bold"
                                            style={{ background: tag.bg, color: tag.color }}>{profile.tag}</span>
                                    )}
                                </div>
                                {profile.industry && (
                                    <p className="text-sm mt-0.5" style={{ color: T.heroSubText }}>
                                        {profile.industry}
                                    </p>
                                )}
                                {profile.website && (
                                    <a href={`https://${profile.website}`} target="_blank" rel="noreferrer"
                                        className="text-sm font-semibold mt-1 flex items-center gap-1 hover:underline w-fit"
                                        style={{ color: T.heroSubText }}>
                                        <span className="material-symbols-outlined text-[13px]">link</span>
                                        {profile.website}
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Right: action buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
                            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all w-full sm:w-auto"
                                style={{ background: T.heroBadgeBg, color: T.sidebarActiveText, border: `1px solid ${T.heroBadgeBorder}` }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}>
                                <span className="material-symbols-outlined text-[16px]">mail</span>Email
                            </button>
                            {canCreateDeal && (
                                <button onClick={() => setDealFormOpen(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all w-full sm:w-auto"
                                    style={{
                                        background: `linear-gradient(135deg, ${T.avatarGradFrom} 0%, ${T.avatarGradTo} 100%)`,
                                        color: '#fff',
                                        boxShadow: `0 6px 20px ${T.avatarGlow}`,
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
                                    onMouseLeave={e => e.currentTarget.style.background = T.primary}>
                                    <span className="material-symbols-outlined text-[16px]">handshake</span>Add Deal
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── 3-column Quick Stats Bar ──────────────── */}
                <div className="flex flex-wrap gap-4 mb-6">
                    {[
                        { icon: 'handshake', label: 'Open Deals', value: profile.openDealCount, bg: T.primaryDim, color: T.chartBlue },
                        { icon: 'groups', label: 'Contacts', value: profile.contactCount, bg: 'rgba(83,141,141,0.14)', color: T.chartTeal },
                        { icon: 'payments', label: 'Deal Value', value: '₹' + (profile.openDealAmount || 0).toLocaleString(), bg: 'rgba(22,163,74,0.12)', color: '#16A34A' },
                    ].map(({ icon, label, value, bg, color }) => (
                        <div key={label}
                            className="flex-1 min-w-[200px] flex items-center gap-4 p-5 rounded-2xl transition-all duration-150"
                            style={{
                                background: T.surface,
                                border: `1px solid ${T.border}`,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'none'
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                            }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                                <span className="material-symbols-outlined filled text-[22px]" style={{ color }}>{icon}</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
                                <p className="text-xl sm:text-2xl font-black mt-0.5" style={{ color: T.textPrimary }}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Main 2-col layout ──────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left col: Overview + Contacts + Open Deals */}
                    <div className="lg:col-span-2 flex flex-col gap-5">

                        {/* Overview */}
                        <SectionCard title="Overview" icon="info">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <InfoRow label="Phone" value={profile.phone} />
                                <InfoRow label="Website" value={profile.website} />
                                <InfoRow label="Industry" value={profile.industry} />
                                <InfoRow label="Employees" value={profile.employeeRange} />
                                <InfoRow label="Tag" value={profile.tag} />
                                <InfoRow label="Account ID" value={`#${profile.id}`} />
                            </div>
                        </SectionCard>

                        {/* TallyPrime 360 Financials & Credit Overview */}
                        <SectionCard title="TallyPrime 360 Financials" icon="account_balance">
                            <AccountFinancialsTab accountId={profile.id} account={profile} />
                        </SectionCard>

                        {/* Custom Fields */}
                        <CustomFieldsDisplay
                            entityType="ACCOUNT"
                            values={profile.customValues || {}}
                            renderWrapper={(children) => (
                                <SectionCard title="Custom Fields" icon="tune">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {children}
                                    </div>
                                </SectionCard>
                            )}
                            FieldComponent={({ label, value }) => <InfoRow label={label} value={value} />}
                        />

                        {/* Related Contacts */}
                        <SectionCard title="Related Contacts" icon="groups" badge={profile.contacts?.length || 0}>
                            {profile.contacts?.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {profile.contacts.map((c, i) => (
                                        <div key={c.id}
                                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150"
                                            style={{ background: T.borderSubtle }}
                                            onClick={() => navigate(`/contacts/${c.id}`)}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = T.primaryFaint
                                                e.currentTarget.style.transform = 'translateX(3px)'
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = T.borderSubtle
                                                e.currentTarget.style.transform = 'none'
                                            }}>
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                                                style={{ background: AVATARS[i % 4], color: AVATAR_COLORS_LIST[i % 4] }}>
                                                {c.firstName.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold" style={{ color: T.textPrimary }}>{c.firstName} {c.lastName}</p>
                                                <p className="text-[12px]" style={{ color: T.textMuted }}>{c.designation || 'No value'}</p>
                                            </div>
                                            <p className="text-[12px] hidden sm:block truncate" style={{ color: T.textMuted }}>{c.email}</p>
                                            <span className="material-symbols-outlined text-[14px] shrink-0" style={{ color: T.primary }}>chevron_right</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-8 gap-2">
                                    <span className="material-symbols-outlined text-[28px]" style={{ color: T.textMuted }}>group_off</span>
                                    <p className="text-sm" style={{ color: T.textMuted }}>No contacts linked</p>
                                </div>
                            )}
                        </SectionCard>

                        {/* Open Deals */}
                        <SectionCard title="Open Deals" icon="handshake" badge={profile.openDeals?.length || 0}
                            action={canCreateDeal && (
                                <button onClick={() => setDealFormOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                    style={{ background: T.primaryDim, color: T.primaryText }}
                                    onMouseEnter={e => e.currentTarget.style.background = T.primary.replace(')', ', 0.2)').replace('rgb', 'rgba')}
                                    onMouseLeave={e => e.currentTarget.style.background = T.primaryDim}>
                                    <span className="material-symbols-outlined text-[13px]">add</span>Add Deal
                                </button>
                            )}>
                            {profile.openDeals?.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {profile.openDeals.map(d => {
                                        const s = getStageStyle(d.stage)
                                        return (
                                            <div key={d.id}
                                                className="flex items-center justify-between p-4 rounded-xl transition-all duration-150"
                                                style={{
                                                    background: T.borderSubtle,
                                                    border: `1px solid ${T.border}`,
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = T.primaryFaint}
                                                onMouseLeave={e => e.currentTarget.style.background = T.borderSubtle}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                                        style={{ background: T.primaryDim }}>
                                                        <span className="material-symbols-outlined filled text-[18px]"
                                                            style={{ color: T.primary }}>handshake</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold" style={{ color: T.textPrimary }}>{d.title}</p>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 inline-block"
                                                            style={{ background: s.badgeBg, color: s.badgeColor }}>{getStageLabel(d.stage)}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black" style={{ color: T.primaryText }}>
                                                    ₹{(d.amount || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-8 gap-2">
                                    <span className="material-symbols-outlined text-[28px]" style={{ color: T.textMuted }}>handshake</span>
                                    <p className="text-sm" style={{ color: T.textMuted }}>No open deals</p>
                                </div>
                            )}
                        </SectionCard>

                        {/* Documents */}
                        {role !== 'AGENT' && (
                            <SectionCard title="Documents" icon="folder_open">
                                <DocumentList entityType="account" entityId={Number(id)} />
                            </SectionCard>
                        )}
                    </div>

                    {/* Right sidebar: Recent Activity + Audit */}
                    <div className="flex flex-col gap-5">
                        <SectionCard title="Recent Activity" icon="event_note">
                            {profile.recentActivities?.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                    {profile.recentActivities.map((a, i) => {
                                        const s = ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.NOTE
                                        return (
                                            <div key={a.id}
                                                className="flex items-start gap-3 py-3 px-2 rounded-xl transition-colors"
                                                style={{ background: i % 2 === 0 ? T.borderSubtle : 'transparent' }}
                                                onMouseEnter={e => e.currentTarget.style.background = T.primaryFaint}
                                                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.borderSubtle : 'transparent'}>
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                                    style={{ background: s.bg }}>
                                                    <span className="material-symbols-outlined filled text-[14px]"
                                                        style={{ color: s.color }}>{s.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[12px] font-semibold" style={{ color: T.textPrimary }}>{a.subject}</p>
                                                    <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>{timeAgo(a.createdAt)}</p>
                                                </div>
                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full shrink-0"
                                                    style={{ background: T.onlineDot, borderColor: T.avatarBorderColor }}>{a.type}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-8 gap-2">
                                    <span className="material-symbols-outlined text-[26px]" style={{ color: T.textMuted }}>event_note</span>
                                    <p className="text-sm" style={{ color: T.textMuted }}>No recent activity</p>
                                </div>
                            )}
                        </SectionCard>

                        {/* Audit History — admin only, auto-hides for agents */}
                        <EntityAuditHistory entityType="ACCOUNT" entityId={Number(id)} />
                    </div>
                </div>
            </main>

            {/* AddDealSlideForm — all props identical */}
            <AddDealSlideForm
                open={dealFormOpen}
                onClose={() => setDealFormOpen(false)}
                onSuccess={() => {
                    setDealFormOpen(false)
                    // re-fetch profile to refresh open deals list
                    api.get(`/api/accounts/${id}/profile`).then(r => setProfile(r.data))
                }}
                prefillAccount={{ id: profile.id, name: profile.name }}
            />
        </div>
    )
}