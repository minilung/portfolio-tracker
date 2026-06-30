import { useCallback, useState } from 'react'
import type { Market, QuoteMap } from '../types'

export function useStockPrices(symbolList: { symbol: string; market: Market }[]) {
  const [quotes, setQuotes] = useState<QuoteMap>({})
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (symbolList.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const symbols = symbolList.map((s) => s.symbol).join(',')
      
      // 【關鍵修改】：偵測是否為生產環境 (GitHub Pages)
      // import.meta.env.PROD 在 build 後會變成 true
      const isProd = import.meta.env.PROD
      const yahooBaseUrl = 'https://query1.finance.yahoo.com/v8/finance/quote?symbols='
      
      // 生產環境使用 CORS Proxy，開發環境使用本地 proxy
      const url = isProd 
        ? `https://corsproxy.io/?${encodeURIComponent(yahooBaseUrl + symbols)}`
        : `/api/yahoo/v8/finance/quote?symbols=${symbols}`

      const response = await fetch(url)
      
      if (!response.ok) throw new Error('無法取得股價')
      
      const data = await response.json()
      
      const newQuotes: QuoteMap = {}
      data.quoteResponse.result.forEach((q: any) => {
        newQuotes[q.symbol] = {
          symbol: q.symbol,
          price: q.regularMarketPrice,
          currency: q.currency,
        }
      })

      setQuotes(newQuotes)
      setLastUpdated(new Date().toISOString())
    } catch (err) {
      setError('無法取得股價，請檢查股票代碼或網絡連線')
    } finally {
      setLoading(false)
    }
  }, [symbolList])

  return { quotes, loading, lastUpdated, error, refresh }
}