import { useApp } from '../../contexts/AppContext';
import { BLOQUES } from '../../data/bloques';
import type { BloqueInfo, BloqueKey, BloqueStatus } from '../../types';

interface FormSidebarProps {
  bloqueStatuses: Record<string, BloqueStatus>;
  readOnly?: boolean;
  onSelectBloque?: (key: BloqueKey) => void;
  bloques?: BloqueInfo[];
  // Color del punto de la sección de consolidación ('I'): se deriva del nivel
  // (no del avance), o gris si el Bloque H no se ha iniciado.
  consolidacionDot?: string;
}

const statusDot: Record<BloqueStatus, string> = {
  completo:    'bg-green-500',
  incompleto:  'bg-amber-400',
  no_iniciado: 'bg-gray-300',
};

export function FormSidebar({ bloqueStatuses, onSelectBloque, bloques = BLOQUES, consolidacionDot }: FormSidebarProps) {
  const { activeBloque, setActiveBloque } = useApp();
  const handleSelect = (key: BloqueKey) => {
    if (onSelectBloque) onSelectBloque(key);
    else setActiveBloque(key);
  };

  return (
    <nav className="w-64 shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Secciones</p>
      </div>
      <ul className="py-2">
        {bloques.map(bloque => {
          const status: BloqueStatus = bloqueStatuses[bloque.key] ?? 'no_iniciado';
          const isActive = activeBloque === bloque.key;
          const dot = bloque.key === 'I' && consolidacionDot ? consolidacionDot : statusDot[status];
          return (
            <li key={bloque.key}>
              <button
                onClick={() => handleSelect(bloque.key as BloqueKey)}
                className={`w-full text-left px-4 py-2.5 flex items-start gap-3 transition-colors group ${
                  isActive
                    ? 'bg-guinda-50 border-r-2 border-guinda-950'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mt-0.5 shrink-0">
                  <span className={`text-xs font-bold w-5 h-5 rounded flex items-center justify-center ${
                    isActive ? 'bg-guinda-950 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {bloque.displayKey ?? bloque.key}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-medium leading-snug ${isActive ? 'text-guinda-950' : 'text-gray-700'}`}>
                    {bloque.titulo}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
