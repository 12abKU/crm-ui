export const SUPPORTED_CURRENCIES = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToInr: 1 },
    { code: 'USD', symbol: '$', name: 'US Dollar', rateToInr: 84.5 },
    { code: 'EUR', symbol: '€', name: 'Euro', rateToInr: 91.2 },
    { code: 'GBP', symbol: '£', name: 'British Pound', rateToInr: 107.4 },
    { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', rateToInr: 23.0 },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToInr: 63.0 },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToInr: 55.2 },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToInr: 60.5 },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToInr: 0.56 },
]

export function getCurrencyMeta(code) {
    const upper = (code || 'INR').toUpperCase()
    return SUPPORTED_CURRENCIES.find(c => c.code === upper) || SUPPORTED_CURRENCIES[0]
}

export function formatDealAmount(amount, currency = 'INR') {
    const meta = getCurrencyMeta(currency)
    const locale = meta.code === 'INR' ? 'en-IN' : 'en-US'
    return `${meta.symbol}${Number(amount || 0).toLocaleString(locale)}`
}
