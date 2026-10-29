import { useRef } from 'react';
import { cn } from '../lib/utils';

export default function CodeInput({ value = '', onChange, length = 6, error }) {
  const refs = useRef([]);
  const chars = value.padEnd(length, ' ').slice(0, length).split('');

  const setChar = (idx, char) => {
    if (!/^\d?$/.test(char)) return;
    const arr = value.padEnd(length, ' ').slice(0, length).split('');
    arr[idx] = char || ' ';
    onChange(arr.join('').replace(/ /g, '').trimEnd());
  };

  const handleKeyDown = (idx) => (e) => {
    if (e.key === 'Backspace' && !chars[idx].trim() && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    const next = Math.min(pasted.length, length - 1);
    refs.current[next]?.focus();
  };

  return (
    <div className="flex gap-2 justify-between" onPaste={handlePaste}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (refs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={chars[idx].trim()}
          onChange={(e) => {
            setChar(idx, e.target.value);
            if (e.target.value && idx < length - 1) {
              refs.current[idx + 1]?.focus();
            }
          }}
          onKeyDown={handleKeyDown(idx)}
          className={cn(
            'w-12 h-14 text-center text-xl font-semibold rounded-lg border bg-white',
            'focus-ring transition-colors',
            error ? 'border-danger' : 'border-ink-300'
          )}
        />
      ))}
    </div>
  );
}