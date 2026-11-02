import { useEffect } from 'react';
import { useCurrencyRates } from '../hooks/useService';
import { useCurrencyStore } from '../stores/currencyStore';

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrencyStore();
  const { data } = useCurrencyRates();

  const supported = data?.supported || ['USD'];
  const rates = data?.rates || {};

  useEffect(() => {
    if (data?.supported && !data.supported.includes(currency)) {
      setCurrency('USD');
    }
  }, [data?.supported, currency, setCurrency]);

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Currency
      </label>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        {supported.map((c) => (
          <option key={c} value={c}>
            {c}
            {c !== 'USD' && rates[c] ? ` · ${(1 / rates[c]).toFixed(2)}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}