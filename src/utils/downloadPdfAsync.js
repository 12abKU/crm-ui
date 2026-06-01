import api from '../api'

const POLL_MS = 1500
const MAX_WAIT_MS = 5 * 60 * 1000

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Start async PDF job, poll until READY, then download blob.
 * @param {object} opts
 * @param {string} opts.startUrl - POST url to start job
 * @param {string} opts.statusUrl - GET url template with {jobId}
 * @param {string} opts.downloadUrl - GET url template with {jobId}
 */
export async function downloadPdfAsync({ startUrl, statusUrl, downloadUrl, onProgress }) {
    const startRes = await api.post(startUrl)
    const jobId = startRes.data?.jobId
    if (!jobId) throw new Error('PDF job did not return a job id')

    const started = Date.now()
    while (Date.now() - started < MAX_WAIT_MS) {
        const statusRes = await api.get(statusUrl(jobId))
        const status = statusRes.data?.status
        if (onProgress) onProgress(status)

        if (status === 'READY') {
            const blobRes = await api.get(downloadUrl(jobId), { responseType: 'blob' })
            return {
                blob: blobRes.data,
                filename: statusRes.data?.filename || 'report.pdf',
            }
        }
        if (status === 'FAILED') {
            throw new Error(statusRes.data?.error || 'PDF generation failed')
        }
        await sleep(POLL_MS)
    }
    throw new Error('PDF generation timed out')
}

export async function openPdfAsync(opts) {
    const { blob } = await downloadPdfAsync(opts)
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
    window.open(url, '_blank')
    setTimeout(() => window.URL.revokeObjectURL(url), 60_000)
}

export function savePdfBlob(blob, filename) {
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
}
