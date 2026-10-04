import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { T } from '../constants/theme'
import TopBar from '../components/TopBar'
import api from '../api'
import Skeleton from 'react-loading-skeleton'
import usePermission from '../hooks/usePermission'
import EntityAuditHistory from '../components/audit/EntityAuditHistory'
import EditLeadSlideForm from '../components/leadPanel/EditLeadSlideForm'
import PrivacyTab from '../components/privacy/PrivacyTab'

const HERO_ACCENTS = T.heroAccents

const InfoRow = ({ label, value }) => (
    <div className="flex flex-col gap-1.5 p-4 rounded-xl" style={{ background: T.borderSubtle }}>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
        <p className="text-sm font-semibold break-all" style={{ color: value ? T.textPrimary : T.textMuted }}>
            {value || 'Not provided'}
        </p>
    </div>
)

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

export default function LeadProfile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editOpen, setEditOpen] = useState(false)

    const canEdit = usePermission('LEADS_EDIT')

    useEffect(() => {
        const controller = new AbortController()
        api.get(`/api/leads/${id}`, { signal: controller.signal, suppressErrorToast: true })
            .then(r => setProfile(r.data))
            .catch(() => { if (!controller.signal.aborted) setProfile(null) })
            .finally(() => { if (!controller.signal.aborted) setLoading(false) })
        return () => controller.abort()
    }, [id])


    if (loading) return (
        <div>
            <TopBar />
            <main className="p-4 md:p-8">
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
            </main>
        </div>
    )

    if (!profile) return (
        <div>
            <TopBar />
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: T.primaryDim }}>
                        <span className="material-symbols-outlined filled text-[30px]"
                            style={{ color: T.primary }}>person_search</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: T.textPrimary }}>Lead not found</p>
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

    const av = profile.id % 4
    const heroAccent = HERO_ACCENTS[av]
    const leadName = profile.senderName || profile.title || 'Unknown'

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
                        background: `linear-gradient(135deg, ${T.sidebar} 0%, ${heroAccent.from} 50%, ${heroAccent.to} 100%)`,
                    }}>
                    {/* Orbs */}
                    <div style={{
                        position: 'absolute', top: -50, right: -50, width: 220, height: 220,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -30, left: '45%', width: 150, height: 150,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div className="relative px-6 py-6 lg:px-8 lg:py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="rounded-full flex items-center justify-center text-2xl sm:text-3xl font-black shrink-0 shadow-lg"
                                style={{
                                    width: 72, height: 72,
                                    background: 'rgba(255,255,255,0.18)',
                                    border: '2px solid rgba(255,255,255,0.30)',
                                    color: '#fff',
                                    backdropFilter: 'blur(8px)',
                                }}>
                                {leadName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.01em' }}>
                                    {leadName}
                                </h1>
                                <p className="text-sm font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                    {profile.title}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap mt-2">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                                        {profile.status}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
                                        {profile.source}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
                            <button
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 w-full sm:w-auto"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1px solid rgba(255,255,255,0.20)',
                                    color: '#fff',
                                }}
                                onMouseEnter={e => { if (profile?.senderPhone) e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}>
                                <span className="material-symbols-outlined text-[16px]">call</span>Call
                            </button>
                            <button
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all w-full sm:w-auto"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1px solid rgba(255,255,255,0.20)',
                                    color: '#fff',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}>
                                <span className="material-symbols-outlined text-[16px]">mail</span>Email
                            </button>
                            {canEdit && (
                                <button onClick={() => setEditOpen(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all w-full sm:w-auto"
                                    style={{
                                        background: T.primary,
                                        border: '1px solid rgba(255,255,255,0.20)',
                                        color: '#fff',
                                        boxShadow: `0 4px 14px ${T.avatarGlow}`,
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
                                    onMouseLeave={e => e.currentTarget.style.background = T.primary}>
                                    <span className="material-symbols-outlined text-[16px]">edit</span>Edit
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Quick Stats Bar ───────────────────────── */}
                <div className="flex flex-wrap gap-4 mb-6">
                    {[
                        { icon: 'person', label: 'Sender', value: profile.senderName || 'Not Provided', bg: T.primaryDim, color: T.chartBlue },
                        { icon: 'apartment', label: 'Company', value: profile.indiamartCompany || profile.accountName || 'Unknown', bg: 'rgba(22,163,74,0.12)', color: '#16A34A' },
                        { icon: 'mail', label: 'Email', value: profile.senderEmail || 'N/A', bg: 'rgba(83,141,141,0.14)', color: T.chartTeal },
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
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>{label}</p>
                                <p className="text-lg font-black mt-0.5 truncate" style={{ color: T.textPrimary }}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="lg:col-span-2 flex flex-col gap-5">
                        <SectionCard title="Lead Details" icon="info">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <InfoRow label="Title" value={profile.title} />
                                <InfoRow label="Sender Name" value={profile.senderName} />
                                <InfoRow label="Email" value={profile.senderEmail} />
                                <InfoRow label="Phone" value={profile.senderPhone} />
                                <InfoRow label="City" value={profile.city} />
                            </div>
                        </SectionCard>
                        
                        {profile.message && (
                            <SectionCard title="Message/Notes" icon="notes">
                                <p className="text-sm p-4 rounded-xl" style={{ background: T.borderSubtle, color: T.textSecondary, whiteSpace: 'pre-wrap' }}>
                                    {profile.message}
                                </p>
                            </SectionCard>
                        )}
                        
                        {profile.source === 'INDIAMART' && (
                            <SectionCard title="IndiaMart Details" icon="shopping_bag">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <InfoRow label="Product" value={profile.indiamartProduct} />
                                    <InfoRow label="Subject" value={profile.indiamartSubject} />
                                    <InfoRow label="Company" value={profile.indiamartCompany} />
                                    <InfoRow label="State" value={profile.indiamartState} />
                                    <InfoRow label="Pincode" value={profile.indiamartPincode} />
                                    <InfoRow label="Alt Mobile" value={profile.indiamartAltMobile} />
                                </div>
                            </SectionCard>
                        )}
                        
                        {profile.source === 'SULEKHA' && (
                            <SectionCard title="Sulekha Details" icon="business_center">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <InfoRow label="Requirement" value={profile.sulekhaRequirement} />
                                    <InfoRow label="Service" value={profile.sulekhaService} />
                                    <InfoRow label="Category" value={profile.sulekhaCategory} />
                                    <InfoRow label="Date" value={profile.sulekhaDate} />
                                </div>
                            </SectionCard>
                        )}
                        
                        {profile.source === 'WHATSAPP' && (
                            <SectionCard title="WhatsApp Details" icon="chat">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <InfoRow label="WhatsApp Number" value={profile.whatsappNumber} />
                                    <InfoRow label="First Message" value={profile.whatsappFirstMessage} />
                                </div>
                            </SectionCard>
                        )}
                    </div>
                    
                    {/* Right Column */}
                    <div className="flex flex-col gap-5">
                        <SectionCard title="Linked Records" icon="link">
                            <div className="flex flex-col gap-4">
                                <div className="p-4 rounded-xl transition-all" style={{ background: T.borderSubtle, border: `1px solid ${T.border}` }}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.primaryDim }}>
                                            <span className="material-symbols-outlined text-[16px]" style={{ color: T.primary }}>person</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Contact</p>
                                        </div>
                                    </div>
                                    {profile.contactId ? (
                                        <button onClick={() => navigate(`/contacts/${profile.contactId}`)}
                                            className="text-sm font-bold hover:underline" style={{ color: T.primary }}>
                                            {profile.contactName || 'View Contact'}
                                        </button>
                                    ) : (
                                        <p className="text-sm font-semibold" style={{ color: T.textMuted }}>No linked contact</p>
                                    )}
                                </div>
                                <div className="p-4 rounded-xl transition-all" style={{ background: T.borderSubtle, border: `1px solid ${T.border}` }}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.primaryDim }}>
                                            <span className="material-symbols-outlined text-[16px]" style={{ color: T.primary }}>business</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Account</p>
                                        </div>
                                    </div>
                                    {profile.accountId ? (
                                        <button onClick={() => navigate(`/accounts/${profile.accountId}`)}
                                            className="text-sm font-bold hover:underline" style={{ color: T.primary }}>
                                            {profile.accountName || 'View Account'}
                                        </button>
                                    ) : (
                                        <p className="text-sm font-semibold" style={{ color: T.textMuted }}>No linked account</p>
                                    )}
                                </div>
                            </div>
                        </SectionCard>
                        
                        <SectionCard title="Privacy & Consent" icon="privacy_tip">
                            <PrivacyTab principalType="LEAD" principalId={Number(id)} />
                        </SectionCard>

                        <EntityAuditHistory entityType="LEAD" entityId={Number(id)} />
                    </div>
                </div>
            </main>

            {editOpen && profile && canEdit && (
                <EditLeadSlideForm
                    open={editOpen}
                    lead={profile}
                    onClose={() => setEditOpen(false)}
                    onSuccess={(updated) => setProfile(updated)}
                />
            )}
        </div>
    )
}
