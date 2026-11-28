import { useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import {
  calculateBillingQuote,
  cancelSubscription,
  changePlanOrSeats,
  createSubscriptionCheckout,
  loadRazorpayScript,
  verifyDeltaOrderPayment,
  verifySubscriptionPayment,
} from '../../api/billing'

export default function PlanCheckoutModal({
  plan,
  status,
  gstin,
  billingStateCode,
  onClose,
  onSuccess,
}) {
  const isFree = plan?.tier === 'FREE' || (plan?.amountPaise ?? 0) <= 0
  const hasActiveSub = Boolean(status?.hasActiveSubscription)
  const isSamePlan = status?.planCode === plan?.code && status?.subscriptionStatus === 'ACTIVE'

  const [seatQuantity, setSeatQuantity] = useState(() => Math.max(1, status?.seatQuantity || 1))
  const [scheduleAt, setScheduleAt] = useState('now')
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!plan?.code || isFree) {
      setQuote(null)
      return
    }
    let mounted = true
    setQuoteLoading(true)
    setError('')
    calculateBillingQuote({
      planCode: plan.code,
      seatQuantity,
      billingStateCode,
      gstin,
    })
      .then((q) => {
        if (mounted) setQuote(q)
      })
      .catch((e) => {
        if (mounted) setError(e?.userMessage || e?.response?.data?.message || 'Unable to compute tax quote.')
      })
      .finally(() => {
        if (mounted) setQuoteLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [plan?.code, isFree, seatQuantity, billingStateCode, gstin])

  const openRazorpaySubscription = async (checkout) => {
    const ready = await loadRazorpayScript()
    if (!ready || !window.Razorpay) {
      throw new Error('Could not load Razorpay Checkout script. Check your network connection.')
    }
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: checkout.keyId,
        subscription_id: checkout.subscriptionId,
        name: 'IInventive CRM',
        description: checkout.planName || plan.name,
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

  const openRazorpayOrder = async (order) => {
    const ready = await loadRazorpayScript()
    if (!ready || !window.Razorpay) {
      throw new Error('Could not load Razorpay Checkout script. Check your network connection.')
    }
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amountPaise,
        currency: order.currency || 'INR',
        name: 'IInventive CRM',
        description: `${plan.name} Differential Upgrade`,
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

  const handleConfirm = async () => {
    setError('')
    setSubmitting(true)
    try {
      if (isFree) {
        const atCycleEnd = hasActiveSub && scheduleAt !== 'now'
        await cancelSubscription(atCycleEnd)
        onSuccess(
          atCycleEnd
            ? 'Downgrade to Free scheduled for the end of your current billing cycle.'
            : 'Workspace switched to the Free tier.',
        )
        return
      }

      if (!status?.selfServeBillingAvailable) {
        setError(
          'Online payment gateway (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) is not configured on the backend yet.',
        )
        return
      }

      if (!hasActiveSub) {
        const checkout = await createSubscriptionCheckout(plan.code, seatQuantity)
        await openRazorpaySubscription(checkout)
        onSuccess(`${plan.name} (${seatQuantity} ${seatQuantity === 1 ? 'seat' : 'seats'}) is now active.`)
        return
      }

      const res = await changePlanOrSeats(plan.code, seatQuantity, scheduleAt)
      if (res.flow === 'NEW_SUBSCRIPTION' && res.checkout) {
        await openRazorpaySubscription(res.checkout)
        onSuccess(`${plan.name} subscription activated.`)
      } else if (res.flow === 'DELTA_ORDER') {
        await openRazorpayOrder(res)
        onSuccess(`Upgraded cleanly to ${plan.name} (${seatQuantity} seats).`)
      } else if (res.flow === 'SCHEDULED_CYCLE_END') {
        onSuccess(`${plan.name} change scheduled for your next billing cycle.`)
      } else if (res.flow === 'NO_CHANGE') {
        onSuccess('Your subscription already matches this plan and seat count.')
      } else {
        onSuccess(`Updated subscription to ${plan.name} (${seatQuantity} ${seatQuantity === 1 ? 'seat' : 'seats'}).`)
      }
    } catch (err) {
      if (err?.message !== 'Checkout dismissed' && err?.message !== 'Upgrade checkout dismissed') {
        setError(err?.userMessage || err?.response?.data?.message || err?.message || 'Unable to process plan update.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const cycleLabel = plan?.billingInterval === 'ANNUAL' ? 'year' : 'month'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2, 6, 23, 0.72)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border p-6 space-y-5 shadow-2xl"
        style={{ background: T.surface, borderColor: T.border }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: T.primary }}>
              Self-Serve Plan Management
            </span>
            <h3 className="text-xl font-black mt-0.5" style={{ color: T.textPrimary }}>
              {isFree
                ? 'Downgrade to Free Plan'
                : isSamePlan
                  ? `Manage Seats · ${plan.name}`
                  : `Switch to ${plan.name}`}
            </h3>
            <p className="text-xs mt-1" style={{ color: T.textMuted }}>
              Powered by centralized plan pricing and live Indian GST rules.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer"
            style={{ borderColor: T.border, color: T.textMuted }}
          >
            Close
          </button>
        </div>

        {error && (
          <div
            className="p-3 rounded-xl border text-xs font-semibold"
            style={{ background: 'rgba(239,68,68,0.1)', borderColor: '#EF4444', color: '#EF4444' }}
          >
            {error}
          </div>
        )}

        {!isFree && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border" style={{ borderColor: T.border, background: T.surfaceHigh }}>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: T.textMuted }}>
                Subscription Units / Seats
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSeatQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg border font-black text-sm cursor-pointer"
                  style={{ borderColor: T.border, color: T.textPrimary, background: T.surface }}
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={seatQuantity}
                  onChange={(e) => setSeatQuantity(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                  className="w-full text-center py-1.5 rounded-lg border text-sm font-black"
                  style={{ borderColor: T.border, background: T.surface, color: T.textPrimary }}
                />
                <button
                  type="button"
                  onClick={() => setSeatQuantity((q) => Math.min(1000, q + 1))}
                  className="w-8 h-8 rounded-lg border font-black text-sm cursor-pointer"
                  style={{ borderColor: T.border, color: T.textPrimary, background: T.surface }}
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border" style={{ borderColor: T.border, background: T.surfaceHigh }}>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: T.textMuted }}>
                When to Apply
              </label>
              <select
                value={hasActiveSub ? scheduleAt : 'now'}
                disabled={!hasActiveSub}
                onChange={(e) => setScheduleAt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-xs font-bold"
                style={{ borderColor: T.border, background: T.surface, color: T.textPrimary }}
              >
                <option value="now">Immediately (unlock right away)</option>
                {hasActiveSub && <option value="cycle_end">At next billing cycle renewal</option>}
              </select>
            </div>
          </div>
        )}

        {isFree && hasActiveSub && (
          <div className="p-3.5 rounded-xl border" style={{ borderColor: T.border, background: T.surfaceHigh }}>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: T.textMuted }}>
              Downgrade Timing
            </label>
            <select
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-xs font-bold"
              style={{ borderColor: T.border, background: T.surface, color: T.textPrimary }}
            >
              <option value="cycle_end">Keep current features until cycle ends (Recommended)</option>
              <option value="now">Downgrade to Free immediately</option>
            </select>
          </div>
        )}

        {/* Authoritative Centralized GST Quote */}
        {!isFree ? (
          <div className="p-4 rounded-xl border space-y-2 text-xs" style={{ borderColor: T.border, background: T.surfaceHigh }}>
            <div className="flex items-center justify-between font-bold" style={{ color: T.textPrimary }}>
              <span>{plan.name} × {seatQuantity}</span>
              <span>
                {quoteLoading
                  ? 'Calculating...'
                  : `₹${Number(quote?.baseAmountInr ?? (plan.amountInr * seatQuantity)).toLocaleString('en-IN')}`}
              </span>
            </div>
            {quote && (
              <>
                {quote.taxType === 'CGST_SGST' ? (
                  <>
                    <div className="flex justify-between" style={{ color: T.textMuted }}>
                      <span>CGST ({(quote.gstRatePercent || 0) / 2}%)</span>
                      <span>₹{Number(quote.cgstInr || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: T.textMuted }}>
                      <span>SGST ({(quote.gstRatePercent || 0) / 2}%)</span>
                      <span>₹{Number(quote.sgstInr || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between" style={{ color: T.textMuted }}>
                    <span>IGST ({quote.gstRatePercent || 0}%)</span>
                    <span>₹{Number(quote.igstInr || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </>
            )}
            <div className="pt-2 border-t flex items-center justify-between text-sm font-black" style={{ borderColor: T.border, color: T.textPrimary }}>
              <span>Total Payable ({cycleLabel}ly · SAC {quote?.sacCode || plan.sacCode})</span>
              <span>₹{Number(quote?.totalAmountInr ?? (plan.totalAmountInr * seatQuantity)).toLocaleString('en-IN')}</span>
            </div>
            {!status?.selfServeBillingAvailable && (
              <p className="text-[11px] font-semibold pt-1" style={{ color: '#F59E0B' }}>
                Online checkout requires <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> configured on your backend.
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl border text-xs" style={{ borderColor: T.border, background: T.surfaceHigh, color: T.textMuted }}>
            Your workspace moves to the Free tier quotas ({plan.maxUsers} seats, {plan.maxContacts} contacts, {plan.maxAccounts} accounts, {plan.maxDeals} deals, {plan.maxStorageGb} GB storage). Existing data is preserved safely.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer"
            style={{ borderColor: T.border, color: T.textPrimary }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || (!isFree && quoteLoading)}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white cursor-pointer disabled:opacity-50"
            style={{ background: isFree ? '#EF4444' : T.primary }}
          >
            {submitting
              ? 'Processing...'
              : isFree
                ? 'Confirm Downgrade'
                : status?.selfServeBillingAvailable
                  ? scheduleAt === 'cycle_end' && hasActiveSub
                    ? 'Schedule Plan Change'
                    : 'Proceed to Payment'
                  : 'Gateway Keys Required'}
          </button>
        </div>
      </div>
    </div>
  )
}
