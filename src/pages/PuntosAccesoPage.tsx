import type { FormEvent } from "react";
import { useState } from "react";
import { useSicae } from "../context/SicaeContext";
import type { TipoPunto } from "../types";

const tipoOptions: Record<TipoPunto, string> = {
  PUERTA: "Puerta",
  TORNIQUETE: "Torniquete",
  ESTACION: "Estación",
  BARRERA: "Barrera",
};

export function PuntosAccesoPage() {
  const { puntos, crearPunto, loading, user } = useSicae();
  const [form, setForm] = useState({
    nombre: "",
    ubicacion: "",
    tipo: "PUERTA" as TipoPunto,
    activo: true,
  });

  if (user?.rol !== "ADMIN") {
    return (
      <div className="panel">
        <div className="panel-title">Acceso restringido</div>
        <p className="muted small">Solo los administradores pueden registrar puntos de acceso.</p>
      </div>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    crearPunto(form);
  };

  return (
    <div className="grid two-columns">
      <div className="panel">
        <div className="panel-title">Registrar punto de acceso</div>
        <form className="grid" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </label>
          <label>
            Ubicación
            <input required value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} />
          </label>
          <label>
            Tipo
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoPunto })}>
              {Object.entries(tipoOptions).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            />
            Activo
          </label>
          <button className="primary" type="submit" disabled={loading}>
            Guardar punto
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-title">Puntos de acceso registrados</div>
        <div className="table">
          <div className="table-header">
            <span>Nombre</span>
            <span>Ubicación</span>
            <span>Tipo</span>
          </div>
          {puntos.map((p) => (
            <div key={p.id} className="table-row">
              <span>{p.nombre}</span>
              <span>{p.ubicacion}</span>
              <span>{tipoOptions[p.tipo]}</span>
            </div>
          ))}
          {!puntos.length && <p className="muted small">Aún no se han registrado puntos de acceso.</p>}
        </div>
      </div>
    </div>
  );
}
