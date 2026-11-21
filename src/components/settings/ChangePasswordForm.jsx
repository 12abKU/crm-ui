import { useState } from 'react'
import { T } from '../../constants/theme'
import SettingsSection from './SettingsSection'
import api, { extractApiErrorMessage } from '../../api'

export default function ChangePasswordForm() {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
    const [status, setStatus] = useState(null) // { type: 'success'|'error', msg }
    const [loading, setLoading] = useState(false)
    const [showPasswords, setShowPasswords] = useState(false)

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        if (form.newPassword !== form.confirm) {
            setStatus({ type: 'error', msg: 'New passwords do not match' })
            return
        }
        if (form.newPassword.length < 6) {
            setStatus({ type: 'error', msg: 'Password must be at least 6 characters long' })
            return
        }
        setLoading(true)
        setStatus(null)
        try {
            const name = localStorage.getItem('name')
            const email = localStorage.getItem('email')
            await api.put('/api/user/profile', {
                name, email,
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            })
            setStatus({ type: 'success', msg: 'Password updated successfully' })
            setForm({ currentPassword: '', newPassword: '', confirm: '' })
        } catch (err) {
            setStatus({ type: 'error', msg: extractApiErrorMessage(err, 'Failed to update password') })
        } finally {
            setLoading(false)
        }
    }

    return (
        <SettingsSection
            title="Security & Authentication"
            description="Ensure your workspace account is using a secure, high-entropy password"
        >
            <form onSubmit={submit} className="flex flex-col gap-5 max-w-lg">
                {status && (
                    <div
                        className="px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border"
                        style={{
                            background: status.type === 'success' ? `${T.success}15` : `${T.error}15`,
                            color: status.type === 'success' ? T.success : T.error,
                            borderColor: status.type === 'success' ? `${T.success}30` : `${T.error}30`,
                        }}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {status.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <span>{status.msg}</span>
                    </div>
                )}

                {[
                    { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password', icon: 'key' },
                    { key: 'newPassword', label: 'New Password', placeholder: 'Min 6 characters', icon: 'lock' },
                    { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password', icon: 'lock_reset' },
                ].map(({ key, label, placeholder, icon }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                            {label}
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                                {icon}
                            </span>
                            <input
                                className="crm-input pl-10 pr-10"
                                type={showPasswords ? 'text' : 'password'}
                                placeholder={placeholder}
                                value={form[key]}
                                onChange={e => set(key, e.target.value)}
                                required
                            />
                        </div>
                    </div>
                ))}

                <div className="flex items-center justify-between gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={showPasswords}
                            onChange={e => setShowPasswords(e.target.checked)}
                            className="rounded border-slate-700 text-primary focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs text-slate-400 font-medium">Show passwords</span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="crm-btn-primary flex items-center gap-2 px-5 py-2.5"
                    >
                        {loading ? (
                            <div
                                className="w-4 h-4 rounded-full border-2 animate-spin"
                                style={{ borderColor: 'white', borderTopColor: 'transparent' }}
                            />
                        ) : (
                            <span className="material-symbols-outlined text-[17px]">shield</span>
                        )}
                        <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
                    </button>
                </div>
            </form>
        </SettingsSection>
    )
}
