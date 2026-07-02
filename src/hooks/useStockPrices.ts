import { useCallback, useState } from 'react'
import type { Market, QuoteMap } from '../types'

interface YahooQuote {
  symbol: string
  regularMarketPrice: number
  currency: string
}

// 定義備用的 Proxy 清單
const PROXY_LIST = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://api.allorigins.win/raw?url='
]

export function useStockPrices(symbolList: { symbol: string; market: Market }[]) {
  const [quotes, setQuotes] = useState<QuoteMap>(() => {
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

    const symbols = symbolList.map((s) => s.symbol).join(',')
    const yahooBaseUrl = 'https://query1.finance.yahoo.com/v8/finance/quote?symbols='
    const targetUrl = yahooBaseUrl + symbols

    let success = false;

    // 嘗試遍歷 Proxy 清單直到成功
    for (const proxy of PROXY_LIST) {
      try {
        const url = import.meta.env.PROD 
          ? `${proxy}${encodeURIComponent(targetUrl)}`
          : `/api/yahoo/v8/finance/quote?symbols=${symbols}`

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })

        if (!response.ok) throw new Error('Proxy 請求失敗')

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
        localStorage.setItem('stock_quotes', JSON.stringify(newQuotes))
        success = true;
        break; // 成功則跳出迴圈
      } catch (err) {
        console.warn(`Proxy ${proxy} 失敗，嘗試下一個...`)
      }
    }

    if (!success) {
      setError('無法更新股價，已顯示上次紀錄')
    }
    setLoading(false)
  }, [symbolList])

  return { quotes, loading, lastUpdated, error, refresh }
}