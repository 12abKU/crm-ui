import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import CustomSelect from '../ui/CustomSelect'
import api, { extractApiErrorMessage } from '../../api'

const DEFAULT_DESIGNATIONS = [
    'CEO / Founder',
    'Sales Director',
    'Team Lead',
    'Senior Account Executive',
    'Account Executive',
    'SDR / BDR',
    'Customer Success',
]

export default function InviteUserModal({
    onClose,
    onSubmit,
    allowAdminRole = false,
    users: propUsers = [],
}) {
    const currentUserRole = useSelector(state => state.auth.role)
    const isCompanySuperAdmin = currentUserRole === 'COMPANY_SUPER_ADMIN' || currentUserRole === 'SUPER_ADMIN'
    const isRegularAdmin = currentUserRole === 'ADMIN'

    // COMPANY_SUPER_ADMIN can invite both ADMIN and AGENT. Regular ADMIN is restricted to AGENT.
    const canInviteAdmin = isCompanySuperAdmin || (allowAdminRole && !isRegularAdmin)

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'AGENT',
        designation: '',
        managerId: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [designations, setDesignations] = useState(DEFAULT_DESIGNATIONS)
    const [managers, setManagers] = useState(propUsers || [])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    useEffect(() => {
        let mounted = true

        // 1. Fetch designations from app_settings
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
                // Keep DEFAULT_DESIGNATIONS fallback
            })

        // 2. Fetch managers if not passed via props
        if (!propUsers || propUsers.length === 0) {
            api.get('/api/management/users')
                .then(res => {
                    if (!mounted) return
                    if (Array.isArray(res.data)) {
                        setManagers(res.data.filter(u => u.active !== false))
                    }
                })
                .catch(err => {
                    console.error('Failed to load active managers:', err)
                })
        } else {
            setManagers(propUsers.filter(u => u.active !== false))
        }

        return () => {
            mounted = false
        }
    }, [propUsers])

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                role: canInviteAdmin ? form.role : 'AGENT',
                designation: form.designation?.trim() || null,
                managerId: form.managerId ? Number(form.managerId) : null,
            }
            await onSubmit(payload)
            onClose()
        } catch (err) {
            setError(extractApiErrorMessage(err, 'Failed to create user'))
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
                    className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}
                >
                    {/* Header */}
                    <div
                        className="px-6 py-5 flex items-center justify-between shrink-0"
                        style={{ borderBottom: `1px solid ${T.border}` }}
                    >
                        <div>
                            <h3 className="text-base font-bold" style={{ color: T.textPrimary }}>
                                Add New User
                            </h3>
                            <p className="text-xs sm:text-sm" style={{ color: T.textMuted }}>
                                They'll receive an account and join your org chart immediately
                            </p>
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

                    {/* Scrollable Form */}
                    <form onSubmit={submit} className="p-6 flex flex-col gap-4 overflow-y-auto">
                        {error && (
                            <div
                                className="px-4 py-3 rounded-xl text-sm font-medium"
                                style={{ background: T.errorDim, color: T.error }}
                            >
                                {error}
                            </div>
                        )}

                        {/* Full Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>
                                Full Name *
                            </label>
                            <input
                                className="crm-input"
                                placeholder="Jane Doe"
                                value={form.name}
                                onChange={e => set('name', e.target.value)}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>
                                Email *
                            </label>
                            <input
                                className="crm-input"
                                type="email"
                                placeholder="jane@company.com"
                                value={form.email}
                                onChange={e => set('email', e.target.value)}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>
                                Password *
                            </label>
                            <input
                                className="crm-input"
                                type="password"
                                placeholder="Min 6 characters"
                                value={form.password}
                                onChange={e => set('password', e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        {/* Designation Combobox / Suggestions */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>
                                    Designation / Title
                                </label>
                                <span className="text-[10px]" style={{ color: T.textMuted }}>
                                    Preset or custom
                                </span>
                            </div>
                            <input
                                list="invite-designations-list"
                                className="crm-input"
                                placeholder="e.g. Sales Director, Account Executive..."
                                value={form.designation}
                                onChange={e => set('designation', e.target.value)}
                                maxLength={100}
                            />
                            <datalist id="invite-designations-list">
                                {designations.map(d => (
                                    <option key={d} value={d} />
                                ))}
                            </datalist>

                            {/* Popular Suggestions Quick Pills */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                {designations.slice(0, 4).map(d => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => set('designation', d)}
                                        className="text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer"
                                        style={{
                                            background: form.designation === d ? T.primaryDim : T.surfaceRaised,
                                            color: form.designation === d ? T.primary : T.textSecondary,
                                            border: `1px solid ${form.designation === d ? T.primary + '50' : T.borderSubtle}`,
                                        }}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reports To (Manager) Select */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>
                                Reports To (Manager)
                            </label>
                            <CustomSelect
                                className="crm-select"
                                value={form.managerId}
                                onChange={e => set('managerId', e.target.value)}
                                placeholder="None (Top-Level / Root Leader)"
                            >
                                <option value="">— None (Top-Level / Root Leader) —</option>
                                {managers.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} {u.designation ? `(${u.designation} · ${u.role})` : `(${u.role})`}
                                    </option>
                                ))}
                            </CustomSelect>
                            <span className="text-[11px]" style={{ color: T.textMuted }}>
                                {form.role === 'ADMIN' && !form.managerId
                                    ? 'Admins without an explicit manager will default to reporting to the Company Super Admin'
                                    : 'Defines the supervisor and branch location on the Org Chart'}
                            </span>
                        </div>

                        {/* Role selection if allowed */}
                        {canInviteAdmin && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>
                                    System Role
                                </label>
                                <CustomSelect
                                    className="crm-select"
                                    value={form.role}
                                    onChange={e => set('role', e.target.value)}
                                >
                                    <option value="AGENT">Agent</option>
                                    <option value="ADMIN">Admin</option>
                                </CustomSelect>
                            </div>
                        )}

                        {/* Actions */}
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
                                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                                )}
                                {loading ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
