import type { Market } from '../types'

export function formatCurrency(value: number, currency = 'USD'): string {
  const locale = currency === 'HKD' ? 'zh-HK' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals)
}

export function normalizeSymbol(symbol: string, market: Market): string {
  const trimmed = symbol.trim().toUpperCase()
  if (market === 'HK') {
    const digits = trimmed.replace(/\D/g, '')
    if (digits) return `${digits.padStart(4, '0')}.HK`
  }
  return trimmed
}

export function displaySymbol(symbol: string, market: Market): string {
  if (market === 'HK') {
    return symbol.replace('.HK', '')
  }
  return symbol
}

export function profitLossClass(value: number): string {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}
