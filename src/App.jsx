import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { T, getThemeName } from './constants/theme'
import ApiErrorToast from './components/ui/ApiErrorToast'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPermissions, updateCompanyStatus } from './store/authSlice'
import api from './api'
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Accounts = lazy(() => import('./pages/Accounts'))
const Contacts = lazy(() => import('./pages/Contacts'))
const Deals = lazy(() => import('./pages/Deals'))
const Leads = lazy(() => import('./pages/Leads'))
const LeadProfile = lazy(() => import('./pages/LeadProfile'))
const Activities = lazy(() => import('./pages/Activities'))
const AccountProfile = lazy(() => import('./pages/AccountProfile'))
const ContactProfile = lazy(() => import('./pages/ContactProfile'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Calendar = lazy(() => import('./pages/Calendar'))
const Conversations = lazy(() => import('./pages/Conversations'))
const Calls = lazy(() => import('./pages/Calls'))
const PlatformDashboard = lazy(() => import('./pages/PlatformDashboard'))
const ActivityProfile = lazy(() => import('./pages/ActivityProfile'))
const AgentProfile = lazy(() => import('./pages/AgentProfile'))
const PlatformProfile = lazy(() => import('./pages/PlatformProfile'))
const PlatformTickets = lazy(() => import('./pages/PlatformTickets'))
const Support = lazy(() => import('./pages/Support'))
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'))
const DeDuplicationPage = lazy(() => import('./pages/DeDuplicationPage'))
const DocumentList = lazy(() => import('./pages/DocumentList'))
const TeammatesChat = lazy(() => import('./pages/TeammatesChat'))
import { useWebSocket } from './hooks/useWebSocket'
import WebSocketToast from './components/ui/WebSocketToast'
import ImportProgressToast from './components/ui/ImportProgressToast'
import TrialUpgradePopup from './components/ui/TrialUpgradePopup'


function WebSocketManager() {
  const token = useSelector(state => state.auth.token)
  useWebSocket(token)
  return null
}
import { registerServiceWorkerAndSubscribe } from './utils/pushNotifications'

function PushNotificationManager() {
  const token = useSelector(state => state.auth.token)
  useEffect(() => {
    if (token) {
      registerServiceWorkerAndSubscribe()
    }
  }, [token])
  return null
}

function DesktopNotificationManager() {
  const token = useSelector(state => state.auth.token)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const handleNotification = (event) => {
      const notif = event.detail
      if (!notif) return

      if (document.visibilityState === 'hidden' || !document.hasFocus()) {
        if ('Notification' in window && Notification.permission === 'granted') {
          const title = notif.title || 'CRM Notification'
          const options = {
            body: notif.body || '',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: notif.id ? `notif-${notif.id}` : undefined,
          }
          const notification = new Notification(title, options)

          notification.onclick = (e) => {
            e.preventDefault()
            window.focus()
            notification.close()

            if (notif.type === 'MENTION') {
              if (notif.dealId) {
                navigate(`/deals?dealId=${notif.dealId}&tab=notes`)
              } else if (notif.contactId) {
                navigate(`/contacts/${notif.contactId}?tab=notes`)
              } else if (notif.leadId) {
                navigate(`/leads?leadId=${notif.leadId}&tab=notes`)
              }
            } else if (notif.type === 'ACTIVITY_REMINDER' && notif.activityId) {
              navigate(`/activities?highlight=${notif.activityId}`)
            } else if (notif.type === 'CHAT_MESSAGE') {
              navigate('/chat', { state: { selectColleagueId: notif.contactId } })
            } else if (notif.ticketId) {
              navigate('/support', { state: { openTicketId: notif.ticketId } })
            } else {
              navigate('/')
            }
          }
        }
      }
    }

    window.addEventListener('crm-notification', handleNotification)
    return () => {
      window.removeEventListener('crm-notification', handleNotification)
    }
  }, [token, navigate])

  return null
}

function PermissionLoader() {
  const token = useSelector(state => state.auth.token)
  const dispatch = useDispatch()
  useEffect(() => {
    if (!token) return
    api.get('/api/permissions/me')
      .then(r => dispatch(setPermissions(r.data)))
      .catch(() => { })
  }, [token, dispatch])
  return null
}

function CompanyStatusLoader() {
  const token = useSelector(state => state.auth.token)
  const role = useSelector(state => state.auth.role)
  const { pathname } = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!token || role === 'SUPER_ADMIN') return
    api.get('/api/user/profile')
      .then(r => {
        if (r.data) {
          dispatch(updateCompanyStatus({
            companyStatus: r.data.companyStatus,
            trialEndsAt: r.data.trialEndsAt
          }))
        }
      })
      .catch(() => { })
  }, [token, role, dispatch])

  return null
}

import { setStages } from './store/pipelineSlice'

function PipelineStagesLoader() {
  const token = useSelector(state => state.auth.token)
  const dispatch = useDispatch()
  useEffect(() => {
    if (!token) return
    api.get('/api/pipelines')
      .then(r => {
        if (r.data && r.data.length > 0) {
          dispatch(setStages(r.data[0].stages))
        }
      })
      .catch(() => { })
  }, [token, dispatch])
  return null
}

