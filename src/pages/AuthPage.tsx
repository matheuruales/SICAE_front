import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Rol } from "../types";
import { useSicae } from "../context/SicaeContext";

export function AuthPage() {
  const { authMode, setAuthMode, authenticate, user, loading, status } = useSicae();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombreCompleto: "",
    correo: "",
    password: "",
    rol: "ADMIN" as Rol,
  });

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    authenticate({
      mode: authMode,
      nombreCompleto: form.nombreCompleto,
      correo: form.correo,
      password: form.password,
      rol: form.rol,
    });
  };

  return (
    <div className="auth-layout">
      <div className="panel auth">
        <div className="panel-title">SICAE · Control de Accesos</div>
        <p className="muted small">Autenticación con credenciales de administrador o seguridad.</p>

        <div className="tabs">
          <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>
            Iniciar sesión
          </button>
          <button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>
            Registrar usuario
          </button>
        </div>

        <form className="grid" onSubmit={handleSubmit}>
          {authMode === "register" && (
            <label>
              Nombre completo
              <input
                required
                value={form.nombreCompleto}
                onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
              />
            </label>
          )}
          <label>
            Correo
            <input
              required
              type="email"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
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
          {authMode === "register" && (
            <label>
              Rol
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}>
                <option value="ADMIN">Administrador</option>
                <option value="SEGURIDAD">Seguridad</option>
                <option value="VISITANTE">Visitante</option>
              </select>
            </label>
          )}
          <button type="submit" className="primary" disabled={loading}>
            {authMode === "login" ? "Ingresar" : "Registrar"}
          </button>
        </form>
        {status && <p className="muted small">{status}</p>}
      </div>
    </div>
  );
}
