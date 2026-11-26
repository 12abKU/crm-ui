import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { IconCode, IconCopy, IconCheck } from '@tabler/icons-react'
import { T } from '../../constants/theme'

export default function WebFormBuilderSection({ webhookUrl }) {
    const [formTitle, setFormTitle] = useState('Request a Free Consultation')
    const [buttonText, setButtonText] = useState('Submit Inquiry')
    const [accentColor, setAccentColor] = useState('#4F46E5')
    const [includeCompany, setIncludeCompany] = useState(true)
    const [includeNotes, setIncludeNotes] = useState(true)
    const [copied, setCopied] = useState(false)

    const safeEndpoint = webhookUrl || `${window.location.origin}/api/webhooks/inbound/YOUR_API_KEY`

    const embedHtml = `<!-- IInventive CRM Embeddable Lead Capture Form -->
<div id="crm-lead-widget" style="max-width:440px;font-family:system-ui,sans-serif;border:1px solid #e2e8f0;border-radius:14px;padding:24px;background:#fff;">
  <h3 style="margin:0 0 14px;font-size:18px;color:#0f172a;">${formTitle}</h3>
  <form id="crm-lead-form" style="display:flex;flex-direction:column;gap:10px;">
    <input name="name" placeholder="Full Name *" required style="padding:10px;border:1px solid #cbd5e1;border-radius:8px;" />
    <input name="email" type="email" placeholder="Work Email *" required style="padding:10px;border:1px solid #cbd5e1;border-radius:8px;" />
    <input name="phone" placeholder="Phone Number *" required style="padding:10px;border:1px solid #cbd5e1;border-radius:8px;" />${includeCompany ? `\n    <input name="companyName" placeholder="Company Name" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px;" />` : ''}${includeNotes ? `\n    <textarea name="message" rows="3" placeholder="How can we help?" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px;"></textarea>` : ''}
    <button type="submit" style="padding:11px;border:none;border-radius:8px;background:${accentColor};color:#fff;font-weight:700;cursor:pointer;">${buttonText}</button>
    <p id="crm-lead-msg" style="margin:4px 0 0;font-size:13px;display:none;"></p>
  </form>
</div>
<script>
document.getElementById('crm-lead-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  data.source = 'WEB_FORM';
  const msg = document.getElementById('crm-lead-msg');
  try {
    const res = await fetch('${safeEndpoint}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Submission failed');
    msg.style.display = 'block';
    msg.style.color = '#16a34a';
    msg.textContent = 'Thank you! We will contact you shortly.';
    e.target.reset();
  } catch (err) {
    msg.style.display = 'block';
    msg.style.color = '#dc2626';
    msg.textContent = 'Could not submit inquiry. Please try again.';
  }
});
</script>`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(embedHtml)
            setCopied(true)
            toast.success('Embeddable HTML form copied!')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Copy failed')
        }
    }

    return (
        <div className="rounded-2xl border overflow-hidden" style={{ background: T.surface, borderColor: T.border }}>
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: T.borderSubtle }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                        <IconCode size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>Embeddable Web-Form Builder</h3>
                        <p className="text-xs" style={{ color: T.textSecondary }}>
                            Drop a custom HTML lead form onto any website; submissions flow straight into Leads.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
                    style={{ background: copied ? '#16A34A' : T.primary }}
                >
                    {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    {copied ? 'Copied!' : 'Copy HTML Embed'}
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: T.textMuted }}>Heading</label>
                        <input
                            value={formTitle}
                            onChange={e => setFormTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                            style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: T.textMuted }}>Button Text</label>
                            <input
                                value={buttonText}
                                onChange={e => setButtonText(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                                style={{ background: T.surfaceRaised, borderColor: T.border, color: T.textPrimary }}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: T.textMuted }}>Button Color</label>
                            <input
                                type="color"
                                value={accentColor}
                                onChange={e => setAccentColor(e.target.value)}
                                className="w-full h-9 rounded-xl border cursor-pointer"
                                style={{ background: T.surfaceRaised, borderColor: T.border }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-1">
                        <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: T.textPrimary }}>
                            <input type="checkbox" checked={includeCompany} onChange={e => setIncludeCompany(e.target.checked)} className="accent-indigo-600" />
                            Include Company Field
                        </label>
                        <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: T.textPrimary }}>
                            <input type="checkbox" checked={includeNotes} onChange={e => setIncludeNotes(e.target.checked)} className="accent-indigo-600" />
                            Include Notes Field
                        </label>
                    </div>
                    <pre className="p-3 rounded-xl border text-[10.5px] font-mono overflow-x-auto max-h-48" style={{ background: '#0f172a', color: '#e2e8f0', borderColor: T.border }}>
                        {embedHtml}
                    </pre>
                </div>

                <div className="p-5 rounded-2xl border flex flex-col justify-center" style={{ background: T.surfaceRaised, borderColor: T.borderSubtle }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: T.textMuted }}>Live Widget Preview</span>
                    <div className="p-5 rounded-xl bg-white border border-slate-200 text-slate-900 shadow-xs space-y-2.5">
                        <h4 className="font-bold text-sm">{formTitle}</h4>
                        <input disabled placeholder="Full Name *" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50" />
                        <input disabled placeholder="Work Email *" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50" />
                        <input disabled placeholder="Phone Number *" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50" />
                        {includeCompany && <input disabled placeholder="Company Name" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50" />}
                        {includeNotes && <textarea disabled rows={2} placeholder="How can we help?" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50" />}
                        <button type="button" disabled className="w-full py-2.5 rounded-lg text-xs font-bold text-white" style={{ background: accentColor }}>
                            {buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
