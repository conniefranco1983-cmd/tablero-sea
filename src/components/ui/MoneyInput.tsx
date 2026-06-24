import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface MoneyInputProps {
  label: string;
  value: number | '';
  onChange: (v: number | '') => void;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
}

function formatMXN(n: number): string {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function MoneyInput({ label, value, onChange, required, error, hint, disabled, readOnly, id }: MoneyInputProps) {
  const [focused, setFocused] = useState(false);
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  const displayValue = focused
    ? (value === '' ? '' : String(value))
    : (value === '' ? '' : formatMXN(Number(value)));

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className={`field-label ${required ? 'field-required' : ''}`}>
        {label}
        {!required && <span className="ml-1 text-gray-400 font-normal text-xs">(Opcional)</span>}
      </label>
      <div className={`flex items-center border rounded-lg overflow-hidden transition-colors ${
        error
          ? 'border-red-400 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-400'
          : 'border-gray-300 focus-within:border-guinda-700 focus-within:ring-1 focus-within:ring-guinda-700'
      } ${readOnly ? 'bg-gray-50' : 'bg-white'} ${disabled ? 'bg-gray-50 opacity-60' : ''}`}>
        <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border-r border-gray-200 select-none">$</span>
        <input
          id={inputId}
          type={focused ? 'number' : 'text'}
          min={0}
          step={0.01}
          value={displayValue}
          readOnly={readOnly}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={e => {
            const raw = e.target.value;
            if (raw === '') { onChange(''); return; }
            const n = Number(raw);
            if (Number.isNaN(n)) return;
            // El atributo min={0} no impide teclear negativos; lo acotamos aquí.
            onChange(n < 0 ? 0 : n);
          }}
          className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none disabled:cursor-not-allowed"
        />
        <span className="px-3 py-2 text-xs text-gray-400 select-none">MXN</span>
      </div>
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
