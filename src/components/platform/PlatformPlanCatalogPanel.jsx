import { useCallback, useEffect, useState } from 'react'
import { T } from '../../constants/theme'
import {
  getPlatformBillingPlans,
  updatePlatformBillingPlan,
  getPlatformGstConfig,
  updatePlatformGstConfig,
} from '../../api/billing'

const INDIAN_STATES = [
  ['07', '07 · Delhi'],
  ['27', '27 · Maharashtra'],
  ['29', '29 · Karnataka'],
  ['33', '33 · Tamil Nadu'],
  ['24', '24 · Gujarat'],
  ['36', '36 · Telangana'],
  ['09', '09 · Uttar Pradesh'],
  ['19', '19 · West Bengal'],
  ['06', '06 · Haryana'],
  ['08', '08 · Rajasthan'],
  ['23', '23 · Madhya Pradesh'],
  ['21', '21 · Odisha'],
]

export default function PlatformPlanCatalogPanel() {
  const [expanded, setExpanded] = useState(false)
  const [plans, setPlans] = useState([])
  const [drafts, setDrafts] = useState({})
  const [gstDraft, setGstDraft] = useState({
    legalName: '',
    gstin: '',
    stateCode: '27',
    address: '',
  })
  const [loading, setLoading] = useState(false)
  const [savingCode, setSavingCode] = useState('')
  const [savingGst, setSavingGst] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const syncDrafts = (list) => {
    const next = {}
    for (const p of list) {
      next[p.code] = {
        amountInr: p.amountInr ?? 0,
        gstRatePercent: p.gstRatePercent ?? 18,
        gstInclusive: Boolean(p.gstInclusive),
        sacCode: p.sacCode || '998315',
        maxUsers: p.maxUsers ?? 5,
        maxContacts: p.maxContacts ?? 50,
        maxAccounts: p.maxAccounts ?? 10,
        maxDeals: p.maxDeals ?? 20,
        maxStorageGb: p.maxStorageGb ?? 5,
        annualSavingsPercent: p.annualSavingsPercent ?? 0,
        badge: p.badge || '',
        tagline: p.tagline || '',
        active: Boolean(p.active),
      }
    }
    setDrafts(next)
  }

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [list, gstCfg] = await Promise.all([
        getPlatformBillingPlans(),
        getPlatformGstConfig().catch(() => null),
      ])
      const arr = Array.isArray(list) ? list : []
      setPlans(arr)
      syncDrafts(arr)
      if (gstCfg) {
        setGstDraft({
          legalName: gstCfg.legalName || '',
          gstin: gstCfg.gstin || '',
          stateCode: gstCfg.stateCode || '27',
          address: gstCfg.address || '',
        })
      }
    } catch (e) {
      setFeedback({ type: 'error', text: e?.response?.data?.message || 'Unable to load platform billing configuration.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (expanded && plans.length === 0) {
      loadAll()
    }
  }, [expanded, plans.length, loadAll])

  const updateField = (code, key, val) => {
    setDrafts((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        [key]: val,
      },
    }))
  }

  const handleSaveGst = async (e) => {
    e.preventDefault()
    setSavingGst(true)
    setFeedback(null)
    try {
      const updated = await updatePlatformGstConfig(gstDraft)
      setGstDraft({
        legalName: updated.legalName || '',
        gstin: updated.gstin || '',
        stateCode: updated.stateCode || '27',
        address: updated.address || '',
      })
      setFeedback({
        type: 'success',
        text: `Saved Seller GST profile (${updated.legalName} · State ${updated.stateCode} · GSTIN ${updated.gstin || 'N/A'}). Live quotes & PDFs updated immediately.`,
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to update Seller GST configuration',
      })
    } finally {
      setSavingGst(false)
    }
  }

  const handleSavePlan = async (code) => {
    const d = drafts[code]
    if (!d) return
    setSavingCode(code)
    setFeedback(null)
    try {
      const updated = await updatePlatformBillingPlan(code, {
        amountInr: Number(d.amountInr),
        gstRatePercent: Number(d.gstRatePercent),
        gstInclusive: Boolean(d.gstInclusive),
        sacCode: d.sacCode,
        maxUsers: Number(d.maxUsers),
        maxContacts: Number(d.maxContacts),
        maxAccounts: Number(d.maxAccounts),
        maxDeals: Number(d.maxDeals),
        maxStorageGb: Number(d.maxStorageGb),
        annualSavingsPercent: Number(d.annualSavingsPercent),
        badge: d.badge,
        tagline: d.tagline,
        active: Boolean(d.active),
      })
      setPlans((prev) => prev.map((p) => (p.code === code ? updated : p)))
      setDrafts((prev) => ({
        ...prev,
        [code]: {
          ...prev[code],
          amountInr: updated.amountInr ?? prev[code].amountInr,
          gstRatePercent: updated.gstRatePercent ?? prev[code].gstRatePercent,
          maxUsers: updated.maxUsers ?? prev[code].maxUsers,
          maxContacts: updated.maxContacts ?? prev[code].maxContacts,
          maxAccounts: updated.maxAccounts ?? prev[code].maxAccounts,
          maxDeals: updated.maxDeals ?? prev[code].maxDeals,
          maxStorageGb: updated.maxStorageGb ?? prev[code].maxStorageGb,
        },
      }))
      setFeedback({
        type: 'success',
        text: updated.razorpayPlanReset
          ? `Saved ${updated.name} (₹${Number(updated.totalAmountInr).toLocaleString('en-IN')} incl. GST). Old Razorpay Plan ID was cleared so new checkouts use the new rate automatically.`
          : `Saved ${updated.name} — live on landing pricing & billing checkout (₹${Number(updated.totalAmountInr || 0).toLocaleString('en-IN')} incl. GST).`,
      })
    } catch (e) {
      setFeedback({
        type: 'error',
        text: e?.response?.data?.message || `Failed to update ${code}`,
      })
    } finally {
      setSavingCode('')
    }
  }

  return (
    <div
      className="mb-6 rounded-2xl border overflow-hidden"
      style={{ background: T.surface, borderColor: T.border }}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: T.textPrimary }}>
            Runtime GST, Plan Charges &amp; Quota Controls
          </h3>
          <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
            Only ROLE_SUPER_ADMIN can configure your Seller GST details (CGST/SGST vs IGST &amp; invoice PDF header) plus each plan&apos;s price, GST %, SAC code, and quotas at runtime.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer shrink-0"
          style={{ background: expanded ? T.surfaceHigh : T.primary, color: expanded ? T.textPrimary : '#FFFFFF', border: `1px solid ${T.border}` }}
        >
          {expanded ? 'Hide GST & Plan Editor' : 'Configure GST, Plan Charges & Quotas'}
        </button>
      </div>

      {expanded && (
        <div className="p-4 sm:p-5 pt-0 border-t space-y-5" style={{ borderColor: T.border }}>
          {feedback && (
            <div
              className="mt-4 p-3 rounded-xl border text-xs font-bold"
              style={{
                background: feedback.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                borderColor: feedback.type === 'error' ? '#EF4444' : '#10B981',
                color: feedback.type === 'error' ? '#EF4444' : '#10B981',
              }}
            >
              {feedback.text}
            </div>
          )}

          {loading ? (
            <p className="text-xs py-6 text-center" style={{ color: T.textMuted }}>Loading GST &amp; plan configuration...</p>
          ) : (
            <>
              {/* Seller GST Configuration */}
              <form
                onSubmit={handleSaveGst}
                className="mt-4 p-4 rounded-xl border space-y-3"
                style={{ background: T.bg, borderColor: T.border }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: T.textPrimary }}>
                      Seller GST Configuration (Company Tax Invoice &amp; State)
                    </h4>
                    <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>
                      Buyers inside this state code are billed CGST+SGST; buyers outside this state are billed IGST.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={savingGst}
                    className="px-4 py-1.5 rounded-lg text-xs font-extrabold text-white cursor-pointer disabled:opacity-50 shrink-0"
                    style={{ background: T.primary }}
                  >
                    {savingGst ? 'Saving GST...' : 'Save Seller GST'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold mb-1" style={{ color: T.textMuted }}>Seller Legal Name</label>
                    <input
                      type="text"
                      required
                      value={gstDraft.legalName}
                      onChange={(e) => setGstDraft((prev) => ({ ...prev, legalName: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded-lg border text-xs"
                      style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold mb-1" style={{ color: T.textMuted }}>Seller 15-Digit GSTIN</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstDraft.gstin}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                        setGstDraft((prev) => ({
                          ...prev,
                          gstin: val,
                          stateCode: /^[0-9]{2}/.test(val) ? val.slice(0, 2) : prev.stateCode,
                        }))
                      }}
                      placeholder="07AABCI0000A1Z5"
                      className="w-full px-2.5 py-1.5 rounded-lg border font-mono text-xs"
                      style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold mb-1" style={{ color: T.textMuted }}>Seller State Code</label>
                    <select
                      value={gstDraft.stateCode}
                      onChange={(e) => setGstDraft((prev) => ({ ...prev, stateCode: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded-lg border text-xs"
                      style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                    >
                      {!INDIAN_STATES.some(([c]) => c === gstDraft.stateCode) && gstDraft.stateCode && (
                        <option value={gstDraft.stateCode}>{gstDraft.stateCode} · Custom State</option>
                      )}
                      {INDIAN_STATES.map(([code, lbl]) => (
                        <option key={code} value={code}>{lbl}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold mb-1" style={{ color: T.textMuted }}>Registered Office Address</label>
                    <input
                      type="text"
                      required
                      value={gstDraft.address}
                      onChange={(e) => setGstDraft((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded-lg border text-xs"
                      style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                    />
                  </div>
                </div>
              </form>

              {/* Per-Plan Pricing, GST Rate, SAC & Quota Cards */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {plans.map((p) => {
                  const d = drafts[p.code] || {}
                  const isFree = p.tier === 'FREE'
                  return (
                    <div
                      key={p.code}
                      className="p-4 rounded-xl border space-y-3"
                      style={{ background: T.bg, borderColor: T.border }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black" style={{ color: T.textPrimary }}>{p.name}</span>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-500/15 font-bold" style={{ color: T.textMuted }}>
                              {p.code}
                            </span>
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>
                            Live Total: <strong>₹{Number(p.totalAmountInr || 0).toLocaleString('en-IN')}</strong>
                            {p.razorpayPlanId ? ` · Razorpay Plan: ${p.razorpayPlanId}` : isFree ? ' · Free Tier' : ' · Razorpay Plan auto-created on next checkout'}
                          </p>
                        </div>

                        <label className="inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer" style={{ color: T.textPrimary }}>
                          <input
                            type="checkbox"
                            checked={Boolean(d.active)}
                            onChange={(e) => updateField(p.code, 'active', e.target.checked)}
                          />
                          Active
                        </label>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold mb-1" style={{ color: T.textMuted }}>Base Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            disabled={isFree}
                            value={d.amountInr ?? 0}
                            onChange={(e) => updateField(p.code, 'amountInr', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border font-mono text-xs"
                            style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold mb-1" style={{ color: T.textMuted }}>GST %</label>
                          <input
                            type="number"
                            min="0"
                            max="28"
                            value={d.gstRatePercent ?? 18}
                            onChange={(e) => updateField(p.code, 'gstRatePercent', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border font-mono text-xs"
                            style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold mb-1" style={{ color: T.textMuted }}>SAC Code</label>
                          <input
                            type="text"
                            value={d.sacCode || ''}
                            onChange={(e) => updateField(p.code, 'sacCode', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border font-mono text-xs"
                            style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold mb-1" style={{ color: T.textMuted }}>Annual Save %</label>
                          <input
                            type="number"
                            min="0"
                            max="90"
                            value={d.annualSavingsPercent ?? 0}
                            onChange={(e) => updateField(p.code, 'annualSavingsPercent', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border font-mono text-xs"
                            style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                        {[
                          ['maxUsers', 'Max Users'],
                          ['maxContacts', 'Contacts'],
                          ['maxAccounts', 'Accounts'],
                          ['maxDeals', 'Deals'],
                          ['maxStorageGb', 'Storage GB'],
                        ].map(([k, lbl]) => (
                          <div key={k}>
                            <label className="block text-[10px] font-bold mb-1" style={{ color: T.textMuted }}>{lbl}</label>
                            <input
                              type="number"
                              min="1"
                              value={d[k] ?? 1}
                              onChange={(e) => updateField(p.code, k, e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border font-mono text-xs"
                              style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold mb-1" style={{ color: T.textMuted }}>Badge Label</label>
                          <input
                            type="text"
                            placeholder="e.g. Most Popular"
                            value={d.badge || ''}
                            onChange={(e) => updateField(p.code, 'badge', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border text-xs"
                            style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold mb-1" style={{ color: T.textMuted }}>Tagline</label>
                          <input
                            type="text"
                            value={d.tagline || ''}
                            onChange={(e) => updateField(p.code, 'tagline', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border text-xs"
                            style={{ background: T.surface, borderColor: T.border, color: T.textPrimary }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer" style={{ color: T.textMuted }}>
                          <input
                            type="checkbox"
                            checked={Boolean(d.gstInclusive)}
                            onChange={(e) => updateField(p.code, 'gstInclusive', e.target.checked)}
                          />
                          Price is GST-Inclusive
                        </label>

                        <button
                          type="button"
                          disabled={savingCode === p.code}
                          onClick={() => handleSavePlan(p.code)}
                          className="px-4 py-1.5 rounded-lg text-xs font-extrabold text-white cursor-pointer disabled:opacity-50"
                          style={{ background: T.primary }}
                        >
                          {savingCode === p.code ? 'Saving...' : `Save ${p.code}`}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
