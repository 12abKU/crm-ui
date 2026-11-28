import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams, useNavigate } from 'react-router-dom'
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
import ThemeAppearanceSettings from '../components/settings/ThemeAppearanceSettings'
import BillingSettings from '../components/settings/BillingSettings'
import PageHeroBanner from '../components/ui/PageHeroBanner'
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
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const tabParam = searchParams.get('tab')
    const [activeTab, setActiveTab] = useState(
        (tabParam === 'erp' || tabParam === 'tally') ? 'general' : (tabParam || 'general')
    )

    useEffect(() => {
        if (tabParam === 'erp' || tabParam === 'tally') {
            navigate('/erp', { replace: true })
            return
        }
        if (tabParam) {
            setActiveTab(tabParam)
        }
    }, [tabParam, navigate])

    const handleTabClick = (tabId) => {
        setActiveTab(tabId)
        setSearchParams({ tab: tabId }, { replace: true })
    }

    const renderPanel = () => {
        if (activeTab === 'appearance') {
            return <ThemeAppearanceSettings />
        }
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
        if (activeTab === 'billing') {
            if (role !== 'ADMIN' && role !== 'COMPANY_SUPER_ADMIN') {
                return (
                    <div className="p-8 text-center rounded-2xl border" style={{ background: T.surface, borderColor: T.border }}>
                        <p className="text-sm font-bold" style={{ color: T.error }}>
                            Access Denied: Subscription and billing management is restricted to Company Administrators.
                        </p>
                    </div>
                )
            }
            return <BillingSettings />
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
        if (role === 'SUPER_ADMIN') return <SuperAdminSettings />
        if (role === 'ADMIN' || role === 'COMPANY_SUPER_ADMIN') return <AdminSettings />
        return <AgentSettings />
    }

    return (
        <div>
            <TopBar />
            <main className="p-4 sm:p-8">

                {/* ── Ultra-Premium Hero Banner ──────────────────── */}
                <PageHeroBanner
                    icon={meta.icon}
                    title={meta.label}
                    subtitle={meta.description}
                    badge={badge.label}
                    gradient={meta.gradient}
                />

                {/* ── Sleek Segmented Pill Navigation ──────────────── */}
                <div
                    className="flex w-full mb-7 p-1.5 rounded-2xl border overflow-x-auto whitespace-nowrap scrollbar-none gap-1 sm:gap-2"
                    style={{
                        background: T.surface,
                        borderColor: T.border,
                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    }}
                >
                    {[
                        { id: 'general', label: 'General Settings', icon: 'settings' },
                        { id: 'appearance', label: 'Theme & Appearance', icon: 'palette' },
                        { id: 'templates', label: 'Email Templates', icon: 'mail' },
                        { id: 'sequences', label: 'Automated Sequences', icon: 'bolt' },
                        ...((role === 'ADMIN' || role === 'COMPANY_SUPER_ADMIN') ? [
                            { id: 'billing', label: 'Billing & License', icon: 'credit_card' },
                        ] : []),
                        ...((role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'COMPANY_SUPER_ADMIN') ? [
                            { id: 'custom_fields', label: 'Custom Fields', icon: 'extension' },
                            { id: 'agents', label: 'Team Management', icon: 'manage_accounts' },
                            { id: 'pipeline', label: 'Pipeline Stages', icon: 'linear_scale' },
                            { id: 'integrations', label: 'Webhooks & Integrations', icon: 'hub' },
                        ] : [])
                    ].map(tab => {
                        const active = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer shrink-0 ${
                                    active ? 'shadow-md scale-[1.01]' : 'hover:opacity-90'
                                }`}
                                style={{
                                    background: active ? T.primary : 'transparent',
                                    color: active ? '#FFFFFF' : T.textMuted,
                                    border: active ? `1px solid ${T.primary}70` : '1px solid transparent',
                                    boxShadow: active ? `0 8px 18px -4px ${T.primary}40` : 'none',
                                }}
                            >
                                <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
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

