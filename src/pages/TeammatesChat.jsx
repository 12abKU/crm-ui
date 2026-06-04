import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { chatAPI } from '../api/chat';
import api from '../api';
import { T } from '../constants/theme';
import { extractApiErrorMessage } from '../api';
import DocumentPreviewModal from '../components/documents/DocumentPreviewModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import TopBar from '../components/TopBar';

const SingleTick = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DoubleTick = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M17 5L9.5 12.5L6 9" />
    <path d="M22 5L14.5 12.5L13 11" />
  </svg>
);

const SecureImage = ({ messageId, alt, className, style, onClick }) => {
  const [src, setSrc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    const loadImage = async () => {
      try {
        const response = await chatAPI.downloadAttachment(messageId);
        if (active) {
          const blob = new Blob([response.data], { type: response.headers['content-type'] });
          objectUrl = URL.createObjectURL(blob);
          setSrc(objectUrl);
        }
      } catch (err) {
        console.error('Failed to load secure image:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadImage();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [messageId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-800 text-white/50 text-[10px] w-64 h-40 rounded-lg select-none">
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <span>Loading image...</span>
        </div>
      </div>
    );
  }

  if (!src) {
    return (
      <div className="flex items-center justify-center bg-gray-800 text-red-400 text-[10px] w-64 h-40 rounded-lg gap-1.5 select-none">
        <span className="material-symbols-outlined text-[18px]">broken_image</span>
        <span>Failed to load image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onClick={onClick}
    />
  );
};

const DocumentCard = ({
  msg,
  isMe,
  selectionMode,
  toggleMessageSelection,
  handleAttachmentClick,
  handleAttachmentDownload,
  showTime,
  formatTime,
  isMeChecked,
}) => {
  const isPdf = msg.fileType?.includes('pdf');
  const isPpt = msg.fileType?.includes('presentation') || msg.fileType?.includes('powerpoint') || msg.fileName?.endsWith('.pptx') || msg.fileName?.endsWith('.ppt');
  const isWord = msg.fileType?.includes('word') || msg.fileName?.endsWith('.docx') || msg.fileName?.endsWith('.doc');
  const isExcel = msg.fileType?.includes('sheet') || msg.fileType?.includes('excel') || msg.fileName?.endsWith('.xlsx') || msg.fileName?.endsWith('.xls');

  const iconColor = isPdf ? '#EF4444' : isPpt ? '#F97316' : isWord ? '#3B82F6' : isExcel ? '#10B981' : '#94A3B8';
  const fileExtLabel = isPdf ? 'PDF' : isPpt ? 'PPTX' : isWord ? 'Word' : isExcel ? 'Excel' : 'File';
  const pageLabel = isPdf ? '26 pages • ' : ''; // Mock pages for display matching screenshot

  const iconName = isPdf ? 'picture_as_pdf' : isPpt ? 'slideshow' : isWord ? 'description' : isExcel ? 'table_chart' : 'insert_drive_file';

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden text-left cursor-pointer"
      onClick={(e) => {
        if (selectionMode) {
          toggleMessageSelection(msg.id);
        } else {
          handleAttachmentClick(msg);
        }
      }}
      style={{
        width: '280px',
        background: isMe ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.03)',
        border: isMe ? '1px solid rgba(255, 255, 255, 0.1)' : `1px solid ${T.border}`,
        boxShadow: '0 1px 0.5px rgba(0,0,0,0.1)',
      }}
    >
      {/* 1. Header Cover Image / Presentation Illustration */}
      <div className="h-24 w-full relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
        <div className="absolute inset-0 p-3 flex flex-col justify-between text-left select-none bg-black/20">
          <div className="text-[9px] font-black uppercase tracking-wider text-white/50">
            Inventive CRM
          </div>
          <div className="flex justify-between items-end w-full">
            <span className="text-xs font-bold text-white leading-tight truncate max-w-[180px]">
              {msg.fileName?.split('.')[0]}
            </span>
            <span className="material-symbols-outlined text-[28px] text-white/30 shrink-0">
              {iconName}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Metadata details row */}
      <div className="p-2.5 flex items-start gap-2 relative">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconColor + '20' }}>
          <span className="material-symbols-outlined text-[20px]" style={{ color: iconColor }}>
            {iconName}
          </span>
        </div>
        <div className="min-w-0 flex-1 pr-12">
          <p className="text-[11px] font-bold truncate leading-tight" style={{ color: isMe ? '#fff' : T.textPrimary }}>
            {msg.fileName}
          </p>
          <p className="text-[9px] mt-0.5" style={{ color: isMe ? 'rgba(255, 255, 255, 0.6)' : T.textMuted }}>
            {pageLabel}{fileExtLabel} • {formatFileSize(msg.fileSize)}
          </p>
        </div>
        
        {/* Absolute aligned timestamp inside document card when no message caption */}
        {showTime && (
          <div className="absolute bottom-1.5 right-2 flex items-center gap-1 select-none" style={{ color: isMe ? 'rgba(255, 255, 255, 0.6)' : T.textMuted }}>
            <span className="text-[9px] font-semibold">
              {formatTime(msg.createdAt)}
            </span>
            {isMeChecked && (
              <span className="flex items-center shrink-0">
                {msg.read ? (
                  <DoubleTick color="#10B981" />
                ) : msg.delivered ? (
                  <DoubleTick color={isMe ? 'rgba(255, 255, 255, 0.6)' : T.textMuted} />
                ) : (
                  <SingleTick color={isMe ? 'rgba(255, 255, 255, 0.6)' : T.textMuted} />
                )}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Actions Divider and buttons (only shown when NO message text is attached) */}
      {!msg.message && (
        <div
          className="flex text-[10px] font-black tracking-wide select-none"
          style={{
            borderTop: isMe ? '1px solid rgba(255, 255, 255, 0.1)' : `1px solid ${T.border}`
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (selectionMode) {
                toggleMessageSelection(msg.id);
              } else {
                handleAttachmentClick(msg);
              }
            }}
            className={`flex-1 py-2 text-center transition-colors ${
              isMe ? 'hover:bg-white/5' : 'hover:bg-black/5'
            }`}
            style={{
              color: isMe ? '#fff' : T.primary,
              borderRight: isMe ? '1px solid rgba(255, 255, 255, 0.1)' : `1px solid ${T.border}`,
              backgroundColor: 'transparent'
            }}
          >
            Open
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (selectionMode) {
                toggleMessageSelection(msg.id);
              } else {
                handleAttachmentDownload(msg);
              }
            }}
            className={`flex-1 py-2 text-center transition-colors ${
              isMe ? 'hover:bg-white/5' : 'hover:bg-black/5'
            }`}
            style={{
              color: isMe ? '#fff' : T.primary,
              backgroundColor: 'transparent'
            }}
          >
            Save as...
          </button>
        </div>
      )}
    </div>
  );
};

