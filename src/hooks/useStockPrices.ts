import { useCallback, useState } from 'react'
import type { Market, QuoteMap } from '../types'

interface YahooQuote {
  symbol: string
  regularMarketPrice: number
  currency: string
}

export function useStockPrices(symbolList: { symbol: string; market: Market }[]) {
  const [quotes, setQuotes] = useState<QuoteMap>(() => {
    // 初始化時嘗試從 localStorage 讀取舊資料
    const saved = localStorage.getItem('stock_quotes')
    return saved ? JSON.parse(saved) : {}
  })
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (symbolList.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const symbols = symbolList.map((s) => s.symbol).join(',')
      const isProd = import.meta.env.PROD
      const yahooBaseUrl = 'https://query1.finance.yahoo.com/v8/finance/quote?symbols='
      
      // 使用更穩定的 Proxy，並加入 Headers 偽裝請求
      const url = isProd 
        ? `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(yahooBaseUrl + symbols)}`
        : `/api/yahoo/v8/finance/quote?symbols=${symbols}`

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      if (!response.ok) throw new Error('無法取得股價')
      
      const data = await response.json()
      
      if (!data.quoteResponse?.result) throw new Error('資料格式錯誤')

      const newQuotes: QuoteMap = {}
      data.quoteResponse.result.forEach((q: YahooQuote) => {
        newQuotes[q.symbol] = {
          symbol: q.symbol,
          price: q.regularMarketPrice,
          currency: q.currency,
        }
      })

      setQuotes(newQuotes)
      setLastUpdated(new Date().toISOString())
      // 存入快取
      localStorage.setItem('stock_quotes', JSON.stringify(newQuotes))
    } catch (err) {
      console.error(err)
      // 顯示錯誤，但保留舊的 quotes 顯示
      setError('無法更新股價，已顯示上次紀錄')
    } finally {
      setLoading(false)
    }
  }, [symbolList])

  return { quotes, loading, lastUpdated, error, refresh }
}
