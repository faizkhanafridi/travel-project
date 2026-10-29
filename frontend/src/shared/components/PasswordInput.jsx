import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

const PasswordInput = forwardRef(function PasswordInput(
  { label, error, hint, className, id, required, ...props },
  ref
) {
  const [show, setShow] = useState(false);
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
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={show ? 'text' : 'password'}
          className={cn(
            'w-full h-11 rounded-lg border bg-white px-3 pr-10 text-sm text-ink-900 placeholder:text-ink-500',
            'focus-ring transition-colors',
            error ? 'border-danger' : 'border-ink-300',
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-2 grid place-items-center text-ink-500 hover:text-ink-800"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

export default PasswordInput;