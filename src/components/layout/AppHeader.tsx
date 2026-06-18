import { LogOut, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { getEstado } from '../../data/estados';
import { SesnaLogo } from './SesnaLogo';

interface AppHeaderProps {
  compact?: boolean;
}

function formatRelative(date: Date | null): string {
  if (!date) return '';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 10)  return 'hace unos segundos';
  if (diff < 60)  return `hace ${diff} s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export function AppHeader({ compact }: AppHeaderProps) {
  const { user, setUser, lastSaved, autoSaveLabel } = useApp();
  const navigate = useNavigate();
  const estado = user?.estadoId ? getEstado(user.estadoId) : null;

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <header className="bg-guinda-950 text-white h-14 flex items-center px-4 md:px-6 gap-4 shrink-0">
      <SesnaLogo size={compact ? 'header-compact' : 'header'} />

      <div className="flex-1" />

      {/* Admin nav links */}
      {user?.role === 'admin' && (
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/admin/tablero" className="text-xs text-guinda-200 hover:text-white px-2.5 py-1 rounded hover:bg-guinda-800 transition-colors">
            Tablero
          </Link>
        </nav>
      )}

      {/* Auto-save indicator */}
      {autoSaveLabel && (
        <div className="flex items-center gap-1.5 text-xs text-green-300">
          <CheckCircle2 size={13} />
          {autoSaveLabel}
        </div>
      )}
      {lastSaved && !autoSaveLabel && (
        <div className="hidden md:flex items-center gap-1.5 text-xs text-guinda-300">
          <Clock size={12} />
          Guardado {formatRelative(lastSaved)}
        </div>
      )}

      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-xs font-medium leading-tight">{user.nombre}</p>
            <p className="text-xs text-guinda-300 leading-tight">
              {estado ? estado.abrev : 'Administrador'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-guinda-200 hover:text-white transition-colors px-2 py-1 rounded hover:bg-guinda-800"
          >
            <LogOut size={14} />
            <span className="hidden md:block">Salir</span>
          </button>
        </div>
      )}
    </header>
  );
}
