import { T } from '../../constants/theme'
import { IconSearch, IconChevronDown, IconExternalLink, IconSearchOff } from '@tabler/icons-react'

export default function FaqTab({ faq, faqSearch, setFaqSearch, openFaq, setOpenFaq, onSubmitTicket }) {
    const filtered = faq.filter(f =>
        !faqSearch ||
        f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
        f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
        f.category.toLowerCase().includes(faqSearch.toLowerCase())
    )
    const groups = filtered.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
    }, {})

    return (
        <div>
            {/* Search */}
            <div className="relative mb-6 max-w-lg">
                <IconSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: T.textMuted }} />
                <input
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textPrimary }}
                    placeholder="Search FAQ…"
                    value={faqSearch}
                    onChange={e => setFaqSearch(e.target.value)}
                />
            </div>

            {Object.keys(groups).length === 0 ? (
                <div className="flex flex-col items-center py-24 gap-4 rounded-2xl"
                    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: T.surfaceHigh }}>
                        <IconSearchOff size={26} style={{ color: T.textMuted }} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold" style={{ color: T.textPrimary }}>No results for "{faqSearch}"</p>
                        <p className="text-xs mt-1" style={{ color: T.textMuted }}>Try a different search or submit a ticket</p>
                    </div>
                    <button onClick={() => onSubmitTicket(faqSearch)} className="crm-btn-primary text-sm mt-1">
                        Submit a ticket instead
                    </button>
                </div>
            ) : (
                Object.entries(groups).map(([category, items]) => (
                    <div key={category} className="mb-6">
                        <p className="text-[11px] font-black uppercase tracking-widest mb-3"
                            style={{ color: T.textMuted }}>{category}</p>
                        <div className="rounded-2xl overflow-hidden"
                            style={{ border: `1px solid ${T.border}`, background: T.surface }}>
                            {items.map((item, i) => {
                                const key = `${category}-${i}`
                                const isOpen = openFaq === key
                                return (
                                    <div key={i} style={{ borderBottom: i < items.length - 1 ? `1px solid ${T.borderSubtle}` : 'none' }}>
                                        <button
                                            onClick={() => setOpenFaq(isOpen ? null : key)}
                                            className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
                                            onMouseEnter={e => e.currentTarget.style.background = T.surfaceRaised}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <span className="text-sm font-semibold pr-4" style={{ color: T.textPrimary }}>{item.question}</span>
                                            <IconChevronDown size={17} style={{
                                                color: T.textMuted, flexShrink: 0,
                                                transform: isOpen ? 'rotate(180deg)' : 'none',
                                                transition: 'transform 0.2s',
                                            }} />
                                        </button>
                                        {isOpen && (
                                            <div className="px-6 pb-5 pt-0">
                                                <p className="text-sm leading-relaxed" style={{ color: T.textSecondary }}>{item.answer}</p>
                                                <button
                                                    onClick={() => onSubmitTicket(`Question: ${item.question}`)}
                                                    className="mt-3 text-xs font-bold flex items-center gap-1 hover:underline"
                                                    style={{ color: T.primary }}>
                                                    <IconExternalLink size={12} />
                                                    Still need help? Submit a ticket
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}