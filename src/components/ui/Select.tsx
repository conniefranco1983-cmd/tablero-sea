import type { SelectHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, required, error, hint, options, placeholder, id, className = '', ...props }: SelectProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className={`field-label ${required ? 'field-required' : ''}`}>
        {label}
        {!required && <span className="ml-1 text-gray-400 font-normal text-xs">(Opcional)</span>}
      </label>
      <select
        id={inputId}
        {...props}
        className={`w-full border rounded-lg px-3 py-2 text-sm bg-white transition-colors focus:outline-none focus:ring-1 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
            : 'border-gray-300 focus:border-guinda-700 focus:ring-guinda-700'
        } ${props.disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''} ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && (
        <p className="field-error">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
      {hint && !error && <p className="field-hint">{hint}</p>}
    </div>
  );
}
