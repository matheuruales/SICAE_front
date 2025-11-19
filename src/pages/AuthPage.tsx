import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSicae } from "../context/SicaeContext";

export function AuthPage() {
  const { authenticate, user, loading, status } = useSicae();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    correo: "",
    password: "",
  });

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    authenticate({
      correo: form.correo,
      password: form.password,
    });
  };

  return (
    <div className="auth-layout">
      <div className="panel auth-card">
        <div className="panel-title">SICAE · Control de Accesos</div>
        <p className="muted small">Ingresa con tu correo y contraseña.</p>

        <form className="grid" onSubmit={handleSubmit}>
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
          <button type="submit" className="primary" disabled={loading}>
            Ingresar
          </button>
        </form>
        {status && <p className="muted small">{status}</p>}
      </div>
    </div>
  );
}
