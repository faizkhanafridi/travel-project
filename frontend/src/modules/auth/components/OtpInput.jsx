import { useEffect, useRef } from 'react';

export default function OtpInput({ value, onChange, length = 6, disabled = false, error }) {
  const refs = useRef([]);
  const digits = value.padEnd(length, ' ').split('').slice(0, length);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setDigit = (index, char) => {
    if (!/^\d?$/.test(char)) return;
    const next = digits.slice();
    next[index] = char || ' ';
    const joined = next.join('').replace(/\s+$/g, '');
    onChange(joined.slice(0, length));
    if (char && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKey = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index].trim() && index > 0) {
        refs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, length - 1);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div>
      <div className="flex justify-between gap-2" onPaste={handlePaste}>
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digits[i].trim()}
            onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => handleKey(i, e)}
            disabled={disabled}
            className={`w-full max-w-[52px] h-14 text-center text-xl font-bold rounded-xl border bg-white transition focus:outline-none focus:ring-4 ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
            }`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}