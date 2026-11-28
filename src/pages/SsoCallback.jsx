import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../store/authSlice'
import api from '../api'
import { T } from '../constants/theme'

export default function SsoCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [error, setError] = useState('')
  const exchangedRef = useRef(false)

  useEffect(() => {
    if (exchangedRef.current) return
    exchangedRef.current = true

    const code = searchParams.get('code')
    if (!code) {
      setError('Missing workspace handoff code.')
      return
    }

    api
      .post('/api/auth/exchange', { code })
      .then((res) => {
        const data = res.data || {}
        if (!data.token) {
          throw new Error('Authentication token missing in response.')
        }
        dispatch(setCredentials(data))
        navigate(data.redirectPath || '/', { replace: true })
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
            'Your single-use sign-in link has expired or was already used.'
        )
      })
  }, [searchParams, dispatch, navigate])

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: T.bg, color: T.textPrimary }}
    >
      <div
        className="max-w-md w-full rounded-3xl p-8 border text-center space-y-4"
        style={{ background: T.surface, borderColor: T.border }}
      >
        {error ? (
          <>
            <div
              className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: T.errorDim, color: T.error }}
            >
              <span className="material-symbols-outlined text-[24px]">lock_clock</span>
            </div>
            <h1 className="text-xl font-black">Sign-In Link Expired</h1>
            <p className="text-sm" style={{ color: T.textSecondary }}>
              {error}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-3 rounded-xl font-extrabold text-sm text-white"
              style={{ background: T.primary }}
            >
              Continue to Login
            </Link>
          </>
        ) : (
          <>
            <div
              className="w-10 h-10 border-3 rounded-full animate-spin mx-auto"
              style={{ borderColor: T.primary, borderTopColor: 'transparent' }}
            />
            <h1 className="text-lg font-black">Signing into your CRM workspace…</h1>
            <p className="text-xs" style={{ color: T.textMuted }}>
              Verifying cryptographic single-use handoff session.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
