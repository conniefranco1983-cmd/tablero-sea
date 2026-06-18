import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

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

export function NumberInput({ label, required, error, hint, value, onChange, id, className = '', ...props }: NumberInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint} htmlFor={inputId}>
      <input
        id={inputId}
        type="number"
        min={0}
        value={value === '' ? '' : value}
        onChange={e => {
          const v = e.target.value;
          onChange(v === '' ? '' : Number(v));
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
