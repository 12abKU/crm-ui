import SettingsSection from './SettingsSection'
import ProfileForm from './ProfileForm'
import ChangePasswordForm from './ChangePasswordForm'
import { T } from '../../constants/theme'

export default function AgentSettings() {
    return (
        <div className="flex flex-col gap-6">
            <ProfileForm />
            <ChangePasswordForm />
            <SettingsSection title="My Permissions" description="What you can do in this CRM">
                <div className="flex flex-col gap-3">
                    {[
                        { icon: 'business', label: 'View & manage accounts', allowed: true },
                        { icon: 'groups', label: 'View & manage contacts', allowed: true },
                        { icon: 'handshake', label: 'View & manage deals', allowed: true },
                        { icon: 'event_note', label: 'Log activities', allowed: true },
                        { icon: 'person_add', label: 'Invite or manage users', allowed: false },
                        { icon: 'admin_panel_settings', label: 'Change user roles', allowed: false },
                    ].map(({ icon, label, allowed }) => (
                        <div key={label} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: allowed ? T.successDim : T.errorDim }}>
                                <span className="material-symbols-outlined text-[15px]"
                                    style={{ color: allowed ? T.success : T.error }}>{icon}</span>
                            </div>
                            <span className="text-sm" style={{ color: allowed ? T.textPrimary : T.textMuted }}>{label}</span>
                            <span className="material-symbols-outlined text-[16px] ml-auto"
                                style={{ color: allowed ? T.success : T.error }}>
                                {allowed ? 'check_circle' : 'cancel'}
                            </span>
                        </div>
                    ))}
                </div>
            </SettingsSection>
        </div>
    )
}