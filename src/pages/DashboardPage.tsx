import { useMemo } from "react";
import { useSicae } from "../context/SicaeContext";

export function DashboardPage() {
  const { personas, credenciales, eventos, puntos } = useSicae();

  const stats = useMemo(
    () => [
      { label: "Personas", value: personas.length },
      { label: "Credenciales activas", value: credenciales.filter((c) => c.estado === "ACTIVA").length },
      { label: "Puntos de acceso", value: puntos.length },
      { label: "Eventos registrados", value: eventos.length },
    ],
    [personas.length, credenciales, puntos.length, eventos.length]
  );

  const personaMap = useMemo(
    () => personas.reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.id]: p.nombreCompleto }), {}),
    [personas]
  );
  const puntoMap = useMemo(
    () => puntos.reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.id]: `${p.nombre} · ${p.ubicacion}` }), {}),
    [puntos]
  );

  const recientes = useMemo(() => eventos.slice(0, 6), [eventos]);

  return (
    <div className="grid two-columns">
      <div className="panel">
        <div className="panel-title">Resumen rápido</div>
        <div className="cards">
          {stats.map((s) => (
            <div key={s.label} className="card-stats">
              <p className="muted small">{s.label}</p>
              <h2>{s.value}</h2>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Bitácora reciente</div>
        <div className="table">
          <div className="table-header">
            <span>Fecha</span>
            <span>Persona</span>
            <span>Punto</span>
            <span>Resultado</span>
            <span>Tipo</span>
            <span>Motivo</span>
          </div>
          {recientes.map((ev) => (
            <div key={ev.id} className={`table-row ${ev.resultado === "PERMITIDO" ? "success" : "error"}`}>
              <span>{new Date(ev.fechaHora).toLocaleString()}</span>
              <span>{ev.personaId ? personaMap[ev.personaId] ?? "N/D" : "N/D"}</span>
              <span>{ev.puntoAccesoId ? puntoMap[ev.puntoAccesoId] ?? ev.puntoAccesoId : "N/D"}</span>
              <span>{ev.resultado}</span>
              <span>{ev.tipoEvento ?? "N/D"}</span>
              <span>{ev.motivo}</span>
            </div>
          ))}
          {!recientes.length && <p className="muted small">Aún no hay eventos registrados.</p>}
        </div>
      </div>
    </div>
  );
}
