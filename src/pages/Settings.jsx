import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import AgentSettings from '../components/settings/AgentSettings'
import AdminSettings from '../components/settings/AdminSettings'
import SuperAdminSettings from '../components/settings/SuperAdminSettings'
import AppIntegrationsSettings from '../components/settings/AppIntegrationsSettings'
import EmailTemplatesSettings from '../components/settings/EmailTemplatesSettings'
import AutomatedSequencesSettings from '../components/settings/AutomatedSequencesSettings'
import PipelineSettings from '../components/settings/PipelineSettings'
import AgentManagementSettings from '../components/settings/AgentManagementSettings'
import CustomFieldsSettings from '../components/settings/CustomFieldsSettings'
import CompanyIntegrationsSettings from '../components/settings/CompanyIntegrationsSettings'
import TallySettings from '../components/settings/TallySettings'
import { T } from '../constants/theme'

// -- Role metadata (unchanged) ---------------------------------
const ROLE_META = {
    SUPER_ADMIN: {
        icon: 'shield_person',
        label: 'Super Admin Settings',
        description: 'Full control over users, roles, and system configuration',
        accent: T.superAdminColor,
        accentBg: T.superAdminDim,
        gradient: 'linear-gradient(135deg, #1e1033 0%, #2d1b69 55%, #1a0f40 100%)',
    },
    COMPANY_SUPER_ADMIN: {
        icon: 'shield_person',
        label: 'Company Super Admin Settings',
        description: 'Supreme control over company hierarchy, agents, and configuration',
        accent: '#F59E0B',
        accentBg: 'rgba(245, 158, 11, 0.15)',
        gradient: 'linear-gradient(135deg, #2b1d06 0%, #452b03 55%, #1f1402 100%)',
    },
    ADMIN: {
        icon: 'admin_panel_settings',
        label: 'Admin Settings',
        description: 'Manage your team agents and your own profile',
        accent: T.primary,
        accentBg: T.primaryDim,
        gradient: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 55%, ${T.heroBgTo} 100%)`,
    },
    AGENT: {
        icon: 'manage_accounts',
        label: 'My Settings',
        description: 'Manage your profile and view your permissions',
        accent: T.success,
        accentBg: T.successDim,
        gradient: 'linear-gradient(135deg, #052e16 0%, #14532d 55%, #052e16 100%)',
    },
}

const ROLE_BADGE = {
    SUPER_ADMIN: { bg: T.superAdminDim, color: T.superAdminLight, label: 'Super Admin' },
    COMPANY_SUPER_ADMIN: { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', label: '👑 Company Super Admin' },
    ADMIN:       { bg: T.primaryDim,             color: T.primary,  label: 'Admin' },
    AGENT:       { bg: T.successDim,             color: T.success,  label: 'Agent' },
}

export default function Settings() {
    const role = useSelector(state => state.auth.role)
    const meta = ROLE_META[role] || ROLE_META.AGENT
    const badge = ROLE_BADGE[role] || ROLE_BADGE.AGENT
    const [searchParams, setSearchParams] = useSearchParams()
    const tabParam = searchParams.get('tab')
    const [activeTab, setActiveTab] = useState(tabParam || 'general')

    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam)
        }
    }, [tabParam])

    const handleTabClick = (tabId) => {
        setActiveTab(tabId)
        setSearchParams({ tab: tabId }, { replace: true })
    }

    const renderPanel = () => {
        if (activeTab === 'templates') {
            return <EmailTemplatesSettings />
        }
        if (activeTab === 'sequences') {
            return <AutomatedSequencesSettings />
        }
        if (activeTab === 'pipeline') {
            return <PipelineSettings />
        }
        if (activeTab === 'custom_fields') {
            return <CustomFieldsSettings />
        }
        if (activeTab === 'agents') {
            return <AgentManagementSettings />
        }
        if (activeTab === 'integrations') {
            if (role === 'AGENT') {
                return (
                    <div className="p-8 text-center rounded-2xl border" style={{ background: T.surface, borderColor: T.border }}>
                        <p className="text-sm font-bold" style={{ color: T.error }}>
                            Access Denied: Webhook and integration settings are restricted to Company Administrators.
                        </p>
                    </div>
                )
            }
            return <CompanyIntegrationsSettings />
        }
        if (activeTab === 'tally') {
            if (!['ADMIN', 'SUPER_ADMIN', 'COMPANY_SUPER_ADMIN'].includes(role)) {
                return (
                    <div className="p-8 text-center rounded-2xl border" style={{ background: T.surface, borderColor: T.border }}>
                        <p className="text-sm font-bold" style={{ color: T.error }}>
                            Access Denied: TallyPrime accounting integration settings are restricted to Company Administrators.
                        </p>
                    </div>
                )
            }
            return <TallySettings />
        }
        if (role === 'SUPER_ADMIN') return <SuperAdminSettings />
        if (role === 'ADMIN' || role === 'COMPANY_SUPER_ADMIN') return <AdminSettings />
        return <AgentSettings />
    }

    return (
        <div>
            <TopBar />
            <main className="p-4 sm:p-8">

                {/* -- Hero Banner ---------------------------- */}
                <div className="relative rounded-3xl overflow-hidden mb-8"
                    style={{ background: meta.gradient, minHeight: 120 }}>
                    {/* Orbs */}
                    <div style={{
                        position: 'absolute', top: -40, right: -40, width: 220, height: 220,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${meta.accent}35 0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: '40%', width: 140, height: 140,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${meta.accent}12 0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />

                    <div className="relative px-6 py-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                }}>
                                <span className="material-symbols-outlined filled text-[24px]"
                                    style={{ color: 'rgba(255,255,255,0.90)' }}>{meta.icon}</span>
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                                    {meta.label}
                                </h2>
                                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                    {meta.description}
                                </p>
                            </div>
                        </div>

                        {/* Role badge */}
                        <span className="px-4 py-2 rounded-xl text-sm font-black shrink-0 w-full lg:w-auto text-center"
                            style={{
                                background: T.heroBadgeBg,
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.20)',
                                letterSpacing: '0.02em',
                             }}>
                            {badge.label}
                        </span>
                    </div>
                </div>

                {/* -- Tabs Navigation -------------------------- */}
                <div className="flex w-full mb-6 border-b pb-px overflow-x-auto whitespace-nowrap scrollbar-none" style={{ borderColor: T.border }}>
                    {[
                        { id: 'general', label: 'General Settings', icon: 'settings' },
                        { id: 'templates', label: 'Email Templates', icon: 'mail' },
                        { id: 'sequences', label: 'Automated Sequences', icon: 'bolt' },
                        ...((role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'COMPANY_SUPER_ADMIN') ? [
                            { id: 'custom_fields', label: 'Custom Fields', icon: 'extension' },
                            { id: 'agents', label: 'Team Management', icon: 'manage_accounts' },
                            { id: 'pipeline', label: 'Pipeline Stages', icon: 'linear_scale' },
                            { id: 'integrations', label: 'Webhooks & Integrations', icon: 'hub' },
                            { id: 'tally', label: 'TallyPrime Integration', icon: 'receipt_long' },
                        ] : [])
                    ].map(tab => {
                        const active = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className="flex-1 flex justify-center items-center gap-1.5 md:gap-2 px-2 sm:px-4 py-3 -mb-px border-b-2 font-bold text-[11px] sm:text-xs lg:text-sm transition-all shrink-0 cursor-pointer"
                                style={{
                                    borderColor: active ? T.primary : 'transparent',
                                    color: active ? T.primaryText : T.textSecondary,
                                    opacity: active ? 1 : 0.7,
                                }}
                            >
                                <span className="hidden sm:block material-symbols-outlined text-[16px] lg:text-[18px]">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Settings panel */}
                {renderPanel()}
            </main>
        </div>
    )
}

