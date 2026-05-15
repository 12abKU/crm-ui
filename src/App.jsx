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


const PrivateLayout = ({ children }) => {
  const token = useSelector(state => state.auth.token)
  if (!token) return <Navigate to="/login" />
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
        <Route path="/accounts" element={<PrivateLayout><Accounts /></PrivateLayout>} />
        <Route path="/accounts/:id" element={<PrivateLayout><AccountProfile /></PrivateLayout>} />
        <Route path="/contacts" element={<PrivateLayout><Contacts /></PrivateLayout>} />
        <Route path="/contacts/:id" element={<PrivateLayout><ContactProfile /></PrivateLayout>} />
        <Route path="/deals" element={<PrivateLayout><Deals /></PrivateLayout>} />
        <Route path="/activities" element={<PrivateLayout><Activities /></PrivateLayout>} />
        <Route path="/profile" element={<PrivateLayout><Profile /></PrivateLayout>} />
        <Route path="/settings" element={<PrivateLayout><Settings /></PrivateLayout>} />
        <Route path="/conversations" element={<PrivateLayout><Conversations /></PrivateLayout>} />
        <Route path="/calls" element={<PrivateLayout><Calls /></PrivateLayout>} />


        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
