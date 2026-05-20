import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import SettingsSection from './SettingsSection'
import RoleBadge from './RoleBadge'
import api, { extractApiErrorMessage } from '../../api'
import { updateProfileSession } from '../../store/authSlice'

export default function ProfileForm() {
    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)

    const [name, setName] = useState(auth.name || '')
    const [email, setEmail] = useState(auth.email || '')
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(false)
    const role = auth.role || 'AGENT'

    const submit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setStatus(null)
        try {
            const res = await api.put('/api/user/profile/info', { name, email })
            dispatch(updateProfileSession({ name: res.data.name, email: res.data.email }))
            setStatus({ type: 'success', msg: 'Profile updated successfully' })
        } catch (err) {
            setStatus({ type: 'error', msg: extractApiErrorMessage(err, 'Update failed') })
        } finally {
            setLoading(false)
        }
    }

    return (
        <SettingsSection title="Profile Information" description="Update your name and email">
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
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: T.surfaceRaised }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg"
                        style={{ background: T.primaryDim, color: T.primary }}>
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-sm" style={{ color: T.textPrimary }}>{name}</p>
                        <RoleBadge role={role} />
                    </div>
                </div>
                {[
                    { label: 'Full Name', value: name, onChange: setName, type: 'text', placeholder: 'Your name' },
                    { label: 'Email Address', value: email, onChange: setEmail, type: 'email', placeholder: 'your@email.com' },
                ].map(({ label, value, onChange, type, placeholder }) => (
                    <div key={label} className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold uppercase tracking-wide" style={{ color: T.textMuted }}>{label}</label>
                        <input className="crm-input" type={type} placeholder={placeholder}
                            value={value} onChange={e => onChange(e.target.value)} />
                    </div>
                ))}
                <button type="submit" disabled={loading} className="crm-btn-primary w-fit flex items-center gap-2">
                    {loading ? (
                        <div className="w-4 h-4 rounded-full border-2 animate-spin"
                            style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
                    ) : <span className="material-symbols-outlined text-[16px]">save</span>}
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </SettingsSection>
    )
}