const CrmLayout = ({ children }) => {
  const token = useSelector(state => state.auth.token)
  const role = useSelector(state => state.auth.role)
  if (!token) return <Navigate to="/login" />
  if (role === 'SUPER_ADMIN') return <Navigate to="/platform" />
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: T.bg }}>
      <Sidebar />
      <div className="pl-0 md:pl-64 flex-1 flex flex-col min-h-0 overflow-auto">
        {children}
        <TrialUpgradePopup />
      </div>
    </div>
  )
}

const PlatformLayout = ({ children }) => {
  const token = useSelector(state => state.auth.token)
  const role = useSelector(state => state.auth.role)
  if (!token) return <Navigate to="/login" />
  if (role !== 'SUPER_ADMIN') return <Navigate to="/" />
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: T.bg }}>
      <Sidebar />
      <div className="pl-0 md:pl-64 flex-1 flex flex-col min-h-0 overflow-auto">{children}</div>
    </div>
  )
}

// Forces remount when navigating between different /:id route types
// e.g. /activities/5 → /accounts/1 gets a different key so React fully remounts
function RouteKey({ prefix, children }) {
  const { pathname } = useLocation()
  const isMatch = pathname.startsWith(prefix)
  return <div key={isMatch ? pathname : undefined} style={{ display: 'contents' }}>{children}</div>
}

export default function App() {
  const [theme, setTheme] = useState(getThemeName())

  useEffect(() => {
    const handler = (e) => setTheme(e.detail)
    window.addEventListener('crm-theme-changed', handler)
    return () => window.removeEventListener('crm-theme-changed', handler)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--crm-bg', T.bg)
    root.style.setProperty('--crm-surface', T.surface)
    root.style.setProperty('--crm-border', T.border)
    root.style.setProperty('--crm-text', T.textPrimary)
    root.style.setProperty('--crm-text-muted', T.textMuted)
    root.style.setProperty('--crm-primary', T.primary)
  }, [theme])

  return (
    <BrowserRouter>
      <ApiErrorToast />
      <WebSocketToast />
      <ImportProgressToast />
      <PermissionLoader />
      <CompanyStatusLoader />
      <PipelineStagesLoader />
      <WebSocketManager />
      <PushNotificationManager />
      <DesktopNotificationManager />
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm font-bold" style={{ color: T.textMuted }}>Loading…</div>}>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/platform" element={<PlatformLayout><PlatformDashboard /></PlatformLayout>} />
        <Route path="/platform/profile" element={<PlatformLayout><PlatformProfile /></PlatformLayout>} />
        <Route path="/platform/tickets" element={<PlatformLayout><PlatformTickets /></PlatformLayout>} />

        <Route path="/" element={<CrmLayout><Dashboard /></CrmLayout>} />
        <Route path="/accounts" element={<CrmLayout><Accounts /></CrmLayout>} />
        <Route path="/accounts/:id" element={<CrmLayout><AccountProfile /></CrmLayout>} />
        <Route path="/contacts" element={<CrmLayout><Contacts /></CrmLayout>} />
        <Route path="/contacts/:id" element={<CrmLayout><ContactProfile /></CrmLayout>} />
        <Route path="/deals" element={<CrmLayout><Deals /></CrmLayout>} />
        <Route path="/leads" element={<CrmLayout><Leads /></CrmLayout>} />
        <Route path="/leads/:id" element={<CrmLayout><LeadProfile /></CrmLayout>} />
        <Route path="/activities" element={<CrmLayout><Activities /></CrmLayout>} />
        <Route path="/activities/:id" element={<CrmLayout><ActivityProfile /></CrmLayout>} />
        <Route path="/calendar" element={<CrmLayout><Calendar /></CrmLayout>} />
        <Route path="/profile" element={<CrmLayout><Profile /></CrmLayout>} />
        <Route path="/settings" element={<CrmLayout><Settings /></CrmLayout>} />
        <Route path="/conversations" element={<CrmLayout><Conversations /></CrmLayout>} />
        <Route path="/chat" element={<CrmLayout><TeammatesChat /></CrmLayout>} />
        <Route path="/calls" element={<CrmLayout><Calls /></CrmLayout>} />
        <Route path="/team/:id" element={<CrmLayout><AgentProfile /></CrmLayout>} />
        <Route path="/support" element={<CrmLayout><Support /></CrmLayout>} />
        <Route path="/audit-log" element={<CrmLayout><AuditLogPage /></CrmLayout>} />
        <Route path="/de-duplication" element={<CrmLayout><DeDuplicationPage /></CrmLayout>} />
        <Route path="/documents" element={<CrmLayout><DocumentList /></CrmLayout>} />


        <Route path="*" element={<SmartRedirect />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function SmartRedirect() {
  const role = useSelector(state => state.auth.role)
  const token = useSelector(state => state.auth.token)
  if (!token) return <Navigate to="/login" />
  if (role === 'SUPER_ADMIN') return <Navigate to="/platform" />
  return <Navigate to="/" />
}