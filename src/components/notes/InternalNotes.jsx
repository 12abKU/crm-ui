import { useEffect, useState, useRef } from 'react'
import { T } from '../../constants/theme'
import api from '../../api'

export default function InternalNotes({ dealId, contactId }) {
    const [notes, setNotes] = useState([])
    const [team, setTeam] = useState([])
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    
    // Autocomplete state
    const [showMentionDropdown, setShowMentionDropdown] = useState(false)
    const [mentionSearch, setMentionSearch] = useState('')
    const [mentionIndex, setMentionIndex] = useState(-1)
    const [cursorPosition, setCursorPosition] = useState(0)

    const textareaRef = useRef(null)
    const dropdownRef = useRef(null)

    // Load notes & team members
    const loadNotes = async () => {
        setLoading(true)
        try {
            const url = dealId ? `/api/notes/deal/${dealId}` : `/api/notes/contact/${contactId}`
            const r = await api.get(url)
            setNotes(r.data ?? [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const loadTeam = async () => {
        try {
            const r = await api.get('/api/user/team')
            setTeam(r.data ?? [])
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        loadNotes()
        loadTeam()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dealId, contactId])

    // Filter team list for mentions dropdown
    const filteredTeam = team.filter(user => 
        user.name.toLowerCase().includes(mentionSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(mentionSearch.toLowerCase())
    )

    // Parse input changes to trigger mention autocomplete
    const handleTextareaChange = (e) => {
        const text = e.target.value
        setContent(text)
        const selStart = e.target.selectionStart
        setCursorPosition(selStart)

        // Find last "@" symbol before cursor
        const textBeforeCursor = text.substring(0, selStart)
        const atIndex = textBeforeCursor.lastIndexOf('@')

        if (atIndex !== -1 && (atIndex === 0 || /\s/.test(textBeforeCursor.charAt(atIndex - 1)))) {
            const searchString = textBeforeCursor.substring(atIndex + 1)
            // No spaces allowed in mention search
            if (!/\s/.test(searchString)) {
                setShowMentionDropdown(true)
                setMentionSearch(searchString)
                setMentionIndex(0)
                return
            }
        }
        setShowMentionDropdown(false)
    }

    // Insert selected user handle
    const selectUser = (user) => {
        const textBeforeCursor = content.substring(0, cursorPosition)
        const atIndex = textBeforeCursor.lastIndexOf('@')
        if (atIndex === -1) return

        const prefix = content.substring(0, atIndex)
        const suffix = content.substring(cursorPosition)
        const insertText = `@${user.name} ` // Insert handle with space

        const newContent = prefix + insertText + suffix
        setContent(newContent)
        setShowMentionDropdown(false)
        
        // Focus textarea and set cursor
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus()
                const newPos = atIndex + insertText.length
                textareaRef.current.setSelectionRange(newPos, newPos)
            }
        }, 50)
    }

    // Keyboard navigation in dropdown
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
            if (filteredTeam[mentionIndex]) {
                selectUser(filteredTeam[mentionIndex])
            }
        } else if (e.key === 'Escape') {
            e.preventDefault()
            setShowMentionDropdown(false)
        }
    }

    // Outside click closes autocomplete
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
            loadNotes()
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    const handleClearAll = async () => {
        if (!window.confirm("Are you sure you want to clear all internal notes for this record?")) return
        try {
            const url = dealId ? `/api/notes/deal/${dealId}` : `/api/notes/contact/${contactId}`
            await api.delete(url)
            setNotes([])
        } catch (e) {
            console.error("Failed to clear notes:", e)
        }
    }

    // Helper to format timestamps
    const formatTime = (timeStr) => {
        if (!timeStr) return ''
        const date = new Date(timeStr)
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Highlight @mentions in note body text
    const renderNoteContent = (text) => {
        if (!text) return ''
        const words = text.split(/(\s+)/)
        return words.map((word, i) => {
            if (word.startsWith('@') && word.length > 1) {
                // Remove trailing punctuation for checks
                const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
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
            
            {/* Note Editor */}
            <form onSubmit={handleSubmit} className="p-5 border-b relative" style={{ borderColor: T.borderSubtle, background: T.surfaceRaised }}>
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

                    {/* Mentions Autocomplete Dropdown */}
                    {showMentionDropdown && filteredTeam.length > 0 && (
                        <div
                            ref={dropdownRef}
                            className="absolute z-100 max-h-48 overflow-y-auto w-64 rounded-xl shadow-2xl py-1.5 border"
                            style={{
                                top: '80%',
                                left: 10,
                                background: T.surface,
                                borderColor: T.border,
                            }}
                        >
                            {filteredTeam.map((user, idx) => {
                                const active = idx === mentionIndex
                                return (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => selectUser(user)}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs transition-colors"
                                        style={{
                                            background: active ? T.primaryFaint : 'transparent',
                                            color: T.textPrimary,
                                        }}
                                        onMouseEnter={() => setMentionIndex(idx)}
                                    >
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
                    {notes.length > 0 ? (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{
                                background: 'transparent',
                                border: `1.5px solid ${T.error}`,
                                color: T.error,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.errorDim }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                            Clear All
                        </button>
                    ) : <div />}
                    <button
                        type="submit"
                        disabled={submitting || !content.trim()}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                        style={{
                            background: T.primary,
                            color: '#fff',
                        }}
                        onMouseEnter={e => { if (!submitting && content.trim()) e.currentTarget.style.background = T.primaryHover }}
                        onMouseLeave={e => { if (!submitting && content.trim()) e.currentTarget.style.background = T.primary }}
                    >
                        {submitting ? 'Posting...' : 'Post Note'}
                    </button>
                </div>
            </form>

            {/* Note Stream */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                {loading && notes.length === 0 ? (
                    <div className="flex items-center justify-center py-10 gap-2">
                        <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: T.primary }} />
                        <span className="text-xs" style={{ color: T.textMuted }}>Loading notes...</span>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                        <span className="material-symbols-outlined text-[36px]" style={{ color: T.border }}>forum</span>
                        <p className="text-xs font-bold" style={{ color: T.textMuted }}>No notes yet</p>
                        <p className="text-[10px]" style={{ color: T.textMuted }}>Collaborate with your team by posting comments here.</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note.id}
                            className="p-4 rounded-2xl flex flex-col gap-2 transition-all"
                            style={{
                                background: T.surfaceRaised,
                                border: `1.5px solid ${T.borderSubtle}`,
                            }}
                        >
                            {/* Note Header */}
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

                            {/* Note Content */}
                            <div className="text-sm font-semibold leading-relaxed pl-10 whitespace-pre-wrap" style={{ color: T.textSecondary }}>
                                {renderNoteContent(note.content)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
