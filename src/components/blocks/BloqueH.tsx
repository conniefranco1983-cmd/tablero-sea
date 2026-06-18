import { Toggle } from '../ui/Toggle';
import { NumberInput, Textarea } from '../ui/Input';
import type { BloqueHData } from '../../types';

interface Props {
  data: BloqueHData;
  onChange?: (patch: Partial<BloqueHData>) => void;
  readOnly?: boolean;
}

export function BloqueH({ data, onChange, readOnly }: Props) {
  const set = (patch: Partial<BloqueHData>) => !readOnly && onChange?.(patch);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Informe sobre el estado de la plataforma de capacitación, los cursos disponibles y los servidores públicos capacitados durante el período.
      </p>

      <div className="card p-5">
        <Toggle
          label="¿La SESEA cuenta con plataforma de capacitación en línea?"
          value={data.tiene_plataforma}
          onChange={v => set({ tiene_plataforma: v })}
          required
          disabled={readOnly}
        />
      </div>

      {data.tiene_plataforma === true && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="card p-5">
              <NumberInput
                label="N.º de cursos vigentes"
                value={data.num_cursos_vigentes}
                onChange={v => set({ num_cursos_vigentes: v })}
                required
                disabled={readOnly}
                hint="Cursos activos al cierre del período"
                min={0}
              />
            </div>
            <div className="card p-5">
              <NumberInput
                label="Número de servidores públicos que concluyeron al menos un curso de capacitación en materia anticorrupción durante el trimestre que concluye."
                value={data.num_servidores_capacitados}
                onChange={v => set({ num_servidores_capacitados: v })}
                required
                disabled={readOnly}
                hint="Total acumulado durante el período"
                min={0}
              />
            </div>
          </div>

          <div className="card p-5">
            <Textarea
              label="Temas de los cursos disponibles en la plataforma de capacitación"
              value={data.temas_cursos}
              onChange={e => set({ temas_cursos: e.target.value })}
              required
              readOnly={readOnly}
              rows={3}
              placeholder="Liste los temas que cubren los cursos disponibles..."
            />
          </div>
        </>
      )}
    </div>
  );
}
