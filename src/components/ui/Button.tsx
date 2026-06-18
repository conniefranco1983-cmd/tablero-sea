import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-guinda-950 text-white hover:bg-guinda-800 focus-visible:ring-guinda-950 disabled:bg-guinda-200 disabled:text-guinda-400',
  secondary: 'border border-guinda-950 text-guinda-950 hover:bg-guinda-50 focus-visible:ring-guinda-950 disabled:border-gray-300 disabled:text-gray-400',
  tertiary:  'text-guinda-950 hover:bg-guinda-50 focus-visible:ring-guinda-950 disabled:text-gray-400',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-200',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
};

export function Button({ variant = 'primary', size = 'md', loading = false, icon, children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
