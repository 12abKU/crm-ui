import { T } from '../../constants/theme'
import RoleBadge from './RoleBadge'
import PermissionEditor from './PermissionEditor'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export default function UserTable({ users, loading, currentUserId, canPromote, canDemote, canDelete, onPromote, onDemote, onDelete }) {

    const [editingUser, setEditingUser] = useState(null)
    const currentUserRole = useSelector(state => state.auth.role)
    const isAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN'
    const navigate = useNavigate()


    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 animate-spin"
                    style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                <span className="text-sm" style={{ color: T.textMuted }}>Loading users...</span>
            </div>
        )
    }

    if (!users.length) {
        return (
            <div className="p-12 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[36px]" style={{ color: T.border }}>group_off</span>
                <p className="text-sm" style={{ color: T.textMuted }}>No users found</p>
            </div>
        )
    }

    return (
        <>
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[600px]">
                    <thead>
                        <tr style={{ background: T.surfaceRaised, borderBottom: `1px solid ${T.border}` }}>
                            {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                                <th key={h} className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest"
                                    style={{ color: T.textMuted }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, i) => {
                            const isSelf = u.id === currentUserId
                            const isSuperAdmin = u.role === 'SUPER_ADMIN'
                            return (
                                <tr key={u.id} className="group"
                                    style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: i % 2 === 0 ? T.surface : T.surfaceRaised }}
                                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceHigh}
                                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.surface : T.surfaceRaised}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95"
                                                onClick={() => navigate(`/team/${u.id}`)}
                                                style={{ background: T.primaryDim, color: T.primary }}
                                                title={`View ${u.name}'s Profile`}>
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => navigate(`/team/${u.id}`)}
                                                    style={{ color: T.textPrimary }}
                                                    title={`View ${u.name}'s Profile`}>{u.name}</p>
                                                {isSelf && <p className="text-[10px] font-bold" style={{ color: T.primary }}>You</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm" style={{ color: T.textSecondary }}>{u.email}</td>
                                    <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                                    <td className="px-6 py-4 text-sm" style={{ color: T.textMuted }}>
                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'No value'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Profile Link Button */}
                                            <button onClick={() => navigate(`/team/${u.id}`)}
                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200"
                                                style={{ background: T.primaryDim, color: T.primary, border: `1.5px solid ${T.primary}20` }}
                                                onMouseEnter={e => { e.currentTarget.style.background = `${T.primary}28`; e.currentTarget.style.boxShadow = `0 2px 8px ${T.primary}15` }}
                                                onMouseLeave={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.boxShadow = 'none' }}>
                                                <span className="material-symbols-outlined text-[13px]">person</span>
                                                Profile
                                            </button>

                                            {isAdmin && (
                                                <button onClick={() => setEditingUser(u)}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200"
                                                    style={{ background: T.primaryDim, color: T.primary, border: `1px solid ${T.primary}20` }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = `${T.primary}28`; e.currentTarget.style.boxShadow = `0 2px 8px ${T.primary}15` }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = T.primaryDim; e.currentTarget.style.boxShadow = 'none' }}>
                                                    <span className="material-symbols-outlined text-[13px]">shield</span>
                                                    Permissions
                                                </button>
                                            )}

                                            {!isSuperAdmin && !isSelf && (
                                                <>
                                                    {canPromote && u.role === 'AGENT' && (
                                                        <button onClick={() => onPromote(u.id)}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                                                            style={{ background: T.primaryDim, color: T.primary }}
                                                            onMouseEnter={e => e.currentTarget.style.background = T.primary + '33'}
                                                            onMouseLeave={e => e.currentTarget.style.background = T.primaryDim}>
                                                            <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
                                                            Make Admin
                                                        </button>
                                                    )}
                                                    {canDemote && u.role === 'ADMIN' && (
                                                        <button onClick={() => onDemote(u.id)}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                                                            style={{ background: T.warningDim, color: T.warning }}
                                                            onMouseEnter={e => e.currentTarget.style.background = T.warning + '22'}
                                                            onMouseLeave={e => e.currentTarget.style.background = T.warningDim}>
                                                            <span className="material-symbols-outlined text-[13px]">arrow_downward</span>
                                                            Make Agent
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button onClick={() => onDelete(u.id)}
                                                            className="p-1.5 rounded-lg transition-colors ml-auto"
                                                            style={{ color: T.textMuted }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = T.errorDim; e.currentTarget.style.color = T.error }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textMuted }}>
                                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {editingUser && (
                <PermissionEditor
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSaved={() => setEditingUser(null)}
                />
            )}
        </>
    )
}