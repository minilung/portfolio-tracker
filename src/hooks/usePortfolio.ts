import { useState, useMemo, useCallback } from 'react'
import { useStockPrices } from './useStockPrices'
import { loadHoldings, saveHoldings } from '../utils/storage'
import type { Holding, HoldingWithQuote, PortfolioSummary } from '../types'

export function usePortfolio() {
  const [holdings, setHoldings] = useState<Holding[]>(() => loadHoldings())

  const symbolList = useMemo(() => 
    holdings.map(h => ({ symbol: h.symbol, market: h.market })), 
  [holdings])

  const { quotes, loading, lastUpdated, error, refresh } = useStockPrices(symbolList)

  const holdingsWithQuotes: HoldingWithQuote[] = useMemo(() => {
    return holdings.map(h => {
      const quote = quotes[h.symbol]
      const costBasis = h.buyPrice * h.quantity
      const marketValue = quote ? quote.price * h.quantity : 0
      const profitLoss = quote ? marketValue - costBasis : 0
      const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0
      
      return {
        ...h,
        quote: quote ? { symbol: quote.symbol, price: quote.price, currency: quote.currency } : undefined,
        costBasis,
        marketValue,
        profitLoss,
        profitLossPercent
      }
    })
  }, [holdings, quotes])

  const summary: PortfolioSummary = useMemo(() => {
    const totalCost = holdingsWithQuotes.reduce((sum, h) => sum + h.costBasis, 0)
    const totalValue = holdingsWithQuotes.reduce((sum, h) => sum + h.marketValue, 0)
    const totalProfitLoss = totalValue - totalCost
    const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0
    return { totalCost, totalValue, totalProfitLoss, totalProfitLossPercent }
  }, [holdingsWithQuotes])

  const addHolding = useCallback((holding: Holding) => {
    const next = [...holdings, holding]
    setHoldings(next)
    saveHoldings(next)
  }, [holdings])

  const removeHolding = useCallback((id: string) => {
    const next = holdings.filter(h => h.id !== id)
    setHoldings(next)
    saveHoldings(next)
  }, [holdings])

  return {
    holdings: holdingsWithQuotes,
    summary,
    loading,
    lastUpdated,
    error,
    refresh,
    addHolding,
    removeHolding
  }
}