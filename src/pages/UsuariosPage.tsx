import type { FormEvent } from "react";
import { useState } from "react";
import { useSicae } from "../context/SicaeContext";
import type { Rol, TipoPersona } from "../types";

export function UsuariosPage() {
  const { usuarios, user, registrarUsuario } = useSicae();
  const [form, setForm] = useState({
    nombreCompleto: "",
    correo: "",
    password: "",
    rol: "ADMIN" as Rol,
    documento: "",
    tipoPersona: "EMPLEADO" as TipoPersona,
    telefono: "",
    empresa: "",
    personaContacto: "",
    motivoVisita: "",
  });

  if (user?.rol !== "ADMIN") {
    return (
      <div className="panel">
        <div className="panel-title">Acceso restringido</div>
        <p className="muted small">Solo los administradores pueden gestionar usuarios.</p>
      </div>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    registrarUsuario(form);
  };

  return (
    <div className="grid two-columns">
      <div className="panel">
        <div className="panel-title">Registrar nuevo usuario + persona</div>
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
            Correo
            <input required type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
          </label>
          <label>
            Documento
            <input
              required
              value={form.documento}
              onChange={(e) => setForm({ ...form, documento: e.target.value })}
              placeholder="Identificador único"
            />
          </label>
          <label>
            Contraseña
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <label>
            Rol
            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}>
              <option value="ADMIN">Administrador</option>
              <option value="SEGURIDAD">Seguridad</option>
              <option value="VISITANTE">Visitante</option>
            </select>
          </label>
          <label>
            Tipo de persona
            <select
              value={form.tipoPersona}
              onChange={(e) => setForm({ ...form, tipoPersona: e.target.value as TipoPersona })}
            >
              <option value="EMPLEADO">Empleado</option>
              <option value="VISITANTE">Visitante</option>
              <option value="CONTRATISTA">Contratista</option>
            </select>
          </label>
          <label>
            Teléfono
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
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
              placeholder="Motivo o persona de contacto"
            />
          </label>
          <button className="primary" type="submit">
            Crear usuario
          </button>
        </form>
        <p className="muted small">
          El registro ahora crea al usuario y su persona asociada en un solo paso para mantener la relación 1 a 1.
        </p>
      </div>

      <div className="panel">
        <div className="panel-title">Usuarios del sistema</div>
        {user?.rol !== "ADMIN" && (
          <p className="muted small">Solo los administradores pueden listar y registrar usuarios.</p>
        )}
        <div className="table">
          <div className="table-header">
            <span>Nombre</span>
            <span>Correo</span>
            <span>Rol</span>
          </div>
          {usuarios.map((u) => (
            <div key={u.usuarioId} className="table-row">
              <span>{u.nombreCompleto}</span>
              <span>{u.correo}</span>
              <span>{u.rol}</span>
            </div>
          ))}
          {!usuarios.length && <p className="muted small">Sin datos cargados.</p>}
        </div>
      </div>
    </div>
  );
}
