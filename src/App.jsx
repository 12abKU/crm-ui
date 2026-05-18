import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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


// Layout for regular company users (ADMIN / AGENT)
const CrmLayout = ({ children }) => {
  const token = useSelector(state => state.auth.token)
  const role = useSelector(state => state.auth.role)
  if (!token) return <Navigate to="/login" />
  // SUPER_ADMIN should never access CRM routes — redirect to platform
  if (role === 'SUPER_ADMIN') return <Navigate to="/platform" />
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: T.bg }}>
      <Sidebar />
      <div className="pl-64 flex-1 flex flex-col min-h-0 overflow-auto">{children}</div>
    </div>
  )
}

// Layout for SUPER_ADMIN platform routes
const PlatformLayout = ({ children }) => {
  const token = useSelector(state => state.auth.token)
  const role = useSelector(state => state.auth.role)
  if (!token) return <Navigate to="/login" />
  // Regular users should never access platform routes
  if (role !== 'SUPER_ADMIN') return <Navigate to="/" />
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: T.bg }}>
      <Sidebar />
      <div className="pl-64 flex-1 flex flex-col min-h-0 overflow-auto">{children}</div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ApiErrorToast />
      <PermissionLoader />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* SUPER_ADMIN only — platform management */}
        <Route path="/platform" element={<PlatformLayout><PlatformDashboard /></PlatformLayout>} />

        {/* CRM routes — ADMIN and AGENT only, SUPER_ADMIN gets redirected away */}
        <Route path="/" element={<CrmLayout><Dashboard /></CrmLayout>} />
        <Route path="/accounts" element={<CrmLayout><Accounts /></CrmLayout>} />
        <Route path="/accounts/:id" element={<CrmLayout><AccountProfile /></CrmLayout>} />
        <Route path="/contacts" element={<CrmLayout><Contacts /></CrmLayout>} />
        <Route path="/contacts/:id" element={<CrmLayout><ContactProfile /></CrmLayout>} />
        <Route path="/deals" element={<CrmLayout><Deals /></CrmLayout>} />
        <Route path="/activities" element={<CrmLayout><Activities /></CrmLayout>} />
        <Route path="/profile" element={<CrmLayout><Profile /></CrmLayout>} />
        <Route path="/settings" element={<CrmLayout><Settings /></CrmLayout>} />
        <Route path="/conversations" element={<CrmLayout><Conversations /></CrmLayout>} />
        <Route path="/calls" element={<CrmLayout><Calls /></CrmLayout>} />

        {/* Fallback — SUPER_ADMIN lands on /platform, others on / */}
        <Route path="*" element={<SmartRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}

// Redirects to the right home based on role
function SmartRedirect() {
  const role = useSelector(state => state.auth.role)
  const token = useSelector(state => state.auth.token)
  if (!token) return <Navigate to="/login" />
  if (role === 'SUPER_ADMIN') return <Navigate to="/platform" />
  return <Navigate to="/" />
}