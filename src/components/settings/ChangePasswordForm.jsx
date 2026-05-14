import { useState } from 'react'
import { T } from '../../constants/theme'
import SettingsSection from './SettingsSection'
import api, { extractApiErrorMessage } from '../../api'

export default function ChangePasswordForm() {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
    const [status, setStatus] = useState(null) // { type: 'success'|'error', msg }
    const [loading, setLoading] = useState(false)

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        if (form.newPassword !== form.confirm) {
            setStatus({ type: 'error', msg: 'New passwords do not match' })
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
        <SettingsSection title="Change Password" description="Update your login password">
            <form onSubmit={submit} className="flex flex-col gap-4 max-w-md">
                {status && (
                    <div className="px-4 py-3 rounded-xl text-sm font-medium"
                        style={{
                            background: status.type === 'success' ? T.successDim : T.errorDim,
                            color: status.type === 'success' ? T.success : T.error
                        }}>
                        {status.msg}
                    </div>
                )}
                {[
                    { key: 'currentPassword', label: 'Current Password', placeholder: 'Your current password' },
                    { key: 'newPassword', label: 'New Password', placeholder: 'Min 6 characters' },
                    { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                ].map(({ key, label, placeholder }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>{label}</label>
                        <input className="crm-input" type="password" placeholder={placeholder}
                            value={form[key]} onChange={e => set(key, e.target.value)} required />
                    </div>
                ))}
                <button type="submit" disabled={loading} className="crm-btn-primary w-fit flex items-center gap-2">
                    {loading ? (
                        <div className="w-4 h-4 rounded-full border-2 animate-spin"
                            style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
                    ) : <span className="material-symbols-outlined text-[16px]">lock</span>}
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </SettingsSection>
    )
}
