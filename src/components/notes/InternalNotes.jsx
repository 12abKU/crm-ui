import { useCallback, useEffect, useState, useRef } from 'react'
import { T } from '../../constants/theme'
import { usePermissions } from '../../hooks/usePermission'
import api from '../../api'

const NOTES_PAGE_SIZE = 20

// ── Clear All Confirmation Modal ───────────────────────────────
function ClearAllModal({ noteCount, onConfirm, onCancel, clearing }) {
    // Close on backdrop click
    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ background: 'rgba(10,14,26,0.55)', backdropFilter: 'blur(4px)' }}
                onClick={onCancel}
            >
                {/* Modal card */}
                <div
                    className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
                    style={{
                        background: T.surface,
                        border: `1.5px solid ${T.border}`,
                        boxShadow: '0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)',
                        animation: 'modalPop 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <style>{`
                        @keyframes modalPop {
                            from { opacity: 0; transform: scale(0.90) translateY(12px); }
                            to   { opacity: 1; transform: scale(1)   translateY(0); }
                        }
                    `}</style>

                    {/* Top accent bar */}
                    <div style={{ height: 4, background: `linear-gradient(90deg, ${T.error}, #f87171)` }} />

                    {/* Body */}
                    <div className="px-7 pt-7 pb-6 flex flex-col items-center text-center gap-4">

                        {/* Icon */}
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ background: T.errorDim, border: `1.5px solid ${T.error}30` }}>
                            <span className="material-symbols-outlined filled text-[28px]"
                                style={{ color: T.error }}>delete_sweep</span>
                        </div>

                        {/* Text */}
                        <div>
                            <h3 className="text-base font-black mb-1.5"
                                style={{ color: T.textPrimary, letterSpacing: '-0.01em' }}>
                                Clear all notes?
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: T.textMuted }}>
                                This will permanently delete{' '}
                                <span className="font-bold" style={{ color: T.textPrimary }}>
                                    {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                                </span>
                                {' '}from this record. This action cannot be undone.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 w-full pt-1">
                            <button
                                onClick={onCancel}
                                disabled={clearing}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                                style={{
                                    background: T.surfaceHigh,
                                    border: `1.5px solid ${T.border}`,
                                    color: T.textSecondary,
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = T.borderSubtle}
                                onMouseLeave={e => e.currentTarget.style.background = T.surfaceHigh}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={clearing}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                style={{
                                    background: T.error,
                                    color: '#fff',
                                    boxShadow: `0 4px 14px ${T.error}40`,
                                }}
                                onMouseEnter={e => { if (!clearing) e.currentTarget.style.background = '#b91c1c' }}
                                onMouseLeave={e => { if (!clearing) e.currentTarget.style.background = T.error }}
                            >
                                {clearing ? (
                                    <>
                                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                        Clearing...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[15px]">delete_forever</span>
                                        Yes, clear all
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default function InternalNotes({ dealId, contactId }) {
    const [notes, setNotes] = useState([])
    const [team, setTeam] = useState([])
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [showClearModal, setShowClearModal] = useState(false)  // ← new
    const [clearing, setClearing] = useState(false)              // ← new
    
    const can = usePermissions(['NOTES_CREATE', 'NOTES_DELETE'])

    // Autocomplete state
    const [showMentionDropdown, setShowMentionDropdown] = useState(false)
    const [mentionSearch, setMentionSearch] = useState('')
    const [mentionIndex, setMentionIndex] = useState(-1)
    const [cursorPosition, setCursorPosition] = useState(0)

    const textareaRef = useRef(null)
    const dropdownRef = useRef(null)

    const loadNotes = useCallback(async (pageNum = 0, append = false) => {
        if (append) setLoadingMore(true)
        else setLoading(true)
        try {
            const url = dealId ? `/api/notes/deal/${dealId}` : `/api/notes/contact/${contactId}`
            const r = await api.get(`${url}?page=${pageNum}&size=${NOTES_PAGE_SIZE}`)
            const payload = r.data ?? {}
            const content = Array.isArray(payload) ? payload : (payload.content ?? [])
            setNotes(prev => append ? [...prev, ...content] : content)
            setPage(payload.number ?? pageNum)
            setTotalPages(payload.totalPages ?? 0)
            setTotalElements(payload.totalElements ?? content.length)
        } catch (e) {
            console.error(e)
        } finally {
            if (append) setLoadingMore(false)
            else setLoading(false)
        }
    }, [dealId, contactId])

    const loadTeam = async () => {
        try {
            const r = await api.get('/api/user/team')
            setTeam(r.data ?? [])
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        loadNotes(0, false)
        loadTeam()
    }, [dealId, contactId, loadNotes])

    const filteredTeam = team.filter(user =>
        user.name.toLowerCase().includes(mentionSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(mentionSearch.toLowerCase())
    )

    const handleTextareaChange = (e) => {
        const text = e.target.value
        setContent(text)
        const selStart = e.target.selectionStart
        setCursorPosition(selStart)
        const textBeforeCursor = text.substring(0, selStart)
        const atIndex = textBeforeCursor.lastIndexOf('@')
        if (atIndex !== -1 && (atIndex === 0 || /\s/.test(textBeforeCursor.charAt(atIndex - 1)))) {
            const searchString = textBeforeCursor.substring(atIndex + 1)
            if (!/\s/.test(searchString)) {
                setShowMentionDropdown(true)
                setMentionSearch(searchString)
                setMentionIndex(0)
                return
            }
        }
        setShowMentionDropdown(false)
    }

    const selectUser = (user) => {
        const textBeforeCursor = content.substring(0, cursorPosition)
        const atIndex = textBeforeCursor.lastIndexOf('@')
        if (atIndex === -1) return
        const prefix = content.substring(0, atIndex)
        const suffix = content.substring(cursorPosition)
        const insertText = `@${user.name} `
        const newContent = prefix + insertText + suffix
        setContent(newContent)
        setShowMentionDropdown(false)
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus()
                const newPos = atIndex + insertText.length
                textareaRef.current.setSelectionRange(newPos, newPos)
            }
        }, 50)
    }

    const handleKeyDown = (e) => {
        if (!showMentionDropdown) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setMentionIndex(prev => Math.min(prev + 1, filteredTeam.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setMentionIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (filteredTeam[mentionIndex]) selectUser(filteredTeam[mentionIndex])
        } else if (e.key === 'Escape') {
            e.preventDefault()
            setShowMentionDropdown(false)
        }
    }

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowMentionDropdown(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content.trim()) return
        setSubmitting(true)
        try {
            await api.post('/api/notes', {
                content,
                dealId: dealId || null,
                contactId: contactId || null
            })
            setContent('')
            loadNotes(0, false)
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    // ── NEW: clean clear handler ───────────────────────────────
    const handleClearConfirmed = async () => {
        setClearing(true)
        try {
            const url = dealId ? `/api/notes/deal/${dealId}` : `/api/notes/contact/${contactId}`
            await api.delete(url)
            setNotes([])
            setPage(0)
            setTotalPages(0)
            setTotalElements(0)
            setShowClearModal(false)
        } catch (e) {
            console.error('Failed to clear notes:', e)
        } finally {
            setClearing(false)
        }
    }

    const formatTime = (timeStr) => {
        if (!timeStr) return ''
        const date = new Date(timeStr)
        return date.toLocaleString('en-IN', {
            day: 'numeric', month: 'short',
            hour: '2-digit', minute: '2-digit'
        })
    }

    const renderNoteContent = (text) => {
        if (!text) return ''
        const words = text.split(/(\s+)/)
        return words.map((word, i) => {
            if (word.startsWith('@') && word.length > 1) {
                const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
                const matchedUser = team.find(u =>
                    cleanWord.substring(1).toLowerCase() === u.name.toLowerCase() ||
                    cleanWord.substring(1).toLowerCase() === u.email.toLowerCase()
                )
                if (matchedUser) {
                    return (
                        <span key={i} className="px-1.5 py-0.5 rounded font-black text-xs inline-block"
                            style={{ background: 'rgba(147,51,234,0.14)', color: '#9333EA', border: '1px solid rgba(147,51,234,0.22)' }}>
                            {word}
                        </span>
                    )
                }
            }
            return word
        })
    }

    return (
        <div className="flex flex-col h-full bg-inherit">

            {/* ── Clear All Confirmation Modal ─────────────── */}
            {showClearModal && (
                <ClearAllModal
                    noteCount={totalElements || notes.length}
                    clearing={clearing}
                    onConfirm={handleClearConfirmed}
                    onCancel={() => !clearing && setShowClearModal(false)}
                />
            )}

            {/* Note Editor */}
            {can.NOTES_CREATE && (
                <form onSubmit={handleSubmit} className="p-5 border-b relative"
                    style={{ borderColor: T.borderSubtle, background: T.surfaceRaised }}>
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Write an internal note... (Use @ to mention teammates)"
                        className="w-full h-24 p-3.5 text-sm rounded-xl outline-none resize-none transition-all"
                        style={{
                            background: T.surface,
                            border: `1.5px solid ${T.border}`,
                            color: T.textPrimary,
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = T.primary}
                        onBlur={e => e.currentTarget.style.borderColor = T.border}
                    />

                    {showMentionDropdown && filteredTeam.length > 0 && (
                        <div ref={dropdownRef}
                            className="absolute z-100 max-h-48 overflow-y-auto w-64 rounded-xl shadow-2xl py-1.5 border"
                            style={{ top: '80%', left: 10, background: T.surface, borderColor: T.border }}>
                            {filteredTeam.map((user, idx) => {
                                const active = idx === mentionIndex
                                return (
                                    <button key={user.id} type="button" onClick={() => selectUser(user)}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs transition-colors"
                                        style={{ background: active ? T.primaryFaint : 'transparent', color: T.textPrimary }}
                                        onMouseEnter={() => setMentionIndex(idx)}>
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]"
                                            style={{ background: T.primaryDim, color: T.primaryText }}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-extrabold truncate">{user.name}</p>
                                            <p className="text-[10px] text-muted truncate">{user.email}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-3">
                    {notes.length > 0 && can.NOTES_DELETE ? (
                        <button
                            type="button"
                            onClick={() => setShowClearModal(true)}   // ← opens modal now
                            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{
                                background: 'transparent',
                                border: `1.5px solid ${T.error}`,
                                color: T.error,
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = T.errorDim}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            Clear All
                        </button>
                    ) : <div />}
                    <button
                        type="submit"
                        disabled={submitting || !content.trim()}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                        style={{ background: T.primary, color: '#fff' }}
                        onMouseEnter={e => { if (!submitting && content.trim()) e.currentTarget.style.background = T.primaryHover }}
                        onMouseLeave={e => { if (!submitting && content.trim()) e.currentTarget.style.background = T.primary }}
                    >
                        {submitting ? 'Posting...' : 'Post Note'}
                    </button>
                </div>
            </form>
            )}

            {/* Note Stream */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                {loading && notes.length === 0 ? (
                    <div className="flex items-center justify-center py-10 gap-2">
                        <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                            style={{ borderColor: T.primary }} />
                        <span className="text-xs" style={{ color: T.textMuted }}>Loading notes...</span>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                        <span className="material-symbols-outlined text-[36px]" style={{ color: T.border }}>forum</span>
                        <p className="text-xs font-bold" style={{ color: T.textMuted }}>No notes yet</p>
                        <p className="text-[10px]" style={{ color: T.textMuted }}>Collaborate with your team by posting comments here.</p>
                    </div>
                ) : (
                    <>
                        {notes.map((note) => (
                            <div key={note.id} className="p-4 rounded-2xl flex flex-col gap-2 transition-all"
                                style={{ background: T.surfaceRaised, border: `1.5px solid ${T.borderSubtle}` }}>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                                            style={{ background: T.primaryDim, color: T.primaryText }}>
                                            {note.createdBy?.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black" style={{ color: T.textPrimary }}>
                                                {note.createdBy?.name}
                                            </p>
                                            <p className="text-[9px] font-semibold mt-0.5" style={{ color: T.textMuted }}>
                                                {note.createdBy?.role}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[9.5px] font-semibold" style={{ color: T.textMuted }}>
                                        {formatTime(note.createdAt)}
                                    </span>
                                </div>
                                <div className="text-sm font-semibold leading-relaxed pl-1 sm:pl-10 whitespace-pre-wrap"
                                    style={{ color: T.textSecondary }}>
                                    {renderNoteContent(note.content)}
                                </div>
                            </div>
                        ))}
                        {page < totalPages - 1 && (
                            <button
                                type="button"
                                onClick={() => loadNotes(page + 1, true)}
                                disabled={loadingMore}
                                className="self-center px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                style={{ background: T.surfaceRaised, color: T.primary, border: `1px solid ${T.border}` }}
                            >
                                {loadingMore ? 'Loading...' : `Load more (${Math.max(totalElements - notes.length, 0)} left)`}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
