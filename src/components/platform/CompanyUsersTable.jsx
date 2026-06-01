import { IconRefresh, IconPlus, IconCrown, IconLogin, IconKey, IconTrash } from '@tabler/icons-react'
import { T } from '../../constants/theme'
import { ROLE_STYLES } from './platformConstants'

export default function CompanyUsersTable({
    users, loading, updating, impersonating,
    onRefresh, onAddUser,
    onImpersonate, onResetPassword, onDeleteUser, onActivateUser, onChangeRole,
}) {
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            {/* Header */}
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ borderBottom: `1px solid ${T.border}` }}>
                <div>
                    <h2 className="text-sm font-bold" style={{ color: T.textPrimary }}>Users</h2>
                    <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>
                        {users.length} member{users.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onRefresh} className="p-2 rounded-xl" style={{ color: T.textMuted }}
                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <IconRefresh size={15} />
                    </button>
                    <button onClick={onAddUser}
                        className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl"
                        style={{ background: T.primary, color: '#fff' }}>
                        <IconPlus size={14} /> Add User
                    </button>
                </div>
            </div>

            {/* Body */}
            {loading ? (
                <div className="py-12 text-center text-sm" style={{ color: T.textMuted }}>Loading...</div>
            ) : users.length === 0 ? (
                <div className="py-12 text-center text-sm" style={{ color: T.textMuted }}>No users yet</div>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[650px]">
                    <thead>
                        <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                            {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                                <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest"
                                    style={{ color: T.textMuted }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, i) => {
                            const rs = ROLE_STYLES[u.role] || ROLE_STYLES.AGENT
                            return (
                                <tr key={u.id}
                                    style={{ background: i % 2 === 0 ? 'transparent' : T.surfaceRaised, borderBottom: `1px solid ${T.borderSubtle}` }}>
                                    {/* Name */}
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                                                style={{ background: T.primaryDim, color: T.primary }}>
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold" style={{ color: u.active ? T.textPrimary : T.textMuted }}>
                                                {u.name}
                                                {u.active === false && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded ml-1.5" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>INACTIVE</span>
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                    {/* Email */}
                                    <td className="px-5 py-3.5 text-xs" style={{ color: T.textMuted }}>{u.email}</td>
                                    {/* Role */}
                                    <td className="px-5 py-3.5">
                                        {u.role === 'SUPER_ADMIN' ? (
                                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full w-fit"
                                                style={{ background: T.superAdminDim, color: T.superAdminColor }}>
                                                <IconCrown size={10} /> SUPER_ADMIN
                                            </span>
                                        ) : (
                                            <select value={u.role} disabled={updating === 'role' + u.id}
                                                onChange={e => onChangeRole(u.id, e.target.value)}
                                                className="text-[11px] font-bold px-2 py-1 rounded-full border-0 cursor-pointer outline-none"
                                                style={{ background: rs.bg, color: rs.color }}>
                                                <option value="AGENT">AGENT</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        )}
                                    </td>
                                    {/* Joined */}
                                    <td className="px-5 py-3.5 text-xs" style={{ color: T.textMuted }}>
                                        {u.createdAt
                                            ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : '—'}
                                    </td>
                                    {/* Actions */}
                                    <td className="px-5 py-3.5">
                                        {u.role !== 'SUPER_ADMIN' && (
                                            <div className="flex items-center gap-1">
                                                <button title={`Login as ${u.name}`}
                                                    disabled={impersonating === u.id}
                                                    onClick={() => onImpersonate(u)}
                                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold"
                                                    style={{ background: T.primaryDim, color: T.primary, opacity: impersonating === u.id ? 0.5 : 1 }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = impersonating === u.id ? '0.5' : '1'}>
                                                    <IconLogin size={11} />
                                                    {impersonating === u.id ? '...' : 'Login as'}
                                                </button>
                                                <button title="Reset password"
                                                    onClick={() => onResetPassword(u)}
                                                    className="p-1.5 rounded-lg" style={{ color: T.textMuted }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.color = T.primary }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                                                    <IconKey size={14} />
                                                </button>
                                                {u.active ? (
                                                    <button title="Deactivate user"
                                                        disabled={updating === 'del' + u.id}
                                                        onClick={() => onDeleteUser(u.id)}
                                                        className="p-1.5 rounded-lg"
                                                        style={{ color: T.textMuted, opacity: updating === 'del' + u.id ? 0.4 : 1 }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = T.errorDim; e.currentTarget.style.color = T.error }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                                                        <IconTrash size={14} />
                                                    </button>
                                                ) : (
                                                    <button title="Activate user"
                                                        disabled={updating === 'del' + u.id}
                                                        onClick={() => onActivateUser(u.id)}
                                                        className="p-1.5 rounded-lg"
                                                        style={{ color: '#22c55e', opacity: updating === 'del' + u.id ? 0.4 : 1 }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.15)' }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                                                        <span className="material-symbols-outlined text-[15px] font-bold">check_circle</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    )
}