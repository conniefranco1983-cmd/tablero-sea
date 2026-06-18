import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const CONFIG = {
  success: { icon: CheckCircle2, classes: 'bg-green-50 border-green-200 text-green-800' },
  error:   { icon: XCircle,      classes: 'bg-red-50 border-red-200 text-red-800' },
  warning: { icon: AlertTriangle, classes: 'bg-amber-50 border-amber-200 text-amber-800' },
  info:    { icon: Info,         classes: 'bg-blue-50 border-blue-200 text-blue-800' },
};

export function ToastContainer() {
  const { toasts, removeToast } = useApp();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(t => {
        const { icon: Icon, classes } = CONFIG[t.type];
        return (
          <div key={t.id} className={`animate-slide-in flex items-start gap-3 px-4 py-3 rounded-xl border shadow-md ${classes}`}>
            <Icon size={16} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-sm">{t.message}</p>
            <button onClick={() => removeToast(t.id)} className="shrink-0 hover:opacity-70">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