export default function TeammatesChat() {
  const { userId: rawUserId, email: currentUserEmail, role } = useSelector((state) => state.auth);
  const currentUserId = Number(rawUserId);
  const navigate = useNavigate();
  const location = useLocation();

  const [colleagues, setColleagues] = useState([]);
  const [activeColleague, setActiveColleague] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [search, setSearch] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());


  // Message Form States
  const [textInput, setTextInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [sending, setSending] = useState(false);

  // Preview States
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  // Delete States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [msgToDelete, setMsgToDelete] = useState(null);

  // Context Menu & Selection States
  const [contextMenu, setContextMenu] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [threeDotOpen, setThreeDotOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [adminBlockOpen, setAdminBlockOpen] = useState(false);

  // Dispatch unread counts to global window listeners for real-time sidebar badges
  useEffect(() => {
    const total = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
    window.dispatchEvent(new CustomEvent('crm-chat-unread-updated', { detail: total }));
  }, [unreadCounts]);

  // Fallback metadata states in case Redux auth lacks fields
  const [resolvedUserId, setResolvedUserId] = useState(currentUserId || null);
  const [resolvedUserEmail, setResolvedUserEmail] = useState(currentUserEmail || null);

  // Pagination & scrolling states
  const [chatPage, setChatPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const chatContainerRef = useRef(null);
  const scrollHeightBeforeRef = useRef(null);
  const isPrependingRef = useRef(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Fetch team members and unread counts on mount
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoadingTeam(true);
        let myId = resolvedUserId || currentUserId;
        let myEmail = resolvedUserEmail || currentUserEmail;

        // Fetch user profile fallback if rawUserId or rawUserEmail was missing from local session
        if (!myId || !myEmail) {
          try {
            const profileResponse = await api.get('/api/user/profile');
            if (profileResponse.data) {
              myId = Number(profileResponse.data.id);
              myEmail = profileResponse.data.email;
              setResolvedUserId(myId);
              setResolvedUserEmail(myEmail);
            }
          } catch (profileErr) {
            console.error('Failed to load fallback user profile:', profileErr);
          }
        }

        const teamResponse = await api.get('/api/user/team');
        // Filter out current user (by ID and email) from chat list
        const colleaguesList = (teamResponse.data || []).filter(
          (u) => Number(u.id) !== myId && u.email !== myEmail
        );
        setColleagues(colleaguesList);

        const unreadResponse = await chatAPI.getUnreadCounts();
        setUnreadCounts(unreadResponse.data || {});

        try {
          const onlineResponse = await api.get('/api/user/online');
          setOnlineUserIds(new Set((onlineResponse.data || []).map(Number)));
        } catch (onlineErr) {
          console.error('Failed to load online status:', onlineErr);
        }

      } catch (err) {
        console.error('Failed to load chat metadata:', err);
      } finally {
        setLoadingTeam(false);
      }
    };

    loadTeamData();
  }, [currentUserId, currentUserEmail]);

  // Listen to real-time online status changes from WebSocket
  useEffect(() => {
    const handleStatusChange = (e) => {
      const { userId, status } = e.detail;
      if (!userId) return;
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (status === 'online') {
          next.add(Number(userId));
        } else {
          next.delete(Number(userId));
        }
        return next;
      });
    };
    window.addEventListener('crm-user-status', handleStatusChange);
    return () => {
      window.removeEventListener('crm-user-status', handleStatusChange);
    };
  }, []);

  useEffect(() => {
    if (colleagues.length > 0) {
      const searchParams = new URLSearchParams(location.search);
      const queryColleagueId = searchParams.get('colleagueId');
      const targetId = queryColleagueId
        ? Number(queryColleagueId)
        : (location.state?.selectColleagueId ? Number(location.state.selectColleagueId) : null);

      if (targetId) {
        const match = colleagues.find((c) => Number(c.id) === targetId);
        if (match) {
          setActiveColleague(match);
          // Clear state and query parameters to avoid force-select on refresh
          navigate(location.pathname, { replace: true, state: {} });
        }
      }
    }
  }, [colleagues, location.state, location.search, navigate, location.pathname]);

  // Close context menu and dropdown on click outside
  useEffect(() => {
    const closeAll = () => {
      setContextMenu(null);
      setThreeDotOpen(false);
    };
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  // 2. Fetch history when active colleague changes
  useEffect(() => {
    if (!activeColleague) return;

    const loadHistory = async () => {
      try {
        setError(null);
        setSelectionMode(false);
        setSelectedMessageIds([]);
        setLoadingHistory(true);
        setChatPage(0);
        setHasMore(false);
        isPrependingRef.current = false;

        const res = await chatAPI.getHistory(activeColleague.id, 0, 20);
        const data = res.data || {};
        setMessages(data.content || []);
        setHasMore(data.hasMore || false);

        // Mark messages as read in DB and clear locally
        await chatAPI.markAsRead(activeColleague.id);
        setUnreadCounts((prev) => ({ ...prev, [activeColleague.id]: 0 }));
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setError('Failed to load chat history: ' + extractApiErrorMessage(err));
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [activeColleague]);

  // Load older messages on scroll-to-top
  const handleScroll = async () => {
    const container = chatContainerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && hasMore && !loadingMore && !loadingHistory) {
      try {
        setLoadingMore(true);
        isPrependingRef.current = true;
        scrollHeightBeforeRef.current = container.scrollHeight;

        const nextPage = chatPage + 1;
        const res = await chatAPI.getHistory(activeColleague.id, nextPage, 20);
        const data = res.data || {};
        const olderMsgs = data.content || [];

        setMessages((prev) => [...olderMsgs, ...prev]);
        setChatPage(nextPage);
        setHasMore(data.hasMore || false);
      } catch (err) {
        console.error('Failed to load older chat history:', err);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  // 3. Listen to real-time WebSocket events
  useEffect(() => {
    const handleIncomingMessage = (e) => {
      const msg = e.detail;
      if (!msg) return;

      if (msg.type === 'READ_RECEIPT') {
        const colleagueId = Number(msg.senderId);
        if (activeColleague && colleagueId === activeColleague.id) {
          setMessages((prev) =>
            prev.map((m) => {
              const isSentByMe = Number(m.senderId) === (resolvedUserId || currentUserId);
              const isToColleague = Number(m.recipientId) === colleagueId;
              if (isSentByMe && isToColleague) {
                return { ...m, read: true, delivered: true };
              }
              return m;
            })
          );
        }
        return;
      }

      if (msg.type === 'DELIVERY_RECEIPT') {
        const colleagueId = Number(msg.recipientId);
        if (activeColleague && colleagueId === activeColleague.id) {
          setMessages((prev) =>
            prev.map((m) => {
              const isSentByMe = Number(m.senderId) === (resolvedUserId || currentUserId);
              const isToColleague = Number(m.recipientId) === colleagueId;
              if (isSentByMe && isToColleague) {
                return { ...m, delivered: true };
              }
              return m;
            })
          );
        }
        return;
      }

      // Handle real-time deletion
      if (msg.deleted) {
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        return;
      }


      if (msg.sideDeleted) {
        if (Number(msg.deletedByUserId) === (resolvedUserId || currentUserId)) {
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        }
        return;
      }

      // Check if message belongs to the current user's company and involves active chats
      const msgSenderId = Number(msg.senderId);
      const msgRecipientId = Number(msg.recipientId);

      // If the message is from/to the active colleague, append it to messages
      if (activeColleague && (msgSenderId === activeColleague.id || msgRecipientId === activeColleague.id)) {
        setMessages((prev) => {
          // Avoid duplicate appends (WebSocket sends back to sender too)
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // Mark as read immediately since conversation is open
        if (msgSenderId === activeColleague.id) {
          chatAPI.markAsRead(activeColleague.id).catch(console.error);
        }
      } else {
        // Increment unread count for other colleague
        if (msgSenderId !== (resolvedUserId || currentUserId)) {
          setUnreadCounts((prev) => ({
            ...prev,
            [msgSenderId]: (prev[msgSenderId] || 0) + 1,
          }));
        }
      }
    };

    window.addEventListener('crm-chat', handleIncomingMessage);
    return () => {
      window.removeEventListener('crm-chat', handleIncomingMessage);
    };
  }, [activeColleague, currentUserId, resolvedUserId]);

  // 4. Keep messages scrolled to bottom or preserve scroll position on load more
  useEffect(() => {
    if (isPrependingRef.current) {
      const container = chatContainerRef.current;
      if (container && scrollHeightBeforeRef.current) {
        container.scrollTop = container.scrollHeight - scrollHeightBeforeRef.current;
      }
      isPrependingRef.current = false;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      const t = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [messages, loadingHistory]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!activeColleague) return;
    if (!textInput.trim() && !attachedFile) return;

    setSending(true);
    setError(null);
    const formData = new FormData();
    formData.append('recipientId', activeColleague.id);
    if (textInput.trim()) {
      formData.append('message', textInput.trim());
    }
    if (attachedFile) {
      formData.append('file', attachedFile);
    }

    try {
      await chatAPI.sendMessage(formData);
      setTextInput('');
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError('Failed to send message: ' + extractApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAttachmentClick = (msg) => {
    // Wrap msg parameters for preview modal compatibility
    setSelectedAttachment({
      id: msg.id,
      name: msg.fileName,
      fileType: msg.fileType,
      fileSize: msg.fileSize,
      uploaderName: msg.senderName,
    });
    setPreviewOpen(true);
  };

  const handleAttachmentDownload = async (msg) => {
    try {
      setError(null);
      const response = await chatAPI.downloadAttachment(msg.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', msg.fileName);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download: ' + extractApiErrorMessage(err));
    }
  };

  const handleDeleteClick = (msg) => {
    setError(null);
    setMsgToDelete(msg);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!msgToDelete) return;
    try {
      setError(null);
      await chatAPI.deleteMessage(msgToDelete.id);
      setMessages((prev) => prev.filter((m) => m.id !== msgToDelete.id));
    } catch (err) {
      setError('Failed to delete message: ' + extractApiErrorMessage(err));
    } finally {
      setDeleteModalOpen(false);
      setMsgToDelete(null);
    }
  };

  const handleConfirmClearChat = async () => {
    if (!activeColleague) return;
    try {
      setError(null);
      await chatAPI.clearChat(activeColleague.id);
      setMessages([]);
    } catch (err) {
      setError('Failed to clear chat: ' + extractApiErrorMessage(err));
    } finally {
      setClearConfirmOpen(false);
    }
  };

  const toggleMessageSelection = (id) => {
    if (!id) return;
    setSelectedMessageIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteClick = async () => {
    if (selectedMessageIds.length === 0) return;
    try {
      setError(null);
      await chatAPI.deleteMessagesBulk(selectedMessageIds);
      setMessages((prev) => prev.filter((m) => !selectedMessageIds.includes(m.id)));
    } catch (err) {
      setError('Failed to delete messages: ' + extractApiErrorMessage(err));
    } finally {
      setSelectionMode(false);
      setSelectedMessageIds([]);
    }
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message: msg,
    });
  };

  const handleProfileClick = () => {
    setThreeDotOpen(false);
    if (role === 'AGENT' && activeColleague?.role === 'ADMIN') {
      setAdminBlockOpen(true);
      return;
    }
    navigate(`/team/${activeColleague.id}`);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getFileIcon = (contentType) => {
    if (contentType?.includes('pdf')) return 'picture_as_pdf';
    if (contentType?.includes('word') || contentType?.includes('officedocument.word')) return 'description';
    if (contentType?.includes('excel') || contentType?.includes('sheet') || contentType?.includes('officedocument.spread')) return 'table_chart';
    if (contentType?.includes('image')) return 'image';
    if (contentType?.includes('zip') || contentType?.includes('compressed')) return 'archive';
    return 'insert_drive_file';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredColleagues = colleagues.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Panel (Teammates) */}
        <div
          className={`w-full md:w-80 flex flex-col shrink-0 border-r ${activeColleague ? 'hidden md:flex' : 'flex'}`}
          style={{ background: T.surface, borderColor: T.border }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b flex flex-col gap-3" style={{ borderColor: T.border }}>
            <div>
              <h2 className="text-base font-black tracking-tight" style={{ color: T.textPrimary }}>
                Teammates
              </h2>
              <p className="text-[10px]" style={{ color: T.textMuted }}>
                Chat with colleagues in your company
              </p>
            </div>
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs"
              style={{ background: T.borderSubtle, borderColor: T.border }}
            >
              <span className="material-symbols-outlined text-[16px] text-gray-400">search</span>
              <input
                type="text"
                placeholder="Search colleagues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none flex-1 font-semibold"
                style={{ color: T.textPrimary }}
              />
            </div>
          </div>

          {/* Teammates List */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
            {loadingTeam ? (
              <div className="text-center py-8 text-xs font-bold" style={{ color: T.textMuted }}>
                Loading teammates...
              </div>
            ) : filteredColleagues.length === 0 ? (
              <div className="text-center py-8 text-xs font-bold" style={{ color: T.textMuted }}>
                No colleagues found
              </div>
            ) : (
              filteredColleagues.map((colleague) => {
                const isActive = activeColleague?.id === colleague.id;
                const unreadCount = unreadCounts[colleague.id] || 0;
                const isOnline = onlineUserIds.has(Number(colleague.id));

                return (
                  <button
                    key={colleague.id}
                    onClick={() => setActiveColleague(colleague)}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all text-left w-full cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                    style={{
                      background: isActive ? T.primaryDim : 'transparent',
                    }}
                  >
                    {/* User Avatar Initials */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border relative"
                      style={{
                        background: isActive ? T.primary : T.borderSubtle,
                        color: isActive ? '#fff' : T.primary,
                        borderColor: isActive ? T.primary : T.border,
                      }}
                    >
                      {colleague.name.charAt(0).toUpperCase()}
                      {/* Active Status Dot */}
                      <span
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                        style={{
                          background: isOnline ? '#16A34A' : '#94A3B8', // online status
                          borderColor: T.surface,
                        }}
                      />
                    </div>


                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <p
                          className="text-xs font-bold truncate"
                          style={{ color: isActive ? T.primaryText : T.textPrimary }}
                        >
                          {colleague.name}
                        </p>
                        {unreadCount > 0 && (
                          <span
                            className="px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none text-white shrink-0"
                            style={{ background: T.error }}
                          >
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: T.textMuted }}>
                        {colleague.email}
                      </p>
                      <span
                        className="inline-block px-1.5 py-0.2 rounded text-[8px] font-black uppercase mt-1"
                        style={{
                          background: colleague.role === 'ADMIN' ? 'rgba(37,99,235,0.1)' : 'rgba(83,141,141,0.1)',
                          color: colleague.role === 'ADMIN' ? T.chartBlue : T.chartTeal,
                        }}
                      >
                        {colleague.role}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Chat History Panel */}
        <div
          className={`flex-1 flex flex-col overflow-hidden ${!activeColleague ? 'hidden md:flex' : 'flex'}`}
          style={{ background: T.borderSubtle }}
        >
          {activeColleague ? (
            <>
              {/* Header Details */}
              <div
                className="px-6 py-4 flex items-center justify-between border-b shrink-0"
                style={{ background: T.surface, borderColor: T.border }}
              >
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setActiveColleague(null)}
                    className="md:hidden p-1 mr-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 flex items-center justify-center transition-colors"
                    title="Back to teammates"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  </button>

                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs"
                    style={{ background: T.primaryDim, color: T.primary }}
                  >
                    {activeColleague.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-black" style={{ color: T.textPrimary }}>
                      {activeColleague.name}
                    </h3>
                    <p className="text-[10px] flex items-center gap-1.5" style={{ color: T.textMuted }}>
                      <span>{activeColleague.email}</span>
                      <span>•</span>
                      <span>{activeColleague.role}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: onlineUserIds.has(Number(activeColleague.id)) ? '#16A34A' : '#94A3B8' }} />
                        <span>{onlineUserIds.has(Number(activeColleague.id)) ? 'Online' : 'Offline'}</span>
                      </span>
                    </p>

                  </div>
                </div>

                {/* 3-Dot Options Button */}
                <div className="relative shrink-0 flex items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThreeDotOpen(!threeDotOpen);
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 cursor-pointer"
                    title="Menu Options"
                  >
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>

                  {/* Dropdown Menu */}
                  {threeDotOpen && (
                    <div
                      className="absolute right-0 top-9 w-40 rounded-xl shadow-lg border py-1.5 z-50 text-xs font-bold"
                      style={{
                        background: T.surface,
                        borderColor: T.border,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={handleProfileClick}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                        style={{ color: T.textPrimary }}
                      >
                        <span className="material-symbols-outlined text-[16px]">account_circle</span>
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setThreeDotOpen(false);
                          setClearConfirmOpen(true);
                        }}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-red-500 hover:text-red-600"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                        Clear Chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {/* Message Streams */}
              <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6 flex flex-col"
                style={{ background: T.borderSubtle }}
              >
                {loadingMore && (
                  <div className="flex justify-center py-2 shrink-0">
                    <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: T.primary, borderTopColor: 'transparent' }} />
                  </div>
                )}
                {loadingHistory ? (
                  <div className="flex-1 flex items-center justify-center text-xs font-bold" style={{ color: T.textMuted }}>
                    Loading message logs...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                    <span className="material-symbols-outlined text-[36px]" style={{ color: T.textMuted }}>
                      forum
                    </span>
                    <p className="text-xs font-bold" style={{ color: T.textPrimary }}>
                      Say hello to {activeColleague.name}!
                    </p>
                    <p className="text-[10px]" style={{ color: T.textMuted }}>
                      Send files, images, or updates instantly.
                    </p>
                  </div>
                ) : (
                  (() => {
                    const rendered = [];
                    let lastDateStr = null;
                    let lastSenderId = null;

                    messages.forEach((msg, index) => {
                      const isMe = Number(msg.senderId) === (resolvedUserId || currentUserId);
                      
                      let dateStr = '';
                      if (msg.createdAt) {
                        try {
                          const date = new Date(msg.createdAt);
                          const today = new Date();
                          const yesterday = new Date();
                          yesterday.setDate(today.getDate() - 1);

                          if (date.toDateString() === today.toDateString()) {
                            dateStr = 'Today';
                          } else if (date.toDateString() === yesterday.toDateString()) {
                            dateStr = 'Yesterday';
                          } else {
                            dateStr = date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                          }
                        } catch {
                          dateStr = '';
                        }
                      }

                      let showDateSeparator = false;
                      if (dateStr && dateStr !== lastDateStr) {
                        showDateSeparator = true;
                        rendered.push(
                          <div key={`date-${msg.id || index}`} className="flex justify-center my-3 shrink-0 select-none">
                            <span className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide"
                                  style={{ background: T.surface, color: T.textMuted, border: `1px solid ${T.border}`, boxShadow: '0 1px 0.5px rgba(0,0,0,0.05)' }}>
                              {dateStr}
                            </span>
                          </div>
                        );
                        lastDateStr = dateStr;
                      }

                      const isFirstInGroup = showDateSeparator || msg.senderId !== lastSenderId;
                      lastSenderId = msg.senderId;

                      const isImageFile = msg.fileType?.startsWith('image/') || msg.fileName?.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i);
                      const isImageOnly = msg.hasAttachment && isImageFile && !msg.message;
                      const hasImage = msg.hasAttachment && isImageFile;
                      const hasDoc = msg.hasAttachment && !hasImage;

                      rendered.push(
                        <div
                          key={msg.id || index}
                          className={`flex gap-3 max-w-[75%] group/msg relative items-end ${
                            isMe ? 'self-end' : 'self-start'
                          } ${isFirstInGroup ? 'mt-3' : 'mt-[2px]'}`}
                        >
                          {/* Multiselect Checkbox */}
                          {selectionMode && (
                            <div className="flex items-center justify-center px-1 shrink-0">
                              <input
                                type="checkbox"
                                checked={selectedMessageIds.includes(msg.id)}
                                onChange={() => toggleMessageSelection(msg.id)}
                                className="w-4 h-4 cursor-pointer rounded border-gray-300"
                                style={{ accentColor: T.primary }}
                              />
                            </div>
                          )}

                          {/* Speech Bubble */}
                          <div
                            onContextMenu={(e) => handleContextMenu(e, msg)}
                            onClick={(e) => {
                              if (selectionMode) {
                                e.preventDefault();
                                toggleMessageSelection(msg.id);
                              }
                            }}
                            className={`whatsapp-bubble cursor-pointer shadow-[0_1px_0.5px_rgba(0,0,0,0.05)] ${
                              isFirstInGroup ? (isMe ? 'whatsapp-bubble-sent-tail' : 'whatsapp-bubble-received-tail') : ''
                            }`}
                            style={{
                              background: isMe ? T.primary : T.surface,
                              color: isMe ? '#fff' : T.textPrimary,
                              border: isMe ? 'none' : `1px solid ${T.border}`,
                              borderRadius: isFirstInGroup
                                ? (isMe ? '8px 0px 8px 8px' : '0px 8px 8px 8px')
                                : '8px',
                              padding: (isImageOnly || hasImage || hasDoc) ? '3px' : '6px 8px 6px 8px',
                              minWidth: (isImageOnly || hasDoc) ? 'auto' : '80px',
                              '--bubble-bg': isMe ? T.primary : T.surface,
                            }}
                          >
                            {/* 1. Image Only Layout */}
                            {isImageOnly && (
                              <div
                                className="relative group cursor-pointer overflow-hidden rounded-lg"
                                onClick={(e) => {
                                  if (selectionMode) {
                                    e.stopPropagation();
                                    toggleMessageSelection(msg.id);
                                  } else {
                                    handleAttachmentClick(msg);
                                  }
                                }}
                              >
                                <SecureImage
                                  messageId={msg.id}
                                  alt={msg.fileName}
                                  className="max-h-64 max-w-sm w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="material-symbols-outlined text-white">visibility</span>
                                </div>
                                {/* Translucent Metadata Overlay */}
                                <div
                                  className="absolute bottom-2 right-2 flex items-center gap-1 select-none pointer-events-none px-2 py-0.5 rounded-full text-white"
                                  style={{
                                    background: 'rgba(0, 0, 0, 0.45)',
                                    backdropFilter: 'blur(2px)',
                                  }}
                                >
                                  <span className="text-[9px] font-semibold">
                                    {formatTime(msg.createdAt)}
                                  </span>
                                  {isMe && (
                                    <span className="flex items-center shrink-0">
                                      {msg.read ? (
                                        <DoubleTick color="#10B981" />
                                      ) : msg.delivered ? (
                                        <DoubleTick color="rgba(255,255,255,0.7)" />
                                      ) : (
                                        <SingleTick color="rgba(255,255,255,0.7)" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 2. Image + Text Layout */}
                            {!isImageOnly && hasImage && (
                              <div className="flex flex-col gap-1.5">
                                <div
                                  className="relative group cursor-pointer overflow-hidden rounded-lg"
                                  onClick={(e) => {
                                    if (selectionMode) {
                                      e.stopPropagation();
                                      toggleMessageSelection(msg.id);
                                    } else {
                                      handleAttachmentClick(msg);
                                    }
                                  }}
                                >
                                  <SecureImage
                                    messageId={msg.id}
                                    alt={msg.fileName}
                                    className="max-h-64 max-w-sm w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] rounded-lg"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="material-symbols-outlined text-white">visibility</span>
                                  </div>
                                </div>
                                
                                <div style={{ display: 'flow-root', padding: '6px 8px 2px 8px' }}>
                                  <span style={{ fontSize: '13.5px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: isMe ? '#fff' : T.textPrimary, lineHeight: '1.45' }}>
                                    {msg.message}
                                  </span>
                                  <span style={{
                                    float: 'right',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    marginLeft: '10px',
                                    marginTop: '6px',
                                    fontSize: '10px',
                                    color: isMe ? 'rgba(255, 255, 255, 0.7)' : T.textMuted,
                                    position: 'relative',
                                    bottom: '-2px',
                                    verticalAlign: 'bottom',
                                    userSelect: 'none'
                                  }}>
                                    <span>{formatTime(msg.createdAt)}</span>
                                    {isMe && (
                                      <span className="flex items-center shrink-0">
                                        {msg.read ? (
                                          <DoubleTick color="#10B981" />
                                        ) : msg.delivered ? (
                                          <DoubleTick color={isMe ? 'rgba(255, 255, 255, 0.7)' : T.textMuted} />
                                        ) : (
                                          <SingleTick color={isMe ? 'rgba(255, 255, 255, 0.7)' : T.textMuted} />
                                        )}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* 3. Document Layout */}
                            {hasDoc && (
                              <div className="flex flex-col gap-1.5">
                                <DocumentCard
                                  msg={msg}
                                  isMe={isMe}
                                  selectionMode={selectionMode}
                                  toggleMessageSelection={toggleMessageSelection}
                                  handleAttachmentClick={handleAttachmentClick}
                                  handleAttachmentDownload={handleAttachmentDownload}
                                  showTime={!msg.message}
                                  formatTime={formatTime}
                                  isMeChecked={isMe}
                                />

                                {msg.message && (
                                  <div style={{ display: 'flow-root', padding: '6px 8px 2px 8px' }}>
                                    <span style={{ fontSize: '13.5px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: isMe ? '#fff' : T.textPrimary, lineHeight: '1.45' }}>
                                      {msg.message}
                                    </span>
                                    <span style={{
                                      float: 'right',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                      marginLeft: '10px',
                                      marginTop: '6px',
                                      fontSize: '10px',
                                      color: isMe ? 'rgba(255, 255, 255, 0.7)' : T.textMuted,
                                      position: 'relative',
                                      bottom: '-2px',
                                      verticalAlign: 'bottom',
                                      userSelect: 'none'
                                    }}>
                                      <span>{formatTime(msg.createdAt)}</span>
                                      {isMe && (
                                        <span className="flex items-center shrink-0">
                                          {msg.read ? (
                                            <DoubleTick color="#10B981" />
                                          ) : msg.delivered ? (
                                            <DoubleTick color={isMe ? 'rgba(255, 255, 255, 0.7)' : T.textMuted} />
                                          ) : (
                                            <SingleTick color={isMe ? 'rgba(255, 255, 255, 0.7)' : T.textMuted} />
                                          )}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 4. Text Only Layout */}
                            {!msg.hasAttachment && (
                              <div style={{ display: 'flow-root', padding: '2px 4px' }}>
                                <span style={{ fontSize: '13.5px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: isMe ? '#fff' : T.textPrimary, lineHeight: '1.45' }}>
                                  {msg.message}
                                </span>
                                <span style={{
                                  float: 'right',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  marginLeft: '10px',
                                  marginTop: '6px',
                                  fontSize: '10px',
                                  color: isMe ? 'rgba(255, 255, 255, 0.7)' : T.textMuted,
                                  position: 'relative',
                                  bottom: '-2px',
                                  verticalAlign: 'bottom',
                                  userSelect: 'none'
                                }}>
                                  <span>{formatTime(msg.createdAt)}</span>
                                  {isMe && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                      {msg.read ? (
                                        <DoubleTick color="#10B981" />
                                      ) : msg.delivered ? (
                                        <DoubleTick color={isMe ? 'rgba(255, 255, 255, 0.7)' : T.textMuted} />
                                      ) : (
                                        <SingleTick color={isMe ? 'rgba(255, 255, 255, 0.7)' : T.textMuted} />
                                      )}
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                    return rendered;
                  })()
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Error Status Bar Banner */}
              {error && (
                <div
                  className="mx-6 my-2 p-3.5 rounded-xl text-xs font-bold flex items-center justify-between gap-3 border transition-all duration-300"
                  style={{
                    background: T.errorDim,
                    color: T.error,
                    borderColor: 'rgba(220,38,38,0.2)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                    <span className="leading-tight">{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="p-1 rounded-lg shrink-0 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    style={{ color: T.error }}
                    title="Dismiss"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              )}

              {/* Form Input Frame */}
              {selectionMode ? (
                <div
                  className="p-4 border-t flex items-center justify-between gap-4 shrink-0"
                  style={{ background: T.surface, borderColor: T.border }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: T.textMuted }}>
                      {selectedMessageIds.length} message{selectedMessageIds.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectionMode(false);
                        setSelectedMessageIds([]);
                      }}
                      className="px-4 py-2 rounded-xl border text-xs font-bold transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                      style={{ color: T.textPrimary, borderColor: T.border }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkDeleteClick}
                      disabled={selectedMessageIds.length === 0}
                      className="px-4 py-2 rounded-xl text-white text-xs font-bold bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="p-4 border-t flex flex-col gap-2.5 shrink-0"
                  style={{ background: T.surface, borderColor: T.border }}
                >
                  {/* Pending Attachment Chip */}
                  {attachedFile && (
                    <div
                      className="flex items-center gap-2 self-start px-3 py-1.5 rounded-full border text-[10px] font-bold"
                      style={{ background: T.primaryFaint, borderColor: T.primary }}
                    >
                      <span className="material-symbols-outlined text-[14px]" style={{ color: T.primary }}>
                        {getFileIcon(attachedFile.type)}
                      </span>
                      <span className="truncate max-w-[200px]" style={{ color: T.textPrimary }}>
                        {attachedFile.name}
                      </span>
                      <span className="text-gray-400">({formatFileSize(attachedFile.size)})</span>
                      <button onClick={removeAttachment} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 text-gray-500">
                        <span className="material-symbols-outlined text-[12px]">close</span>
                      </button>
                    </div>
                  )}

                  {/* Main Input Form */}
                  <form onSubmit={handleSend} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => !sending && fileInputRef.current?.click()}
                      disabled={sending}
                      className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 border text-gray-500 transition-colors shrink-0"
                      style={{ borderColor: T.border }}
                      title="Attach File/Image"
                    >
                      <span className="material-symbols-outlined text-[20px]">attach_file</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={`Message ${activeColleague.name}...`}
                      disabled={sending}
                      className="flex-1 px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{
                        background: T.borderSubtle,
                        borderColor: T.border,
                        color: T.textPrimary,
                        '--tw-ring-color': T.primary,
                      }}
                    />

                    <button
                      type="submit"
                      disabled={sending || (!textInput.trim() && !attachedFile)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 disabled:opacity-40 shrink-0"
                      style={{ background: T.primary, boxShadow: `0 2px 8px ${T.primary}20` }}
                    >
                      <span className="material-symbols-outlined text-[20px]">send</span>
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 gap-3">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                <span className="material-symbols-outlined text-[36px]" style={{ color: T.primary }}>
                  chat_bubble
                </span>
              </div>
              <div>
                <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>
                  Internal Teammate Chat
                </h3>
                <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                  Select a teammate from the panel to start chatting in real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attachment Preview Modal */}
      {selectedAttachment && (
        <DocumentPreviewModal
          open={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setSelectedAttachment(null);
          }}
          doc={selectedAttachment}
          isChatAttachment={true}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Message"
        message="Are you sure you want to delete this message? This will remove the message from your view. The other colleague will still be able to see it."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setMsgToDelete(null);
        }}
      />

      {/* Clear Chat Confirmation Modal */}
      <ConfirmModal
        isOpen={clearConfirmOpen}
        title="Clear Chat History"
        message="Are you sure you want to clear your chat history with this colleague? This will remove all messages from your side. The other colleague will still be able to see them."
        confirmText="Clear"
        onConfirm={handleConfirmClearChat}
        onCancel={() => setClearConfirmOpen(false)}
      />

      {/* Admin Block Alert Modal */}
      <ConfirmModal
        isOpen={adminBlockOpen}
        title="Access Denied"
        message="You can't see admin profile"
        confirmText="OK"
        confirmColor={T.primary}
        onConfirm={() => setAdminBlockOpen(false)}
      />

      {/* Custom Context Menu */}
      {contextMenu && (
        <div
          className="fixed rounded-xl border shadow-lg py-1.5 z-100 text-xs font-bold w-36"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            background: T.surface,
            borderColor: T.border,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              const msg = contextMenu.message;
              setContextMenu(null);
              setSelectionMode(true);
              setSelectedMessageIds([msg.id]);
            }}
            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            style={{ color: T.textPrimary }}
          >
            <span className="material-symbols-outlined text-[16px]">check_box</span>
            Select
          </button>
          <button
            type="button"
            onClick={() => {
              const msg = contextMenu.message;
              setContextMenu(null);
              setMsgToDelete(msg);
              setDeleteModalOpen(true);
            }}
            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-red-500 hover:text-red-600"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
