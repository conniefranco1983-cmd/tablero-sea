import { AlertCircle } from 'lucide-react';

interface ToggleProps {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
}

export function Toggle({ label, value, onChange, required, error, hint, disabled }: ToggleProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className={`field-label ${required ? 'field-required' : ''}`}>{label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(true)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-guinda-700 ${
            value === true
              ? 'bg-guinda-950 text-white border-guinda-950'
              : 'bg-white text-gray-600 border-gray-300 hover:border-guinda-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Sí
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(false)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-guinda-700 ${
            value === false
              ? 'bg-gray-700 text-white border-gray-700'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          No
        </button>
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
