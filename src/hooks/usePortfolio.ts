import { useCallback, useMemo, useState } from 'react'
import type { Holding, HoldingWithQuote, Market, PortfolioSummary } from '../types'
import { normalizeSymbol } from '../utils/format'
import { generateId, loadHoldings, saveHoldings } from '../utils/storage'
import { useStockPrices } from './useStockPrices'

export interface AddHoldingInput {
  symbol: string
  buyPrice: number
  quantity: number
  market: Market
}

export function usePortfolio() {
  const [holdings, setHoldings] = useState<Holding[]>(() => loadHoldings())

  const symbolList = useMemo(
    () => holdings.map((h) => ({ symbol: h.symbol, market: h.market })),
    [holdings],
  )

  const { quotes, loading, lastUpdated, error, refresh } = useStockPrices(symbolList)

  const persist = useCallback((next: Holding[]) => {
    setHoldings(next)
    saveHoldings(next)
  }, [])

  const addHolding = useCallback(
    (input: AddHoldingInput) => {
      const normalized = normalizeSymbol(input.symbol, input.market)
      const holding: Holding = {
        id: generateId(),
        symbol: normalized,
        buyPrice: input.buyPrice,
        quantity: input.quantity,
        market: input.market,
        createdAt: new Date().toISOString(),
      }
      persist([...holdings, holding])
    },
    [holdings, persist],
  )

  const removeHolding = useCallback(
    (id: string) => {
      persist(holdings.filter((h) => h.id !== id))
    },
    [holdings, persist],
  )

  const holdingsWithQuotes: HoldingWithQuote[] = useMemo(() => {
    return holdings.map((h) => {
      const quote = quotes[h.symbol]
      const costBasis = h.buyPrice * h.quantity
      const marketValue = quote ? quote.price * h.quantity : 0
      const profitLoss = quote ? marketValue - costBasis : 0
      const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0

      return {
        ...h,
        quote,
        costBasis,
        marketValue,
        profitLoss,
        profitLossPercent,
      }
    })
  }, [holdings, quotes])

  const summary: PortfolioSummary = useMemo(() => {
    const totalCost = holdingsWithQuotes.reduce((sum, h) => sum + h.costBasis, 0)
    const totalValue = holdingsWithQuotes.reduce(
      (sum, h) => sum + (h.quote ? h.marketValue : h.costBasis),
      0,
    )
    const totalProfitLoss = totalValue - totalCost
    const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

    return { totalCost, totalValue, totalProfitLoss, totalProfitLossPercent }
  }, [holdingsWithQuotes])

  return {
    holdings: holdingsWithQuotes,
    summary,
    loading,
    lastUpdated,
    error,
    addHolding,
    removeHolding,
    refresh,
  }
}
