import './App.css'
import { HashRouter as Router } from 'react-router-dom'
import { AddHoldingForm } from './components/AddHoldingForm'
import { HoldingsTable } from './components/HoldingsTable'
import { SummaryCards } from './components/SummaryCards'
import { usePortfolio } from './hooks/usePortfolio'

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('zh-HK', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function App() {
  const { holdings, summary, loading, lastUpdated, error, addHolding, removeHolding, refresh } =
    usePortfolio()

  const primaryCurrency =
    holdings.find((h) => h.quote)?.quote?.currency ??
    (holdings[0]?.market === 'HK' ? 'HKD' : 'USD')

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-main">
            <h1 className="header-title">投資組合追蹤器</h1>
            <p className="header-subtitle">追蹤持股、即時計算盈虧</p>
          </div>
          <div className="header-actions">
            <span className="last-updated">
              最後更新：{formatTime(lastUpdated)}
              {loading && <span className="loading-dot" />}
            </span>
            <button 
              type="button" 
              className="btn btn--secondary" 
              onClick={refresh} 
              disabled={loading}
            >
              {loading ? '更新中…' : '立即更新'}
            </button>
          </div>
        </header>

        {error && <div className="alert alert--warning">{error}</div>}

        <main className="main">
          <AddHoldingForm onAdd={addHolding} />
          {holdings.length > 0 && (
            <SummaryCards summary={summary} primaryCurrency={primaryCurrency} />
          )}
          <HoldingsTable holdings={holdings} onRemove={removeHolding} loading={loading} />
        </main>

        <footer className="footer">
          <p>股價每 30 秒自動更新 · 資料來源 Yahoo Finance · 僅供參考，不構成投資建議</p>
        </footer>
      </div>
    </Router>
  )
}