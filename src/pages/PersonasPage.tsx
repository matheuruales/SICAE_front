import { useSicae } from "../context/SicaeContext";
import type { TipoPersona } from "../types";

export function PersonasPage() {
  const { personas, user } = useSicae();

  const tipoPersonaLabels: Record<TipoPersona, string> = {
    EMPLEADO: "Empleado",
    VISITANTE: "Visitante",
    CONTRATISTA: "Contratista",
  };

  if (!user) {
    return null;
  }

  if (user.rol !== "ADMIN" && user.rol !== "SEGURIDAD") {
    return (
      <div className="panel">
        <div className="panel-title">Acceso restringido</div>
        <p className="muted small">Solo Seguridad o Administrador pueden revisar las personas del sistema.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-title">Personas registradas</div>
      <p className="muted small">
        Las personas ahora se crean automáticamente al registrar un usuario. No necesitas darlas de alta aparte; quedan
        vinculadas 1 a 1 con su usuario.
      </p>
      <div className="table" style={{ marginTop: "1rem" }}>
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
  );
}
