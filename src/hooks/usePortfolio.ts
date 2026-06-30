import { useState, useMemo, useCallback } from 'react'
import { useStockPrices } from './useStockPrices'
import { loadHoldings, saveHoldings } from '../utils/storage'
import type { Holding, HoldingWithQuote, PortfolioSummary, Market } from '../types'

export interface AddHoldingInput {
  symbol: string
  buyPrice: number
  quantity: number
  market: Market
}

export function usePortfolio() {
  const [holdings, setHoldings] = useState<Holding[]>(() => loadHoldings())

  const symbolList = useMemo(() => 
    holdings.map(h => ({ symbol: h.symbol, market: h.market })), 
  [holdings])

  // 接收 quotes 供後續計算使用
  const { quotes, loading, lastUpdated, error, refresh } = useStockPrices(symbolList)

  // 定義 holdingsWithQuotes (修復了找不到變數的問題)
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

  // 定義 summary (修復了 Property 'summary' missing initializer 的問題)
  const summary: PortfolioSummary = useMemo(() => {
    const totalCost = holdingsWithQuotes.reduce((sum, h) => sum + h.costBasis, 0)
    const totalValue = holdingsWithQuotes.reduce((sum, h) => sum + h.marketValue, 0)
    const totalProfitLoss = totalValue - totalCost
    const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0
    return { totalCost, totalValue, totalProfitLoss, totalProfitLossPercent }
  }, [holdingsWithQuotes])

  const addHolding = useCallback((input: AddHoldingInput) => {
    const newHolding: Holding = {
      id: Math.random().toString(36).substring(2, 9),
      symbol: input.symbol,
      buyPrice: input.buyPrice,
      quantity: input.quantity,
      market: input.market,
      createdAt: new Date().toISOString(),
    }
    const next = [...holdings, newHolding]
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