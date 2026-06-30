import './App.css'
import { HashRouter as Router } from 'react-router-dom'
import { AddHoldingForm } from './components/AddHoldingForm'
import { HoldingsTable } from './components/HoldingsTable'
import { SummaryCards } from './components/SummaryCards'
import { usePortfolio } from './hooks/usePortfolio'
import type { HoldingWithQuote } from './types'

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('zh-HK', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default function App() {
  // 這裡解構了所有需要的變數
  const { holdings, summary, loading, lastUpdated, error, addHolding, removeHolding, refresh } =
    usePortfolio()

  const primaryCurrency =
    holdings.find((h: HoldingWithQuote) => h.quote)?.quote?.currency ??
    (holdings[0]?.market === 'HK' ? 'HKD' : 'USD')

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-main">
            <h1 className="header-title">投資組合追蹤器</h1>
            
            {/* 1. 這裡使用了 lastUpdated 和 formatTime */}
            <p className="last-updated">
              最後更新：{formatTime(lastUpdated)}
            </p>
          </div>
          
          <button onClick={refresh} disabled={loading}>
            {loading ? '更新中...' : '立即更新'}
          </button>
        </header>

        {/* 2. 這裡使用了 error */}
        {error && <div className="alert alert--error">{error}</div>}

        <main className="main">
          <AddHoldingForm onAdd={addHolding} />
          {holdings.length > 0 && (
            <SummaryCards summary={summary} primaryCurrency={primaryCurrency} />
          )}
          <HoldingsTable holdings={holdings} onRemove={removeHolding} loading={loading} />
        </main>
      </div>
    </Router>
  )
}