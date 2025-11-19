import { FormEvent, useState } from "react";
import { useSicae } from "../context/SicaeContext";
import { TipoPersona } from "../types";

const tipoPersonaLabels: Record<TipoPersona, string> = {
  EMPLEADO: "Empleado",
  VISITANTE: "Visitante",
  CONTRATISTA: "Contratista",
};

export function PersonasPage() {
  const { personas, crearPersona, loading } = useSicae();
  const [form, setForm] = useState({
    nombreCompleto: "",
    documento: "",
    telefono: "",
    tipo: "VISITANTE" as TipoPersona,
    empresa: "",
    personaContacto: "",
    motivoVisita: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    crearPersona(form);
  };

  return (
    <div className="grid two-columns">
      <div className="panel">
        <div className="panel-title">Registrar persona</div>
        <form className="grid" onSubmit={handleSubmit}>
          <label>
            Nombre completo
            <input
              required
              value={form.nombreCompleto}
              onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
            />
          </label>
          <label>
            Documento
            <input required value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
          </label>
          <label>
            Teléfono
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </label>
          <label>
            Tipo
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoPersona })}>
              {Object.entries(tipoPersonaLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Empresa / Área
            <input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
          </label>
          <label>
            Contacto / Motivo
            <input
              value={form.motivoVisita}
              onChange={(e) => setForm({ ...form, motivoVisita: e.target.value })}
            />
          </label>
          <button className="primary" type="submit" disabled={loading}>
            Guardar persona
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-title">Personas registradas</div>
        <div className="table">
          <div className="table-header">
            <span>Nombre</span>
            <span>Tipo</span>
            <span>Documento</span>
          </div>
          {personas.map((p) => (
            <div key={p.id} className="table-row">
              <span>{p.nombreCompleto}</span>
              <span>{tipoPersonaLabels[p.tipo]}</span>
              <span>{p.documento}</span>
            </div>
          ))}
          {!personas.length && <p className="muted small">No hay personas registradas aún.</p>}
        </div>
      </div>
    </div>
  );
}
