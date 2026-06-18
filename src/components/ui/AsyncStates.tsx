import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export function Loading({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" />
        {label}
      </div>
    </div>
  );
}

export function LoadError({ message = 'No se pudieron cargar los datos.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle size={28} className="text-amber-500 mx-auto mb-3" />
        <p className="text-sm text-gray-600">{message}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}
