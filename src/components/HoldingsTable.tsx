import type { HoldingWithQuote } from '../types'
import {
  displaySymbol,
  formatCurrency,
  formatNumber,
  formatPercent,
  profitLossClass,
} from '../utils/format'

interface HoldingsTableProps {
  holdings: HoldingWithQuote[]
  onRemove: (id: string) => void
  loading: boolean
}

export function HoldingsTable({ holdings, onRemove, loading }: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <section className="panel holdings-panel">
        <h2 className="panel-title">持股明細</h2>
        <div className="empty-state">
          <p>尚未加入任何持股</p>
          <p className="empty-state-hint">喺上面輸入股票代碼同買入價，開始追蹤你嘅投資組合</p>
        </div>
      </section>
    )
  }

  return (
    <section className="panel holdings-panel">
      <h2 className="panel-title">持股明細</h2>
      <div className="table-wrap">
        <table className="holdings-table">
          <thead>
            <tr>
              <th>代碼</th>
              <th>市場</th>
              <th className="num">買入價</th>
              <th className="num">現價</th>
              <th className="num">數量</th>
              <th className="num">成本</th>
              <th className="num">市值</th>
              <th className="num">盈虧</th>
              <th className="num">%</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => {
              const currency = h.quote?.currency ?? (h.market === 'HK' ? 'HKD' : 'USD')
              const plClass = profitLossClass(h.profitLoss)
              const hasQuote = !!h.quote

              return (
                <tr key={h.id} className={loading && !hasQuote ? 'row-loading' : ''}>
                  <td className="symbol-cell">{displaySymbol(h.symbol, h.market)}</td>
                  <td>
                    <span className="market-badge">{h.market === 'HK' ? '港股' : '美股'}</span>
                  </td>
                  <td className="num">{formatCurrency(h.buyPrice, currency)}</td>
                  <td className="num">
                    {hasQuote ? (
                      formatCurrency(h.quote!.price, currency)
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="num">{formatNumber(h.quantity, 0)}</td>
                  <td className="num">{formatCurrency(h.costBasis, currency)}</td>
                  <td className="num">
                    {hasQuote ? (
                      formatCurrency(h.marketValue, currency)
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className={`num ${plClass}`}>
                    {hasQuote ? formatCurrency(h.profitLoss, currency) : '—'}
                  </td>
                  <td className={`num ${plClass}`}>
                    {hasQuote ? formatPercent(h.profitLossPercent) : '—'}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => onRemove(h.id)}
                      title="移除"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
