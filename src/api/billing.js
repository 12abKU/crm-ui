import api from './index'

export function loadRazorpayScript() {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve(true)
  }
  return new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true })
      existing.addEventListener('error', () => resolve(false), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const getBillingPlans = () => api.get('/api/billing/plans').then((r) => r.data)
export const getBillingStatus = () => api.get('/api/billing/status').then((r) => r.data)
export const createSubscriptionCheckout = (planCode, quantity = 1) =>
  api.post('/api/billing/subscribe', { planCode, quantity }).then((r) => r.data)
export const verifySubscriptionPayment = (razorpayPaymentId, razorpaySignature) =>
  api.post('/api/billing/verify', { razorpayPaymentId, razorpaySignature }).then((r) => r.data)
export const changePlanOrSeats = (planCode, seatQuantity, scheduleChangeAt = 'now') =>
  api.post('/api/billing/change-plan', { planCode, seatQuantity, scheduleChangeAt }).then((r) => r.data)
export const verifyDeltaOrderPayment = (razorpayPaymentId, razorpaySignature) =>
  api.post('/api/billing/verify-order', { razorpayPaymentId, razorpaySignature }).then((r) => r.data)
export const pauseSubscription = () => api.post('/api/billing/pause').then((r) => r.data)
export const resumeSubscription = () => api.post('/api/billing/resume').then((r) => r.data)
export const cancelSubscription = (cancelAtCycleEnd = true) =>
  api.post('/api/billing/cancel', { cancelAtCycleEnd }).then((r) => r.data)
export const updateGstProfile = (payload) =>
  api.put('/api/billing/gst-profile', payload).then((r) => r.data)
export const getBillingInvoices = () => api.get('/api/billing/invoices').then((r) => r.data)

export const downloadGstInvoicePdf = async (invoiceId, invoiceNumber) => {
  const res = await api.get(`/api/billing/invoices/${invoiceId}/pdf`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${invoiceNumber || `GST-Invoice-${invoiceId}`}.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
