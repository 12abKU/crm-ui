import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import PlanCheckoutModal from './PlanCheckoutModal'
import {
  getBillingPlans,
  getBillingStatus,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  updateGstProfile,
  getBillingInvoices,
  downloadGstInvoicePdf,
} from '../../api/billing'

const STATUS_BADGE = {
  ACTIVE: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: 'Active' },
  TRIAL: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', label: '14-Day Trial' },
  AUTHENTICATED: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', label: 'Trial Mandate Active' },
  PAST_DUE: { bg: 'rgba(245,158,11,0.14)', color: '#F59E0B', label: 'Past Due (Grace)' },
  HALTED: { bg: 'rgba(239,68,68,0.14)', color: '#EF4444', label: 'Read-Only Lock' },
  PAUSED: { bg: 'rgba(100,116,139,0.16)', color: '#64748B', label: 'Paused' },
  CANCELLED: { bg: 'rgba(100,116,139,0.16)', color: '#64748B', label: 'Cancelled' },
}

const INDIAN_STATES = [
  ['27', '27 - Maharashtra'],
  ['29', '29 - Karnataka'],
  ['07', '07 - Delhi'],
  ['33', '33 - Tamil Nadu'],
  ['24', '24 - Gujarat'],
  ['36', '36 - Telangana'],
  ['09', '09 - Uttar Pradesh'],
  ['19', '19 - West Bengal'],
  ['06', '06 - Haryana'],
  ['08', '08 - Rajasthan'],
]

const formatLimit = (val, unit = '') =>
  val >= 999999 ? 'Unlimited' : `${Number(val || 0).toLocaleString('en-IN')}${unit ? ` ${unit}` : ''}`

