import type { PortfolioSummary } from '../types'
import { formatCurrency, formatPercent, profitLossClass } from '../utils/format'

interface SummaryCardsProps {
  summary: PortfolioSummary
  primaryCurrency: string
}

export function SummaryCards({ summary, primaryCurrency }: SummaryCardsProps) {
  const plClass = profitLossClass(summary.totalProfitLoss)

  return (
    <section className="summary-grid">
      <article className="summary-card">
        <span className="summary-label">總成本</span>
        <span className="summary-value">{formatCurrency(summary.totalCost, primaryCurrency)}</span>
      </article>
      <article className="summary-card">
        <span className="summary-label">現時市值</span>
        <span className="summary-value">{formatCurrency(summary.totalValue, primaryCurrency)}</span>
      </article>
      <article className={`summary-card summary-card--highlight ${plClass}`}>
        <span className="summary-label">總盈虧</span>
        <span className="summary-value">
          {formatCurrency(summary.totalProfitLoss, primaryCurrency)}
        </span>
        <span className="summary-sub">{formatPercent(summary.totalProfitLossPercent)}</span>
      </article>
    </section>
  )
}
