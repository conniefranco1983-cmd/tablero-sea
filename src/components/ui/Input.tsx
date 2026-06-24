import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';
import { validarCorreo, validarUrl, validarTelefono, soloDigitos } from '../../lib/validation';

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export function FieldWrapper({ label, required, error, hint, children, htmlFor }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className={`field-label ${required ? 'field-required' : ''}`}>
        {label}
        {!required && <span className="ml-1 text-gray-400 font-normal text-xs">(Opcional)</span>}
      </label>
      {children}
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

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export function TextInput({ label, required, error, hint, id, className = '', ...props }: TextInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint} htmlFor={inputId}>
      <input
        id={inputId}
        {...props}
        className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
            : 'border-gray-300 focus:border-guinda-700 focus:ring-guinda-700'
        } ${props.readOnly ? 'bg-gray-50 text-gray-500' : 'bg-white'} ${props.disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''} ${className}`}
      />
    </FieldWrapper>
  );
}

// Campos con formato. Aplican validación adicional en JS (además de la nativa de
// HTML5) y muestran el error en el `FieldWrapper`. Si el consumidor pasa un
// `error` propio, ese tiene prioridad sobre la validación de formato.

const asString = (v: TextInputProps['value']): string => (typeof v === 'string' ? v : v == null ? '' : String(v));

export function EmailInput({ value, error, ...props }: TextInputProps) {
  return (
    <TextInput
      inputMode="email"
      autoComplete="email"
      {...props}
      type="email"
      value={value}
      error={error ?? validarCorreo(asString(value))}
    />
  );
}

export function UrlInput({ value, error, placeholder, ...props }: TextInputProps) {
  return (
    <TextInput
      inputMode="url"
      placeholder={placeholder ?? 'https://'}
      {...props}
      type="url"
      value={value}
      error={error ?? validarUrl(asString(value))}
    />
  );
}

export function PhoneInput({ value, error, onChange, ...props }: TextInputProps) {
  return (
    <TextInput
      inputMode="numeric"
      autoComplete="tel"
      maxLength={10}
      {...props}
      type="tel"
      value={value}
      error={error ?? validarTelefono(asString(value))}
      onChange={e => {
        // Restringe la captura a dígitos antes de propagar el cambio.
        const sanitized = soloDigitos(e.target.value);
        if (sanitized !== e.target.value) e.target.value = sanitized;
        onChange?.(e);
      }}
    />
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export function Textarea({ label, required, error, hint, id, className = '', ...props }: TextareaProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint} htmlFor={inputId}>
      <textarea
        id={inputId}
        rows={4}
        {...props}
        className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1 resize-none ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
            : 'border-gray-300 focus:border-guinda-700 focus:ring-guinda-700'
        } ${props.readOnly ? 'bg-gray-50 text-gray-500' : 'bg-white'} ${props.disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''} ${className}`}
      />
    </FieldWrapper>
  );
}

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value: number | '';
  onChange: (v: number | '') => void;
}

export function NumberInput({ label, required, error, hint, value, onChange, id, className = '', min = 0, ...props }: NumberInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  // El piso (`min`, 0 por defecto) se aplica también en JS: el atributo `min` de
  // HTML5 no impide teclear valores negativos, solo la validación nativa (que
  // aquí nunca corre porque no hay <form> con submit). Acotamos en el onChange.
  const floor = typeof min === 'number' ? min : Number(min);
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint} htmlFor={inputId}>
      <input
        id={inputId}
        type="number"
        min={min}
        value={value === '' ? '' : value}
        onChange={e => {
          const raw = e.target.value;
          if (raw === '') { onChange(''); return; }
          const n = Number(raw);
          if (Number.isNaN(n)) return;
          onChange(!Number.isNaN(floor) && n < floor ? floor : n);
        }}
        {...props}
        className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
            : 'border-gray-300 focus:border-guinda-700 focus:ring-guinda-700'
        } ${props.disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'} ${className}`}
      />
    </FieldWrapper>
  );
}
