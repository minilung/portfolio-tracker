import { useState, type FormEvent } from 'react'
import type { Market } from '../types'
import type { AddHoldingInput } from '../hooks/usePortfolio'

interface AddHoldingFormProps {
  onAdd: (input: AddHoldingInput) => void
}

export function AddHoldingForm({ onAdd }: AddHoldingFormProps) {
  const [symbol, setSymbol] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [quantity, setQuantity] = useState('100')
  const [market, setMarket] = useState<Market>('HK')
  const [formError, setFormError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')

    const trimmedSymbol = symbol.trim()
    const price = parseFloat(buyPrice)
    const qty = parseFloat(quantity)

    if (!trimmedSymbol) {
      setFormError('請輸入股票代碼')
      return
    }
    if (isNaN(price) || price <= 0) {
      setFormError('請輸入有效嘅買入價')
      return
    }
    if (isNaN(qty) || qty <= 0) {
      setFormError('請輸入有效嘅持股數量')
      return
    }

    onAdd({ symbol: trimmedSymbol, buyPrice: price, quantity: qty, market })
    setSymbol('')
    setBuyPrice('')
    setQuantity('100')
  }

  return (
    <section className="panel add-form-panel">
      <h2 className="panel-title">新增持股</h2>
      <form className="add-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="form-field">
            <span>市場</span>
            <select value={market} onChange={(e) => setMarket(e.target.value as Market)}>
              <option value="HK">港股</option>
              <option value="US">美股</option>
            </select>
          </label>
          <label className="form-field form-field--grow">
            <span>股票代碼</span>
            <input
              type="text"
              placeholder={market === 'HK' ? '例如：0700、9988' : '例如：AAPL、TSLA'}
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
          </label>
        </div>
        <div className="form-row">
          <label className="form-field">
            <span>買入價</span>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
            />
          </label>
          <label className="form-field">
            <span>持股數量</span>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn--primary">
            加入組合
          </button>
        </div>
        {formError && <p className="form-error">{formError}</p>}
      </form>
    </section>
  )
}
