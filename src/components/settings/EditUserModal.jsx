import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { T } from '../../constants/theme'
import CustomSelect from '../ui/CustomSelect'
import api from '../../api'

const DEFAULT_DESIGNATIONS = [
    'CEO / Founder',
    'Sales Director',
    'Team Lead',
    'Senior Account Executive',
    'Account Executive',
    'SDR / BDR',
    'Customer Success',
]

/**
 * Toast feedback helpers triggering both react-hot-toast and internal CRM event-based toasts.
 */
function notifySuccess(title, body) {
    const text = body ? `${title}: ${body}` : title
    if (typeof toast !== 'undefined' && toast?.success) {
        toast.success(text)
    }
    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent('crm-notification', {
                detail: {
                    title,
                    body: body || title,
                    type: 'TICKET_RESOLVED',
                },
            })
        )
    }
}

function notifyError(message) {
    if (typeof toast !== 'undefined' && toast?.error) {
        toast.error(message)
    }
    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent('crm-api-error', {
                detail: {
                    message,
                    status: 400,
                },
            })
        )
    }
}

export default function EditUserModal({
    user,
    allUsers = [],
    onClose,
    onSuccess,
    onSaved,
}) {
    const currentUserRole = useSelector(state => state.auth?.role)
    const isTargetCompanySuperAdmin = user?.role === 'COMPANY_SUPER_ADMIN'
    const isBlocked = currentUserRole === 'ADMIN' && isTargetCompanySuperAdmin

    const [designation, setDesignation] = useState(user?.designation || '')
    const [managerId, setManagerId] = useState(
        user?.managerId != null ? String(user.managerId) : ''
    )
    const [designations, setDesignations] = useState(DEFAULT_DESIGNATIONS)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Fetch dynamic company.designations setting from server
    useEffect(() => {
        let mounted = true
        api.get('/api/settings/map')
            .then(res => {
                if (!mounted) return
                const raw = res.data?.['company.designations']
                if (raw) {
                    try {
                        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setDesignations(parsed)
                        }
                    } catch (e) {
                        console.warn('Failed to parse company.designations setting', e)
                    }
                }
            })
            .catch(() => {
                // Keep default presets
            })

        return () => {
            mounted = false
        }
    }, [])

    if (!user) return null

    if (isBlocked) {
        return (
            <>
                <div
                    className="fixed inset-0 z-40 backdrop-blur-sm"
                    style={{ background: 'rgba(15,23,42,0.5)' }}
                    onClick={onClose}
                />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}
                    >
                        <div className="flex items-center gap-2 mb-3" style={{ color: T.error }}>
                            <span className="material-symbols-outlined text-[24px]">block</span>
                            <h3 className="text-base font-bold">Access Restricted</h3>
                        </div>
                        <p className="text-sm mb-5" style={{ color: T.textSecondary }}>
                            Regular Admins cannot edit the Company Super Admin.
                        </p>
                        <button type="button" onClick={onClose} className="crm-btn-primary w-full">
                            Close
                        </button>
                    </div>
                </div>
            </>
        )
    }

    // Candidate managers: exclude current user, only active users
    const candidateManagers = (allUsers || []).filter(
        u => u.id !== user.id && u.active !== false
    )

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const selectedMgr = candidateManagers.find(m => String(m.id) === String(managerId))
        const targetManagerName = selectedMgr ? selectedMgr.name : 'Top-Level Root Leader'

        try {
            let updatedUser = { ...user }

            // 1. Update Designation if changed
            const newDesignation = designation.trim() || null
            const prevDesignation = user.designation?.trim() || null
            if (newDesignation !== prevDesignation) {
                const res = await api.put(
                    `/api/management/users/${user.id}/designation`,
                    { designation: newDesignation },
                    { suppressErrorToast: true }
                )
                if (res.data) {
                    updatedUser = { ...updatedUser, ...res.data }
                }
            }

            // 2. Update Manager if changed (COMPANY_SUPER_ADMIN cannot have a manager)
            if (!isTargetCompanySuperAdmin) {
                const newManagerId = managerId ? Number(managerId) : null
                const prevManagerId = user.managerId != null ? Number(user.managerId) : null
                if (newManagerId !== prevManagerId) {
                    const res = await api.put(
                        `/api/management/users/${user.id}/manager`,
                        { managerId: newManagerId },
                        { suppressErrorToast: true }
                    )
                    if (res.data) {
                        updatedUser = { ...updatedUser, ...res.data }
                    }
                }
            }

            notifySuccess(
                'User Updated',
                `${user.name}'s designation and reporting line have been updated.`
            )

            if (typeof onSuccess === 'function') onSuccess(updatedUser)
            if (typeof onSaved === 'function') onSaved(updatedUser)
            onClose()
        } catch (err) {
            const serverMsg =
                err?.response?.data?.message || err?.message || 'Failed to update user.'
            const isCycle =
                err?.response?.status === 400 &&
                (serverMsg.toLowerCase().includes('cycle') ||
                    serverMsg.toLowerCase().includes('loop') ||
                    serverMsg.toLowerCase().includes('own manager'))

            const formattedError = isCycle
                ? `Hierarchy cycle detected: ${user.name} cannot report to ${targetManagerName}. (${serverMsg})`
                : serverMsg

            setError(formattedError)
            notifyError(formattedError)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div
                className="fixed inset-0 z-40 backdrop-blur-sm"
                style={{ background: 'rgba(15,23,42,0.5)' }}
                onClick={onClose}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}
                >
                    {/* Header */}
                    <div
                        className="px-6 py-5 flex items-center justify-between shrink-0"
                        style={{ borderBottom: `1px solid ${T.border}` }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                                style={{ background: T.primaryDim, color: T.primary }}
                            >
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-base font-bold" style={{ color: T.textPrimary }}>
                                    Edit Team Member
                                </h3>
                                <p className="text-xs" style={{ color: T.textMuted }}>
                                    {user.name} ({user.email}) · <span className="font-semibold">{isTargetCompanySuperAdmin ? '👑 Company Super Admin' : user.role}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg"
                            style={{ color: T.textMuted }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHigh }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
                        {error && (
                            <div
                                className="px-4 py-3 rounded-xl text-xs font-semibold flex items-start gap-2"
                                style={{ background: T.errorDim, color: T.error, border: `1px solid ${T.error}30` }}
                            >
                                <span className="material-symbols-outlined text-[18px] shrink-0">
                                    error
                                </span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Designation Input with Datalist */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>
                                    Designation / Title
                                </label>
                                <span className="text-[10px]" style={{ color: T.textMuted }}>
                                    Max 100 characters
                                </span>
                            </div>
                            <input
                                list="edit-designations-list"
                                className="crm-input"
                                placeholder="e.g. Sales Director, Account Executive..."
                                value={designation}
                                onChange={e => setDesignation(e.target.value)}
                                maxLength={100}
                            />
                            <datalist id="edit-designations-list">
                                {designations.map(d => (
                                    <option key={d} value={d} />
                                ))}
                            </datalist>

                            {/* Preset Pills */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                {designations.slice(0, 4).map(d => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setDesignation(d)}
                                        className="text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer"
                                        style={{
                                            background: designation === d ? T.primaryDim : T.surfaceRaised,
                                            color: designation === d ? T.primary : T.textSecondary,
                                            border: `1px solid ${designation === d ? T.primary + '50' : T.borderSubtle}`,
                                        }}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reports To (Manager) Select */}
                        {isTargetCompanySuperAdmin ? (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>
                                    Reports To (Manager)
                                </label>
                                <div className="px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
                                    style={{
                                        background: 'rgba(245, 158, 11, 0.10)',
                                        color: '#F59E0B',
                                        border: '1px solid rgba(245, 158, 11, 0.25)',
                                    }}>
                                    <span>👑</span>
                                    <span>Company Super Admin is the apex root leader and does not report to anyone.</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>
                                    Reports To (Manager)
                                </label>
                                <CustomSelect
                                    className="crm-select"
                                    value={managerId}
                                    onChange={e => setManagerId(e.target.value)}
                                    placeholder="None (Top-Level Root Leader)"
                                >
                                    <option value="">— None (Top-Level Root Leader) —</option>
                                    {candidateManagers.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} {m.designation ? `(${m.designation} · ${m.role})` : `(${m.role})`}
                                        </option>
                                    ))}
                                </CustomSelect>
                                <span className="text-[11px]" style={{ color: T.textMuted }}>
                                    {user.role === 'ADMIN' && !managerId
                                        ? 'Admins without an explicit manager will default to reporting to the Company Super Admin'
                                        : 'Select a direct supervisor. Cycle detection will prevent circular reporting loops.'}
                                </span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-3 mt-1" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                            <button type="button" onClick={onClose} className="crm-btn-ghost flex-1">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="crm-btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div
                                        className="w-4 h-4 rounded-full border-2 animate-spin"
                                        style={{ borderColor: 'white', borderTopColor: 'transparent' }}
                                    />
                                ) : (
                                    <span className="material-symbols-outlined text-[16px]">save</span>
                                )}
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
