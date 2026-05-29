import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { T } from '../constants/theme'
import api from '../api'
import TopBar from '../components/TopBar'
import MergeCompareModal from '../components/ui/MergeCompareModal'

export default function DeDuplicationPage() {
    const navigate = useNavigate()
    const { role } = useSelector(state => state.auth)

    const [activeTab, setActiveTab] = useState('ACCOUNT') // 'ACCOUNT' or 'CONTACT'
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)

    // Redirect non-admins
    useEffect(() => {
        if (role === 'AGENT') navigate('/')
    }, [role, navigate])

    const scanDuplicates = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get(`/api/de-duplication/scan?type=${activeTab}`)
            setGroups(res.data || [])
        } catch (err) {
            // error is handled globally by api interceptor
            setGroups([])
        } finally {
            setLoading(false)
        }
    }, [activeTab])

    useEffect(() => {
        scanDuplicates()
    }, [scanDuplicates])

    const handleResolve = (group) => {
        setSelectedGroup(group)
        setModalOpen(true)
    }

    const handleMergeSuccess = () => {
        // Trigger alert or toast DOM event
        window.dispatchEvent(new CustomEvent('crm-notification', {
            detail: { title: 'Merge Complete', body: 'Duplicate records were successfully merged.' }
        }))
        scanDuplicates()
    }

    return (
        <div className="flex flex-col h-screen">
            <TopBar />
            <div className="flex-1 overflow-auto animate-fade-in" style={{ background: T.bg }}>
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: T.primaryDim }}>
                                    <span className="material-symbols-outlined filled text-[19px]"
                                        style={{ color: T.primary }}>merge</span>
                                </div>
                                <h1 className="text-2xl font-black" style={{ color: T.textPrimary }}>De-Duplication Dashboard</h1>
                            </div>
                            <p className="text-sm sm:ml-12" style={{ color: T.textMuted }}>
                                Scan and resolve duplicate records in your CRM to keep data clean.
                            </p>
                        </div>
                        
                        <button
                            onClick={scanDuplicates}
                            disabled={loading}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer w-full sm:w-auto"
                            style={{
                                background: T.surface,
                                border: `1px solid ${T.border}`,
                                color: T.textSecondary
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = T.primaryFaint}
                            onMouseLeave={e => e.currentTarget.style.background = T.surface}
                        >
                            <span className="material-symbols-outlined text-[16px] animate-spin-slow">refresh</span>
                            Rescan
                        </button>
                    </div>

                    {/* Tabs / Switcher */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-1.5 p-1 rounded-xl"
                            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                            <button
                                onClick={() => setActiveTab('ACCOUNT')}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                style={{
                                    background: activeTab === 'ACCOUNT' ? T.primary : 'transparent',
                                    color: activeTab === 'ACCOUNT' ? '#fff' : T.textMuted
                                }}
                            >
                                <span className="material-symbols-outlined filled mr-1 text-[13px] align-middle">business</span>
                                Accounts
                            </button>
                            <button
                                onClick={() => setActiveTab('CONTACT')}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                style={{
                                    background: activeTab === 'CONTACT' ? T.primary : 'transparent',
                                    color: activeTab === 'CONTACT' ? '#fff' : T.textMuted
                                }}
                            >
                                <span className="material-symbols-outlined filled mr-1 text-[13px] align-middle">person</span>
                                Contacts
                            </button>
                        </div>
                    </div>

                    {/* Loader */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse p-5 rounded-2xl border"
                                    style={{ background: T.surface, borderColor: T.border }}>
                                    <div className="h-4 rounded w-2/3 mb-3" style={{ background: T.surfaceHigh }} />
                                    <div className="h-3 rounded w-1/3 mb-6" style={{ background: T.borderSubtle }} />
                                    <div className="h-8 rounded w-full" style={{ background: T.surfaceHigh }} />
                                </div>
                            ))}
                        </div>
                    ) : groups.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl border"
                            style={{ background: T.surface, borderColor: T.border }}>
                            <span className="material-symbols-outlined text-[52px]"
                                style={{ color: T.success }}>check_circle</span>
                            <p className="text-sm font-black" style={{ color: T.textPrimary }}>
                                Your Database is Clean!
                            </p>
                            <p className="text-xs" style={{ color: T.textMuted }}>
                                No duplicate {activeTab === 'ACCOUNT' ? 'accounts' : 'contacts'} found under this criteria.
                            </p>
                        </div>
                    ) : (
                        /* Groups List */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groups.map((group, idx) => (
                                <div key={idx} className="p-5 rounded-2xl border flex flex-col justify-between"
                                    style={{ background: T.surface, borderColor: T.border, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                    
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                                                style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                                                Duplicate {group.field}
                                            </span>
                                            <span className="text-[10px] font-bold" style={{ color: T.textMuted }}>
                                                {group.records.length} matches
                                            </span>
                                        </div>

                                        <h3 className="text-sm font-black truncate mb-1" style={{ color: T.textPrimary }} title={group.key}>
                                            {group.key || '—'}
                                        </h3>

                                        {/* Preview list */}
                                        <div className="flex flex-col gap-1.5 my-4">
                                            {group.records.map(rec => (
                                                <div key={rec.id} className="flex items-center justify-between text-[11px]">
                                                    <span className="font-semibold truncate max-w-[160px]" style={{ color: T.textSecondary }}>
                                                        {rec.primaryText}
                                                    </span>
                                                    <span className="shrink-0" style={{ color: T.textMuted }}>
                                                        ID: {rec.id}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleResolve(group)}
                                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer"
                                        style={{
                                            background: T.primaryDim,
                                            color: T.primary,
                                            border: `1px solid ${T.primary}20`
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
                                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                                    >
                                        <span className="material-symbols-outlined text-[15px]">merge</span>
                                        Compare & Resolve
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Merge Modal */}
            {selectedGroup && (
                <MergeCompareModal
                    isOpen={modalOpen}
                    group={selectedGroup}
                    entityType={activeTab}
                    onClose={() => {
                        setModalOpen(false)
                        setSelectedGroup(null)
                    }}
                    onSuccess={handleMergeSuccess}
                />
            )}
        </div>
    )
}
