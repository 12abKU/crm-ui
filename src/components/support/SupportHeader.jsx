import { T } from '../../constants/theme'

export default function SupportHeader({ isAdmin, companyName, badge }) {
    return (
        <div className="relative rounded-3xl overflow-hidden mb-8"
            style={{
                background: `linear-gradient(135deg, ${T.heroBgFrom} 0%, ${T.heroBgMid} 50%, ${T.heroBgTo} 100%)`,
                minHeight: 200,
            }}>

            {/* Decorative orbs */}
            <div style={{
                position: 'absolute', top: -60, right: -60, width: 260, height: 260,
                borderRadius: '50%',
                background: `radial-gradient(circle,  0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: -40, left: 120, width: 180, height: 180,
                borderRadius: '50%',
                background: 'radial-gradient(circle, ${T.heroOrb2} 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', top: 20, left: '45%', width: 120, height: 120,
                borderRadius: '50%',
                background: `radial-gradient(circle,  0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            <div className="relative px-6 py-6 lg:px-10 lg:py-9 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Left: text */}
                <div className="flex items-center gap-5">
                    {/* Icon blob */}
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                            background: 'rgba(255,255,255,0.10)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            backdropFilter: 'blur(8px)',
                        }}>
                        <span className="material-symbols-outlined filled text-[32px]"
                            style={{ color: T.sidebarActiveText }}>contact_support</span>
                    </div>

                    <div>
                        <h1 className="text-3xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
                            Support Center
                        </h1>
                        <p className="text-sm mt-1" style={{ color: T.heroSubText }}>
                            {isAdmin
                                ? `Managing support for ${companyName || 'your company'}`
                                : 'Find answers, submit tickets, and get help fast'}
                        </p>
                    </div>
                </div>

                {/* Right: stat pills */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {badge.myOpenTickets > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                            style={{
                                background: 'rgba(220,38,38,0.18)',
                                border: '1px solid rgba(220,38,38,0.35)',
                            }}>
                            <span className="material-symbols-outlined filled text-[16px]"
                                style={{ color: T.errorLight }}>warning</span>
                            <span className="text-sm font-bold" style={{ color: T.errorLight }}>
                                {badge.myOpenTickets} open ticket{badge.myOpenTickets !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                    {isAdmin && badge.companyTotalTickets > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                            style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                            }}>
                            <span className="material-symbols-outlined filled text-[16px]"
                                style={{ color: T.sidebarActiveText }}>group</span>
                            <span className="text-sm font-bold" style={{ color: '#DBEAFE' }}>
                                {badge.companyTotalTickets} total
                            </span>
                        </div>
                    )}

                    {/* Quick-stat: response promise */}
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)',
                        }}>
                        <span className="material-symbols-outlined filled text-[16px]"
                            style={{ color: T.successLight }}>schedule</span>
                        <span className="text-sm font-bold" style={{ color: T.successLightBg }}>
                            24h response
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}