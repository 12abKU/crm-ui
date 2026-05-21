import { useState } from 'react'
import { T } from '../../constants/theme'
import { IconSearch, IconChevronDown, IconExternalLink, IconSearchOff, IconSparkles } from '@tabler/icons-react'

const CATEGORY_ICONS = {
    'Billing': 'payments',
    'Technical': 'build',
    'Account': 'manage_accounts',
    'General': 'help_outline',
    'Features': 'lightbulb',
}

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

    const totalCount = faq.length

    return (
        <div>
            {/* Hero search bar */}
            <div className="relative mb-8 max-w-2xl">
                <div className="relative">
                    <IconSearch size={18} className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: T.textMuted }} />
                    <input
                        className="w-full pl-12 pr-5 py-4 rounded-2xl text-sm outline-none transition-all duration-200"
                        style={{
                            background: T.surface,
                            border: `1.5px solid ${T.border}`,
                            color: T.textPrimary,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            fontSize: '14px',
                        }}
                        placeholder={`Search ${totalCount} frequently asked questions…`}
                        value={faqSearch}
                        onChange={e => setFaqSearch(e.target.value)}
                        onFocus={e => {
                            e.currentTarget.style.borderColor = T.primary
                            e.currentTarget.style.boxShadow = `0 0 0 3px ${T.primaryDim}, 0 2px 8px rgba(0,0,0,0.04)`
                        }}
                        onBlur={e => {
                            e.currentTarget.style.borderColor = T.border
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                        }}
                    />
                    {faqSearch && (
                        <button
                            onClick={() => setFaqSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                            style={{ background: T.surfaceHigh, color: T.textMuted }}>
                            <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                    )}
                </div>
                {faqSearch && (
                    <p className="text-xs mt-2 ml-1" style={{ color: T.textMuted }}>
                        {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{faqSearch}"
                    </p>
                )}
            </div>

            {Object.keys(groups).length === 0 ? (
                <div className="flex flex-col items-center py-24 gap-5 rounded-3xl"
                    style={{
                        background: T.surface,
                        border: `1.5px dashed ${T.border}`,
                    }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: T.surfaceHigh }}>
                        <IconSearchOff size={28} style={{ color: T.textMuted }} />
                    </div>
                    <div className="text-center">
                        <p className="text-base font-bold" style={{ color: T.textPrimary }}>No results found</p>
                        <p className="text-sm mt-1" style={{ color: T.textMuted }}>
                            Try different keywords or submit a support ticket
                        </p>
                    </div>
                    <button onClick={() => onSubmitTicket(faqSearch)} className="crm-btn-primary flex items-center gap-2 mt-1">
                        <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                        Submit a Ticket
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {Object.entries(groups).map(([category, items]) => (
                        <div key={category}>
                            {/* Category header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: T.primaryDim }}>
                                    <span className="material-symbols-outlined filled text-[16px]"
                                        style={{ color: T.primary }}>
                                        {CATEGORY_ICONS[category] || 'help_outline'}
                                    </span>
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest"
                                    style={{ color: T.primary }}>{category}</p>
                                <div className="flex-1 h-px" style={{ background: T.border }} />
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: T.primaryFaint, color: T.primaryText }}>
                                    {items.length}
                                </span>
                            </div>

                            {/* Accordion */}
                            <div className="rounded-2xl overflow-hidden"
                                style={{
                                    border: `1px solid ${T.border}`,
                                    background: T.surface,
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                                }}>
                                {items.map((item, i) => {
                                    const key = `${category}-${i}`
                                    const isOpen = openFaq === key
                                    return (
                                        <div key={i}
                                            style={{
                                                borderBottom: i < items.length - 1 ? `1px solid ${T.borderSubtle}` : 'none',
                                            }}>
                                            <button
                                                onClick={() => setOpenFaq(isOpen ? null : key)}
                                                className="w-full flex items-center justify-between px-6 py-4 text-left transition-all duration-150"
                                                style={{
                                                    background: isOpen ? T.primaryFaint : 'transparent',
                                                }}
                                                onMouseEnter={e => {
                                                    if (!isOpen) e.currentTarget.style.background = T.borderSubtle
                                                }}
                                                onMouseLeave={e => {
                                                    if (!isOpen) e.currentTarget.style.background = 'transparent'
                                                }}>
                                                <div className="flex items-center gap-3 pr-4">
                                                    {isOpen && (
                                                        <span className="w-1.5 h-1.5 rounded-full shrink-0"
                                                            style={{ background: T.primary }} />
                                                    )}
                                                    <span className="text-sm font-semibold"
                                                        style={{ color: isOpen ? T.primaryText : T.textPrimary }}>
                                                        {item.question}
                                                    </span>
                                                </div>
                                                <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                                                    style={{
                                                        background: isOpen ? T.primaryDim : T.surfaceHigh,
                                                        transform: isOpen ? 'rotate(180deg)' : 'none',
                                                    }}>
                                                    <IconChevronDown size={14}
                                                        style={{ color: isOpen ? T.primary : T.textMuted }} />
                                                </div>
                                            </button>

                                            {isOpen && (
                                                <div className="px-6 pb-5 pt-0"
                                                    style={{ borderTop: `1px solid ${T.primaryDim}` }}>
                                                    <p className="text-sm leading-relaxed mt-3"
                                                        style={{ color: T.textSecondary }}>{item.answer}</p>
                                                    <button
                                                        onClick={() => onSubmitTicket(`Question: ${item.question}`)}
                                                        className="mt-4 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
                                                        style={{
                                                            color: T.primary,
                                                            background: T.primaryFaint,
                                                            border: `1px solid ${T.primaryDim}`,
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = T.primaryDim}
                                                        onMouseLeave={e => e.currentTarget.style.background = T.primaryFaint}>
                                                        <IconExternalLink size={11} />
                                                        Still need help? Submit a ticket
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Bottom CTA */}
                    <div className="flex items-center gap-4 px-6 py-5 rounded-2xl"
                        style={{
                            background: T.primaryFaint,
                            border: `1px solid ${T.primaryDim}`,
                        }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: T.primaryDim }}>
                            <IconSparkles size={18} style={{ color: T.primary }} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold" style={{ color: T.textPrimary }}>
                                Couldn't find what you were looking for?
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
                                Our support team is happy to help you directly.
                            </p>
                        </div>
                        <button onClick={() => onSubmitTicket('')} className="crm-btn-primary shrink-0 flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                            Open a Ticket
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}