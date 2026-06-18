import { Textarea } from '../ui/Input';
import type { BloqueLData } from '../../types';

interface Props {
  data: BloqueLData;
  onChange?: (patch: Partial<BloqueLData>) => void;
  readOnly?: boolean;
}

export function BloqueL({ data, onChange, readOnly }: Props) {
  const set = (patch: Partial<BloqueLData>) => !readOnly && onChange?.(patch);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Espacio de texto libre para compartir experiencias, avances o buenas prácticas del sistema estatal que puedan ser de utilidad para otras entidades o para el informe nacional.
      </p>

      <div className="card p-5">
        <Textarea
          label="Experiencias subnacionales"
          value={data.experiencias}
          onChange={e => set({ experiencias: e.target.value })}
          readOnly={readOnly}
          rows={6}
          placeholder="Describa aquí experiencias, avances o buenas prácticas relevantes del período. Por ejemplo: intercambios con otros sistemas estatales, implementaciones exitosas, lecciones aprendidas..."
          hint="Máximo 2,000 caracteres"
        />
      </div>

      <div className="card p-5">
        <Textarea
          label="Notas y observaciones adicionales"
          value={data.notas}
          onChange={e => set({ notas: e.target.value })}
          readOnly={readOnly}
          rows={4}
          placeholder="Cualquier observación que desee comunicar a la Secretaría Ejecutiva del Sistema Nacional Anticorrupción sobre el período de reporte..."
          hint="Esta sección no es pública y es de uso interno de la Secretaría Ejecutiva del Sistema Nacional Anticorrupción."
        />
      </div>
    </div>
  );
}
