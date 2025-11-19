import { useMemo, useState } from "react";
import { useSicae } from "../context/SicaeContext";
import type { ResultadoAcceso } from "../types";

export function EventosPage() {
  const { eventos } = useSicae();
  const [resultado, setResultado] = useState<ResultadoAcceso | "">("");

  const filtrados = useMemo(() => {
    return eventos.filter((e) => (resultado ? e.resultado === resultado : true));
  }, [eventos, resultado]);

  return (
    <div className="panel">
      <div className="panel-title">Bitácora y reportes</div>
      <div className="grid two-columns">
        <label>
          Resultado
          <select value={resultado} onChange={(e) => setResultado(e.target.value as ResultadoAcceso | "")}>
            <option value="">Todos</option>
            <option value="PERMITIDO">Permitido</option>
            <option value="DENEGADO">Denegado</option>
            <option value="PENDIENTE">Pendiente</option>
          </select>
        </label>
        <div />
      </div>

      <div className="table">
        <div className="table-header">
          <span>Fecha</span>
          <span>Resultado</span>
          <span>Motivo</span>
        </div>
        {filtrados.map((ev) => (
          <div key={ev.id} className={`table-row ${ev.resultado === "PERMITIDO" ? "success" : "error"}`}>
            <span>{new Date(ev.fechaHora).toLocaleString()}</span>
            <span>{ev.resultado}</span>
            <span>{ev.motivo}</span>
          </div>
        ))}
        {!filtrados.length && <p className="muted small">Sin eventos para los filtros seleccionados.</p>}
      </div>
    </div>
  );
}
