import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { T } from '../../constants/theme'
import {
  getBillingPlans,
  getBillingStatus,
  createSubscriptionCheckout,
  verifySubscriptionPayment,
  changePlanOrSeats,
  verifyDeltaOrderPayment,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  updateGstProfile,
  getBillingInvoices,
  downloadGstInvoicePdf,
  loadRazorpayScript,
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

export default function BillingSettings() {
  const { role } = useSelector((state) => state.auth)
  const isAdmin = role === 'ADMIN' || role === 'COMPANY_SUPER_ADMIN'

  const [status, setStatus] = useState(null)
  const [plans, setPlans] = useState([])
  const [invoices, setInvoices] = useState([])
  const [interval, setInterval] = useState('MONTHLY')
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState('')
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
    } catch (e) {
      setFeedback({ type: 'error', text: e?.userMessage || 'Unable to load subscription details' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const openSubscriptionCheckout = async (checkout) => {
    const ok = await loadRazorpayScript()
    if (!ok || !window.Razorpay) {
      throw new Error('Unable to open payment checkout. Please retry in a moment.')
    }
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: checkout.keyId,
        subscription_id: checkout.subscriptionId,
        name: 'IInventive CRM',
        description: checkout.planName || 'Subscription Plan',
        prefill: {
          email: checkout.prefillEmail || '',
          contact: checkout.prefillContact || '',
        },
        theme: { color: T.primary || '#0A66FF' },
        handler: async (res) => {
          try {
            await verifySubscriptionPayment(res.razorpay_payment_id, res.razorpay_signature)
            resolve()
          } catch (err) {
            reject(err)
          }
        },
        modal: { ondismiss: () => reject(new Error('Checkout dismissed')) },
      })
      rzp.on('payment.failed', (err) => reject(new Error(err?.error?.description || 'Payment declined')))
      rzp.open()
    })
  }

  const openOrderCheckout = async (order) => {
    const ok = await loadRazorpayScript()
    if (!ok || !window.Razorpay) {
      throw new Error('Unable to open payment checkout. Please retry in a moment.')
    }
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amountPaise,
        currency: order.currency || 'INR',
        name: 'IInventive CRM',
        description: 'Plan Upgrade Differential',
        theme: { color: T.primary || '#0A66FF' },
        handler: async (res) => {
          try {
            await verifyDeltaOrderPayment(res.razorpay_payment_id, res.razorpay_signature)
            resolve()
          } catch (err) {
            reject(err)
          }
        },
        modal: { ondismiss: () => reject(new Error('Upgrade checkout dismissed')) },
      })
      rzp.open()
    })
  }

  const handleSelectPlan = async (planCode) => {
    setFeedback(null)
    setBusyAction(planCode)
    try {
      if (!status?.hasActiveSubscription) {
        const checkout = await createSubscriptionCheckout(planCode, 1)
        await openSubscriptionCheckout(checkout)
        setFeedback({ type: 'success', text: 'Your subscription is active.' })
      } else {
        const res = await changePlanOrSeats(planCode, status?.seatQuantity || 1, 'now')
        if (res.flow === 'NEW_SUBSCRIPTION' && res.checkout) {
          await openSubscriptionCheckout(res.checkout)
          setFeedback({ type: 'success', text: 'Subscription activated.' })
        } else if (res.flow === 'DELTA_ORDER') {
          await openOrderCheckout(res)
          setFeedback({ type: 'success', text: 'Plan upgrade verified and activated.' })
        } else {
          setFeedback({ type: 'success', text: 'Your plan has been updated.' })
        }
      }
      await loadAll()
    } catch (err) {
      if (err?.message !== 'Checkout dismissed' && err?.message !== 'Upgrade checkout dismissed') {
        setFeedback({ type: 'error', text: err?.userMessage || err?.message || 'Unable to process plan change' })
      }
    } finally {
      setBusyAction('')
    }
  }

  const handleLifecycle = async (fn, successMsg, key) => {
    setFeedback(null)
    setBusyAction(key)
    try {
      await fn()
      setFeedback({ type: 'success', text: successMsg })
      await loadAll()
    } catch (err) {
      setFeedback({ type: 'error', text: err?.userMessage || err?.message || 'Action failed' })
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
      setFeedback({ type: 'success', text: 'GST details saved for future tax invoices.' })
      await loadAll()
    } catch (err) {
      setFeedback({ type: 'error', text: err?.userMessage || err?.message || 'Could not save GST details' })
    } finally {
      setBusyAction('')
    }
  }

  if (loading) {
    return (
      <div className="p-8 rounded-2xl border text-sm font-semibold" style={{ background: T.surface, borderColor: T.border, color: T.textMuted }}>
        Loading subscription and usage details...
      </div>
    )
  }

  const subState = status?.subscriptionStatus || status?.companyStatus || 'TRIAL'
  const badge = STATUS_BADGE[subState] || STATUS_BADGE.TRIAL
  const usage = status?.usage || {}
  const meters = [
    { label: 'Team Seats', used: usage.users || 0, max: usage.maxUsers || 5 },
    { label: 'Contacts', used: usage.contacts || 0, max: usage.maxContacts || 50 },
    { label: 'Accounts', used: usage.accounts || 0, max: usage.maxAccounts || 10 },
    { label: 'Deals', used: usage.deals || 0, max: usage.maxDeals || 20 },
  ]

  const visiblePlans = plans.filter((p) => p.tier !== 'FREE' && p.billingInterval === interval)
  const selfServeAvailable = Boolean(status?.selfServeBillingAvailable)

  return (
    <div className="space-y-6">
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

      {/* Payment overdue notice (customer-facing) */}
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
              Please complete your overdue invoice payment to keep uninterrupted write access for your team.
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
            <h3 className="text-2xl font-black" style={{ color: T.textPrimary }}>{status?.companyPlan || 'FREE'}</h3>
            {status?.paymentMethodLabel && (
              <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                Payment method: <span className="font-bold" style={{ color: T.textPrimary }}>{status.paymentMethodLabel}</span>
              </p>
            )}
          </div>
          {status?.currentEnd && (
            <p className="text-xs" style={{ color: T.textMuted }}>
              Current cycle ends: <strong>{new Date(status.currentEnd).toLocaleDateString()}</strong>
            </p>
          )}
          {status?.trialEndsAt && subState === 'TRIAL' && (
            <p className="text-xs" style={{ color: T.textMuted }}>
              Trial ends: <strong>{new Date(status.trialEndsAt).toLocaleDateString()}</strong>
            </p>
          )}
          {status?.licenseKeyMasked && (
            <div className="pt-2 border-t text-xs" style={{ borderColor: T.border, color: T.textMuted }}>
              <span>Accounting Bridge License:</span>
              <div className="font-mono font-bold mt-1" style={{ color: T.textPrimary }}>{status.licenseKeyMasked}</div>
            </div>
          )}

          {isAdmin && status?.hasActiveSubscription && (
            <div className="flex flex-wrap gap-2 pt-2">
              {subState === 'ACTIVE' && (
                <button
                  disabled={Boolean(busyAction)}
                  onClick={() => handleLifecycle(pauseSubscription, 'Subscription paused.', 'pause')}
                  className="px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer"
                  style={{ borderColor: T.border, color: T.textPrimary }}
                >
                  Pause
                </button>
              )}
              {subState === 'PAUSED' && !status?.pausedByCustomer && (
                <button
                  disabled={Boolean(busyAction)}
                  onClick={() => handleLifecycle(resumeSubscription, 'Subscription resumed.', 'resume')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer"
                  style={{ background: T.primary }}
                >
                  Resume
                </button>
              )}
              {subState !== 'CANCELLED' && !status?.cancelAtCycleEnd && (
                <button
                  disabled={Boolean(busyAction)}
                  onClick={() => handleLifecycle(() => cancelSubscription(true), 'Scheduled cancellation at cycle end.', 'cancel')}
                  className="px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer"
                  style={{ borderColor: '#FCA5A5', color: '#EF4444' }}
                >
                  Cancel at Cycle End
                </button>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 p-6 rounded-2xl border" style={{ background: T.surface, borderColor: T.border }}>
          <h4 className="text-sm font-extrabold mb-4" style={{ color: T.textPrimary }}>Workspace Usage &amp; Plan Limits</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {meters.map((m) => {
              const unlimited = m.max >= 999999
              const pct = unlimited ? 8 : Math.min(100, Math.round((m.used / Math.max(1, m.max)) * 100))
              return (
                <div key={m.label} className="p-3.5 rounded-xl border" style={{ borderColor: T.border }}>
                  <div className="flex justify-between text-xs font-bold mb-1.5" style={{ color: T.textPrimary }}>
                    <span>{m.label}</span>
                    <span>{m.used.toLocaleString()} / {unlimited ? '∞' : m.max.toLocaleString()}</span>
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

      {/* Plan Upgrade Grid */}
      {isAdmin && (
        <div className="p-6 rounded-2xl border" style={{ background: T.surface, borderColor: T.border }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h4 className="text-base font-extrabold" style={{ color: T.textPrimary }}>Available Subscription Plans</h4>
              <p className="text-xs" style={{ color: T.textMuted }}>
                {selfServeAvailable
                  ? 'Supports Credit/Debit Cards, UPI AutoPay, and eNACH mandates. Prices exclude 18% GST.'
                  : 'Need to upgrade seats or change plans? Contact your account manager or support team.'}
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
                  {iv === 'MONTHLY' ? 'Monthly' : 'Annual (-20%)'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visiblePlans.map((p) => {
              const isCurrent = status?.planCode === p.code && subState === 'ACTIVE'
              return (
                <div key={p.code} className="p-5 rounded-2xl border flex flex-col justify-between gap-4"
                  style={{ borderColor: isCurrent ? T.primary : T.border }}>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black" style={{ color: T.textPrimary }}>{p.name}</span>
                      <span className="text-xs font-bold uppercase" style={{ color: T.primary }}>{p.tier}</span>
                    </div>
                    <div className="text-2xl font-black mb-2" style={{ color: T.textPrimary }}>
                      ₹{(p.amountInr || 0).toLocaleString('en-IN')}
                      <span className="text-xs font-semibold ml-1" style={{ color: T.textMuted }}>
                        /{p.billingInterval === 'ANNUAL' ? 'yr' : 'mo'} + 18% GST
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: T.textMuted }}>{p.description}</p>
                  </div>
                  {selfServeAvailable ? (
                    <button
                      disabled={isCurrent || Boolean(busyAction)}
                      onClick={() => handleSelectPlan(p.code)}
                      className="w-full py-2.5 rounded-xl font-extrabold text-xs text-white cursor-pointer disabled:opacity-50"
                      style={{ background: isCurrent ? '#10B981' : T.primary }}
                    >
                      {busyAction === p.code
                        ? 'Opening Checkout...'
                        : isCurrent
                          ? 'Current Active Plan'
                          : `Select ${p.name}`}
                    </button>
                  ) : (
                    <a
                      href="/support"
                      className="w-full py-2.5 rounded-xl font-extrabold text-xs text-center border block"
                      style={{ borderColor: T.border, color: isCurrent ? '#10B981' : T.primary }}
                    >
                      {isCurrent ? 'Current Active Plan' : 'Request Plan Change via Support'}
                    </a>
                  )}
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
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border text-xs"
                  style={{ borderColor: T.border }}>
                  <div>
                    <div className="font-mono font-bold" style={{ color: T.textPrimary }}>{inv.invoiceNumber}</div>
                    <div style={{ color: T.textMuted }}>
                      {inv.planCode} · ₹{((inv.amountPaise || 0) / 100).toLocaleString('en-IN')} ·{' '}
                      {inv.igstPaise > 0 ? 'IGST 18%' : 'CGST+SGST 18%'}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
