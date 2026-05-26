import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Contacts from './pages/Contacts'
import Deals from './pages/Deals'
import Activities from './pages/Activities'
import AccountProfile from './pages/AccountProfile'
import ContactProfile from './pages/ContactProfile'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Calendar from './pages/Calendar'
import Sidebar from './components/Sidebar'
import Register from './pages/Register'
import { T } from './constants/theme'
import Conversations from './pages/Conversations'
import Calls from './pages/Calls'
import ApiErrorToast from './components/ui/ApiErrorToast'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPermissions } from './store/authSlice'
import api from './api'
import PlatformDashboard from './pages/PlatformDashboard'
import ActivityProfile from './pages/ActivityProfile'
import AgentProfile from './pages/AgentProfile'
import PlatformProfile from './pages/PlatformProfile'
import PlatformTickets from './pages/PlatformTickets'
import Support from './pages/Support'
import AuditLogPage from './pages/AuditLogPage'
import DeDuplicationPage from './pages/DeDuplicationPage'
import { useWebSocket } from './hooks/useWebSocket'
import WebSocketToast from './components/ui/WebSocketToast'

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

const CrmLayout = ({ children }) => {
  const token = useSelector(state => state.auth.token)
  const role = useSelector(state => state.auth.role)
  if (!token) return <Navigate to="/login" />
  if (role === 'SUPER_ADMIN') return <Navigate to="/platform" />
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: T.bg }}>
      <Sidebar />
      <div className="pl-64 flex-1 flex flex-col min-h-0 overflow-auto">{children}</div>
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
      <div className="pl-64 flex-1 flex flex-col min-h-0 overflow-auto">{children}</div>
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
  return (
    <BrowserRouter>
      <ApiErrorToast />
      <WebSocketToast />
      <PermissionLoader />
      <WebSocketManager />
      <PushNotificationManager />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/platform" element={<PlatformLayout><PlatformDashboard /></PlatformLayout>} />
        <Route path="/platform/profile" element={<PlatformLayout><PlatformProfile /></PlatformLayout>} />
        <Route path="/platform/tickets" element={<PlatformLayout><PlatformTickets /></PlatformLayout>} />

        <Route path="/" element={<CrmLayout><Dashboard /></CrmLayout>} />
        <Route path="/accounts" element={<CrmLayout><Accounts /></CrmLayout>} />
        <Route path="/accounts/:id" element={<CrmLayout><AccountProfile /></CrmLayout>} />
        <Route path="/contacts" element={<CrmLayout><Contacts /></CrmLayout>} />
        <Route path="/contacts/:id" element={<CrmLayout><ContactProfile /></CrmLayout>} />
        <Route path="/deals" element={<CrmLayout><Deals /></CrmLayout>} />
        <Route path="/activities" element={<CrmLayout><Activities /></CrmLayout>} />
        <Route path="/activities/:id" element={<CrmLayout><ActivityProfile /></CrmLayout>} />
        <Route path="/calendar" element={<CrmLayout><Calendar /></CrmLayout>} />
        <Route path="/profile" element={<CrmLayout><Profile /></CrmLayout>} />
        <Route path="/settings" element={<CrmLayout><Settings /></CrmLayout>} />
        <Route path="/conversations" element={<CrmLayout><Conversations /></CrmLayout>} />
        <Route path="/calls" element={<CrmLayout><Calls /></CrmLayout>} />
        <Route path="/team/:id" element={<CrmLayout><AgentProfile /></CrmLayout>} />
        <Route path="/support" element={<CrmLayout><Support /></CrmLayout>} />
        <Route path="/audit-log" element={<CrmLayout><AuditLogPage /></CrmLayout>} />
        <Route path="/de-duplication" element={<CrmLayout><DeDuplicationPage /></CrmLayout>} />


        <Route path="*" element={<SmartRedirect />} />
      </Routes>
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