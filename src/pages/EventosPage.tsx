import { useMemo, useState } from "react";
import { useSicae } from "../context/SicaeContext";
import type { ResultadoAcceso } from "../types";

export function EventosPage() {
  const { eventos, personas, puntos, user } = useSicae();
  const [resultado, setResultado] = useState<ResultadoAcceso | "">("");

  const personaMap = useMemo(
    () => personas.reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.id]: p.nombreCompleto }), {}),
    [personas]
  );
  const puntoMap = useMemo(
    () => puntos.reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.id]: `${p.nombre} · ${p.ubicacion}` }), {}),
    [puntos]
  );

  const filtrados = useMemo(() => {
    return eventos.filter((e) => (resultado ? e.resultado === resultado : true));
  }, [eventos, resultado]);

  if (user?.rol !== "ADMIN" && user?.rol !== "SEGURIDAD") {
    return (
      <div className="panel">
        <div className="panel-title">Acceso restringido</div>
        <p className="muted small">Solo Seguridad o Administrador pueden ver la bitácora.</p>
      </div>
    );
  }

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
          <span>Persona</span>
          <span>Punto</span>
          <span>Resultado</span>
          <span>Tipo</span>
          <span>Motivo / Detalle</span>
        </div>
        {filtrados.map((ev) => (
          <div key={ev.id} className={`table-row ${ev.resultado === "PERMITIDO" ? "success" : "error"}`}>
            <span>{new Date(ev.fechaHora).toLocaleString()}</span>
            <span>{ev.personaId ? personaMap[ev.personaId] ?? "N/D" : "N/D"}</span>
            <span>{ev.puntoAccesoId ? puntoMap[ev.puntoAccesoId] ?? ev.puntoAccesoId : "N/D"}</span>
            <span>{ev.resultado}</span>
            <span>{ev.tipoEvento ?? "N/D"}</span>
            <span>{ev.motivo}</span>
          </div>
        ))}
        {!filtrados.length && <p className="muted small">Sin eventos para los filtros seleccionados.</p>}
      </div>
    </div>
  );
}
