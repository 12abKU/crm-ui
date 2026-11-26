import api from '../api'

export async function downloadAuthenticatedCsv(endpoint, params = {}, fallbackFilename = 'export.csv') {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(item => {
                if (item != null && item !== '') query.append(key, item)
            })
        } else if (value != null && String(value).trim() !== '') {
            query.set(key, String(value).trim())
        }
    })
    const qs = query.toString()
    const url = qs ? `${endpoint}?${qs}` : endpoint
    const response = await api.get(url, { responseType: 'blob' })
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.setAttribute('download', fallbackFilename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(objectUrl)
}