export default function BillingSettings() {
  const { role } = useSelector((state) => state.auth)
  const isAdmin = role === 'ADMIN' || role === 'COMPANY_SUPER_ADMIN'

  const [status, setStatus] = useState(null)
  const [plans, setPlans] = useState([])
  const [invoices, setInvoices] = useState([])
  const [interval, setInterval] = useState('MONTHLY')
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const [gstin, setGstin] = useState('')
  const [billingStateCode, setBillingStateCode] = useState('27')
  const [legalEntityName, setLegalEntityName] = useState('')
  const [billingAddress, setBillingAddress] = useState('')

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [s, p, inv] = await Promise.all([
        getBillingStatus(),
        getBillingPlans(),
        getBillingInvoices(),
      ])
      setStatus(s)
      setPlans(Array.isArray(p) ? p : [])
      setInvoices(Array.isArray(inv) ? inv : [])
      setGstin(s.gstin || '')
      setBillingStateCode(s.billingStateCode || '27')
      setLegalEntityName(s.legalEntityName || s.companyName || '')
      setBillingAddress(s.billingAddress || '')
      if (s.planInterval === 'ANNUAL') {
        setInterval('ANNUAL')
      }
    } catch (e) {
      setFeedback({ type: 'error', text: e?.userMessage || 'Unable to load subscription details' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleLifecycle = async (fn, successMsg, key) => {
    setFeedback(null)
    setBusyAction(key)
    try {
      await fn()
      setConfirmCancel(false)
      setFeedback({ type: 'success', text: successMsg })
      await loadAll()
    } catch (err) {
      setFeedback({ type: 'error', text: err?.userMessage || err?.response?.data?.message || err?.message || 'Action failed' })
    } finally {
      setBusyAction('')
    }
  }

  const handleSaveGst = async (e) => {
    e.preventDefault()
    setFeedback(null)
    setBusyAction('gst')
    try {
      await updateGstProfile({ gstin, billingStateCode, legalEntityName, billingAddress })
      setFeedback({ type: 'success', text: 'GST details saved for future tax invoices and live quotes.' })
      await loadAll()
    } catch (err) {
      setFeedback({ type: 'error', text: err?.userMessage || err?.response?.data?.message || err?.message || 'Could not save GST details' })
    } finally {
      setBusyAction('')
    }
  }

  const tierCards = useMemo(() => {
    if (!plans.length) return []
    const freePlan = plans.find((p) => p.tier === 'FREE')
    const proPlan = plans.find((p) => p.tier === 'PRO' && p.billingInterval === interval) || plans.find((p) => p.tier === 'PRO')
    const entPlan = plans.find((p) => p.tier === 'ENTERPRISE' && p.billingInterval === interval) || plans.find((p) => p.tier === 'ENTERPRISE')
    return [freePlan, proPlan, entPlan].filter(Boolean)
  }, [plans, interval])

  const annualSavings = useMemo(
    () => plans.find((x) => x.billingInterval === 'ANNUAL' && x.annualSavingsPercent > 0)?.annualSavingsPercent,
    [plans],
  )

  if (loading) {
    return (
      <div className="p-8 rounded-2xl border text-sm font-semibold" style={{ background: T.surface, borderColor: T.border, color: T.textMuted }}>
        Loading centralized subscription catalog and usage details...
      </div>
    )
  }

  const subState = status?.subscriptionStatus || status?.companyStatus || 'TRIAL'
  const badge = STATUS_BADGE[subState] || STATUS_BADGE.TRIAL
  const usage = status?.usage || {}
  const usedStorageGb = ((usage.storageBytes || 0) / (1024 * 1024 * 1024)).toFixed(2)
  const maxStorageGb = Math.max(1, Math.round((usage.maxStorageBytes || 5368709120) / (1024 * 1024 * 1024)))
  const meters = [
    { label: 'Team Seats', used: usage.users || 0, max: usage.maxUsers || 5 },
    { label: 'Contacts', used: usage.contacts || 0, max: usage.maxContacts || 50 },
    { label: 'Accounts', used: usage.accounts || 0, max: usage.maxAccounts || 10 },
    { label: 'Deals', used: usage.deals || 0, max: usage.maxDeals || 20 },
    { label: 'Storage', used: Number(usedStorageGb), max: maxStorageGb, unit: 'GB' },
  ]

  const currentCatalogPlan = plans.find((p) => p.code === status?.planCode) || plans.find((p) => p.tier === status?.companyPlan)
  const upiPausedInApp = Boolean(status?.pausedByCustomer && String(status?.paymentMethodLabel || '').toUpperCase().includes('UPI'))

  return (
    <div className="space-y-6">
      {selectedPlanForModal && (
        <PlanCheckoutModal
          plan={selectedPlanForModal}
          status={status}
          gstin={gstin}
          billingStateCode={billingStateCode}
          onClose={() => setSelectedPlanForModal(null)}
          onSuccess={async (msg) => {
            setSelectedPlanForModal(null)
            setFeedback({ type: 'success', text: msg })
            await loadAll()
          }}
        />
      )}

      {feedback && (
        <div
          className="px-4 py-3 rounded-xl border text-sm font-semibold flex items-center justify-between"
          style={{
            background: feedback.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            borderColor: feedback.type === 'success' ? '#10B981' : '#EF4444',
            color: feedback.type === 'success' ? '#10B981' : '#EF4444',
          }}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-xs underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {(subState === 'PAST_DUE' || subState === 'HALTED') && (
        <div className="p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: '#EF4444' }}>
          <div>
            <p className="text-sm font-extrabold" style={{ color: '#EF4444' }}>
              {subState === 'HALTED'
                ? 'Workspace in Read-Only Mode — Payment Required'
                : 'Renewal Payment Pending — Grace Period Active'}
            </p>
            <p className="text-xs mt-1" style={{ color: T.textMuted }}>
              Complete your overdue invoice payment to restore full write access across the workspace.
            </p>
          </div>
          {status?.unpaidShortUrl && (
            <a href={status.unpaidShortUrl} target="_blank" rel="noreferrer"
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white shrink-0"
              style={{ background: '#EF4444' }}>
              Pay Unpaid Invoice →
            </a>
          )}
        </div>
      )}

      {/* Current Subscription Summary + Usage Meters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-6 rounded-2xl border space-y-4" style={{ background: T.surface, borderColor: T.border }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider" style={{ color: T.textMuted }}>Current Plan</span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold" style={{ background: badge.bg, color: badge.color }}>
              {badge.label}
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-black" style={{ color: T.textPrimary }}>
              {status?.planName || status?.companyPlan || 'Free'}
            </h3>
            <p className="text-xs mt-1" style={{ color: T.textMuted }}>
              Licensed seats: <strong style={{ color: T.textPrimary }}>{status?.seatQuantity || 1}</strong>
              {status?.paymentMethodLabel ? (
                <> · Method: <strong style={{ color: T.textPrimary }}>{status.paymentMethodLabel}</strong></>
              ) : null}
            </p>
          </div>

          {status?.pendingPlanCode && (
            <div className="p-3 rounded-xl border text-xs font-semibold" style={{ borderColor: '#3B82F6', background: 'rgba(59,130,246,0.08)', color: '#60A5FA' }}>
              Scheduled switch to <strong>{status.pendingPlanName || status.pendingPlanCode}</strong> on{' '}
              {status.currentEnd ? new Date(status.currentEnd).toLocaleDateString() : 'next cycle'}.
            </div>
          )}

          {status?.cancelAtCycleEnd && (
            <div className="p-3 rounded-xl border text-xs font-semibold" style={{ borderColor: '#F59E0B', background: 'rgba(245,158,11,0.08)', color: '#F59E0B' }}>
              Cancellation scheduled for {status.currentEnd ? new Date(status.currentEnd).toLocaleDateString() : 'end of cycle'}.
            </div>
          )}

          {status?.isTrialing && status?.trialEndsAt ? (
            <p className="text-xs" style={{ color: T.textMuted }}>
              Trial ends: <strong>{new Date(status.trialEndsAt).toLocaleDateString()}</strong>
              {status.trialDaysLeft > 0 ? ` (${status.trialDaysLeft}d left)` : ''}
            </p>
          ) : (
            status?.currentEnd && (
              <p className="text-xs" style={{ color: T.textMuted }}>
                Current cycle ends: <strong>{new Date(status.currentEnd).toLocaleDateString()}</strong>
              </p>
            )
          )}

          {status?.licenseKeyMasked && (
            <div className="pt-2 border-t text-xs" style={{ borderColor: T.border, color: T.textMuted }}>
              <span>Accounting Bridge License:</span>
              <div className="font-mono font-bold mt-1" style={{ color: T.textPrimary }}>{status.licenseKeyMasked}</div>
            </div>
          )}

          {isAdmin && (
            <div className="flex flex-wrap gap-2 pt-2">
              {currentCatalogPlan && currentCatalogPlan.tier !== 'FREE' && (
                <button
                  type="button"
                  disabled={Boolean(busyAction)}
                  onClick={() => setSelectedPlanForModal(currentCatalogPlan)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer"
                  style={{ background: T.primary }}
                >
                  Manage Seats
                </button>
              )}
              {status?.hasActiveSubscription && subState === 'ACTIVE' && (
                <button
                  type="button"
                  disabled={Boolean(busyAction)}
                  onClick={() => handleLifecycle(pauseSubscription, 'Subscription paused cleanly.', 'pause')}
                  className="px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer"
                  style={{ borderColor: T.border, color: T.textPrimary }}
                >
                  Pause
                </button>
              )}
              {status?.hasActiveSubscription && subState === 'PAUSED' && !upiPausedInApp && (
                <button
                  type="button"
                  disabled={Boolean(busyAction)}
                  onClick={() => handleLifecycle(resumeSubscription, 'Subscription resumed cleanly.', 'resume')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer"
                  style={{ background: '#10B981' }}
                >
                  Resume
                </button>
              )}
              {status?.hasActiveSubscription && subState !== 'CANCELLED' && !status?.cancelAtCycleEnd && !confirmCancel && (
                <button
                  type="button"
                  disabled={Boolean(busyAction)}
                  onClick={() => setConfirmCancel(true)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer"
                  style={{ borderColor: '#FCA5A5', color: '#EF4444' }}
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          )}

          {upiPausedInApp && (
            <p className="text-[11px]" style={{ color: T.textMuted }}>
              This UPI AutoPay mandate was paused in your UPI app. Please resume it inside your UPI app.
            </p>
          )}

          {confirmCancel && (
            <div className="p-3 rounded-xl border space-y-2 text-xs" style={{ borderColor: '#EF4444', background: 'rgba(239,68,68,0.06)' }}>
              <p className="font-bold" style={{ color: T.textPrimary }}>Cancel subscription at end of billing cycle?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={Boolean(busyAction)}
                  onClick={() => handleLifecycle(() => cancelSubscription(true), 'Scheduled cancellation at cycle end.', 'cancel')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer"
                  style={{ background: '#EF4444' }}
                >
                  Confirm Cancel at Cycle End
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer"
                  style={{ borderColor: T.border, color: T.textMuted }}
                >
                  Keep Plan
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 p-6 rounded-2xl border" style={{ background: T.surface, borderColor: T.border }}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-extrabold" style={{ color: T.textPrimary }}>Workspace Usage &amp; Plan Limits</h4>
            <span className="text-[11px] font-semibold" style={{ color: T.textMuted }}>
              Centralized quotas enforced live
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {meters.map((m) => {
              const unlimited = m.max >= 999999
              const pct = unlimited ? 8 : Math.min(100, Math.round((m.used / Math.max(1, m.max)) * 100))
              return (
                <div key={m.label} className="p-3.5 rounded-xl border" style={{ borderColor: T.border }}>
                  <div className="flex justify-between text-xs font-bold mb-1.5" style={{ color: T.textPrimary }}>
                    <span>{m.label}</span>
                    <span>
                      {m.used.toLocaleString()} {m.unit || ''} / {unlimited ? '∞' : `${m.max.toLocaleString()}${m.unit ? ` ${m.unit}` : ''}`}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: T.surfaceHigh }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: pct > 90 ? '#EF4444' : T.primary }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Self-Serve Plan Upgrade / Downgrade Catalog */}
      {isAdmin && (
        <div className="p-6 rounded-2xl border" style={{ background: T.surface, borderColor: T.border }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h4 className="text-base font-extrabold" style={{ color: T.textPrimary }}>Self-Serve Plans &amp; Upgrades</h4>
              <p className="text-xs" style={{ color: T.textMuted }}>
                Upgrade, switch billing cycles, adjust team seats, or downgrade anytime. Supports Cards, UPI AutoPay &amp; eNACH with GST tax invoices.
              </p>
            </div>
            <div className="inline-flex p-1 rounded-xl border" style={{ background: T.surfaceHigh, borderColor: T.border }}>
              {['MONTHLY', 'ANNUAL'].map((iv) => (
                <button key={iv} type="button" onClick={() => setInterval(iv)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all"
                  style={{
                    background: interval === iv ? T.primary : 'transparent',
                    color: interval === iv ? '#FFFFFF' : T.textMuted,
                  }}>
                  {iv === 'MONTHLY' ? 'Monthly' : (annualSavings ? `Annual (-${annualSavings}%)` : 'Annual')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tierCards.map((p) => {
              const isFreeCard = p.tier === 'FREE' || (p.amountPaise || 0) <= 0
              const isCurrent = isFreeCard
                ? status?.companyPlan === 'FREE' && !status?.hasActiveSubscription
                : status?.planCode === p.code && (subState === 'ACTIVE' || subState === 'AUTHENTICATED')
              const isHigherTier =
                (status?.companyPlan === 'FREE' && !isFreeCard) ||
                (status?.companyPlan === 'PRO' && p.tier === 'ENTERPRISE')

              const ctaText = isCurrent
                ? isFreeCard
                  ? 'Current Active Plan'
                  : 'Current Plan · Manage Seats'
                : isFreeCard
                  ? 'Downgrade to Free'
                  : isHigherTier
                    ? `Upgrade to ${p.name}`
                    : `Switch to ${p.name}`

              return (
                <div key={p.code} className="p-5 rounded-2xl border flex flex-col justify-between gap-4"
                  style={{ borderColor: isCurrent ? '#10B981' : p.highlighted ? T.primary : T.border }}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black" style={{ color: T.textPrimary }}>{p.name}</span>
                      {(p.badge || p.tier) && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                          style={{ background: isCurrent ? 'rgba(16,185,129,0.12)' : T.surfaceHigh, color: isCurrent ? '#10B981' : T.primary }}>
                          {isCurrent ? 'Active' : (p.badge || p.tier)}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-2xl font-black" style={{ color: T.textPrimary }}>
                        ₹{(p.amountInr || 0).toLocaleString('en-IN')}
                        {!isFreeCard && (
                          <span className="text-xs font-semibold ml-1" style={{ color: T.textMuted }}>
                            /{p.billingInterval === 'ANNUAL' ? 'yr' : 'mo'} {p.gstInclusive ? `(Incl. ${p.gstRatePercent ?? 18}% GST)` : `+ ${p.gstRatePercent ?? 18}% GST`}
                          </span>
                        )}
                      </div>
                      {p.totalAmountInr > 0 && (
                        <p className="text-[11px] font-bold mt-0.5" style={{ color: T.textSecondary }}>
                          Total: ₹{Number(p.totalAmountInr).toLocaleString('en-IN')} · SAC {p.sacCode}
                        </p>
                      )}
                    </div>

                    <p className="text-xs" style={{ color: T.textMuted }}>{p.tagline || p.description}</p>

                    {/* Authoritative Centralized Quotas directly from BillingPlan */}
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold p-2.5 rounded-xl border"
                      style={{ borderColor: T.border, background: T.surfaceHigh, color: T.textPrimary }}>
                      <span>Users: {formatLimit(p.maxUsers)}</span>
                      <span>Contacts: {formatLimit(p.maxContacts)}</span>
                      <span>Accounts: {formatLimit(p.maxAccounts)}</span>
                      <span>Deals: {formatLimit(p.maxDeals)}</span>
                      <span className="col-span-2">Storage: {formatLimit(p.maxStorageGb, 'GB')}</span>
                    </div>

                    {Array.isArray(p.features) && p.features.length > 0 && (
                      <ul className="space-y-1.5 text-xs" style={{ color: T.textSecondary }}>
                        {p.features.slice(0, 5).map((f) => (
                          <li key={f} className="flex items-start gap-1.5">
                            <span style={{ color: '#10B981', fontWeight: 900 }}>✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={(isCurrent && isFreeCard) || Boolean(busyAction)}
                    onClick={() => setSelectedPlanForModal(p)}
                    className="w-full py-2.5 rounded-xl font-extrabold text-xs cursor-pointer disabled:opacity-50"
                    style={{
                      background: isCurrent
                        ? isFreeCard ? 'rgba(16,185,129,0.14)' : T.surfaceHigh
                        : isFreeCard ? 'transparent' : T.primary,
                      color: isCurrent
                        ? isFreeCard ? '#10B981' : T.textPrimary
                        : isFreeCard ? '#EF4444' : '#FFFFFF',
                      border: `1px solid ${isCurrent ? '#10B981' : isFreeCard ? '#FCA5A5' : T.primary}`,
                    }}
                  >
                    {ctaText}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* GST Profile + Invoices History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSaveGst} className="p-6 rounded-2xl border space-y-4" style={{ background: T.surface, borderColor: T.border }}>
          <h4 className="text-sm font-extrabold" style={{ color: T.textPrimary }}>GST Tax Invoice Details</h4>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: T.textMuted }}>Legal Entity Name</label>
            <input value={legalEntityName} onChange={(e) => setLegalEntityName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: T.border, background: T.surfaceHigh, color: T.textPrimary }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: T.textMuted }}>15-Digit GSTIN</label>
              <input value={gstin} maxLength={15} placeholder="27AAPFU0939F1ZT"
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl border text-sm font-mono" style={{ borderColor: T.border, background: T.surfaceHigh, color: T.textPrimary }} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: T.textMuted }}>Place of Supply State</label>
              <select value={billingStateCode} onChange={(e) => setBillingStateCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: T.border, background: T.surfaceHigh, color: T.textPrimary }}>
                {INDIAN_STATES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: T.textMuted }}>Registered Billing Address</label>
            <input value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: T.border, background: T.surfaceHigh, color: T.textPrimary }} />
          </div>
          {isAdmin && (
            <button type="submit" disabled={busyAction === 'gst'}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-white cursor-pointer"
              style={{ background: T.primary }}>
              {busyAction === 'gst' ? 'Saving...' : 'Save GST Details'}
            </button>
          )}
        </form>

        <div className="p-6 rounded-2xl border" style={{ background: T.surface, borderColor: T.border }}>
          <h4 className="text-sm font-extrabold mb-4" style={{ color: T.textPrimary }}>Tax Invoices &amp; Receipts</h4>
          {invoices.length === 0 ? (
            <p className="text-xs" style={{ color: T.textMuted }}>No settled invoices issued yet.</p>
          ) : (
            <div className="space-y-2.5">
              {invoices.map((inv) => {
                const gstTotalPaise = (inv.cgstPaise || 0) + (inv.sgstPaise || 0) + (inv.igstPaise || 0)
                const taxLabel = inv.igstPaise > 0 ? 'IGST' : 'CGST+SGST'
                return (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border text-xs"
                    style={{ borderColor: T.border }}>
                    <div>
                      <div className="font-mono font-bold" style={{ color: T.textPrimary }}>{inv.invoiceNumber}</div>
                      <div style={{ color: T.textMuted }}>
                        {inv.planCode} · ₹{((inv.amountPaise || 0) / 100).toLocaleString('en-IN')} ·{' '}
                        {taxLabel} ₹{(gstTotalPaise / 100).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <button
                      onClick={() => downloadGstInvoicePdf(inv.id, inv.invoiceNumber)}
                      className="px-3 py-1.5 rounded-lg border font-bold cursor-pointer"
                      style={{ borderColor: T.border, color: T.primary }}
                    >
                      PDF
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
