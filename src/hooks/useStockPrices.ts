import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Market, StockQuote } from '../types'
import { normalizeSymbol } from '../utils/format'

const REFRESH_INTERVAL_MS = 30_000

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number
        currency?: string
        symbol?: string
        regularMarketChange?: number
        regularMarketChangePercent?: number
      }
    }>
    error?: { description?: string }
  }
}

async function fetchQuote(symbol: string, market: Market): Promise<StockQuote | null> {
  const normalized = normalizeSymbol(symbol, market)
  const url = `/api/yahoo/v8/finance/chart/${encodeURIComponent(normalized)}?interval=1d&range=1d`

  try {
    const res = await fetch(url)
    if (!res.ok) return null

    const data = (await res.json()) as YahooChartResponse
    const meta = data.chart?.result?.[0]?.meta
    if (!meta?.regularMarketPrice) return null

    return {
      symbol: normalized,
      price: meta.regularMarketPrice,
      currency: meta.currency ?? (market === 'HK' ? 'HKD' : 'USD'),
      change: meta.regularMarketChange ?? 0,
      changePercent: meta.regularMarketChangePercent ?? 0,
      updatedAt: new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function useStockPrices(symbols: Array<{ symbol: string; market: Market }>) {
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({})
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const symbolKey = useMemo(
    () => symbols.map((s) => `${s.market}:${normalizeSymbol(s.symbol, s.market)}`).sort().join('|'),
    [symbols],
  )

  const refresh = useCallback(async () => {
    if (symbols.length === 0) {
      setQuotes({})
      setLastUpdated(null)
      return
    }

    setLoading(true)
    setError(null)

    const results = await Promise.all(
      symbols.map(async (s) => {
        const normalized = normalizeSymbol(s.symbol, s.market)
        const quote = await fetchQuote(s.symbol, s.market)
        return { key: normalized, quote }
      }),
    )

    const next: Record<string, StockQuote> = {}
    let failedCount = 0

    for (const { key, quote } of results) {
      if (quote) {
        next[key] = quote
      } else {
        failedCount++
      }
    }

    setQuotes(next)
    setLastUpdated(new Date().toISOString())
    setLoading(false)

    if (failedCount > 0 && failedCount === symbols.length) {
      setError('無法取得股價，請檢查股票代碼或網絡連線')
    } else if (failedCount > 0) {
      setError(`${failedCount} 隻股票無法取得報價`)
    }
  }, [symbols])

  useEffect(() => {
    refresh()
  }, [refresh, symbolKey])

  useEffect(() => {
    if (symbols.length === 0) return

    const timer = setInterval(refresh, REFRESH_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [refresh, symbols.length, symbolKey])

  return { quotes, loading, lastUpdated, error, refresh }
}
