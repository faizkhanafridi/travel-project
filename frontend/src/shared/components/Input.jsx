import { forwardRef } from 'react';
import { cn } from '../lib/utils';

const Input = forwardRef(function Input(
  { label, error, hint, className, id, required, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block mb-1.5 text-sm font-medium text-ink-800"
        >
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full h-11 rounded-lg border bg-white px-3 text-sm text-ink-900 placeholder:text-ink-500',
          'focus-ring transition-colors',
          error ? 'border-danger' : 'border-ink-300',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Input;