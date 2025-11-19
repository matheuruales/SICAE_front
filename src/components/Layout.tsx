import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useSicae } from "../context/SicaeContext";

export function Layout() {
  const { user, logout, loading, status } = useSicae();
  const navigate = useNavigate();
  const location = useLocation();

  const links = useMemo(() => {
    if (!user) return [];
    // Roles:
    // ADMIN: todo
    // SEGURIDAD: dashboard, credenciales (propias), lector, eventos
    // Otros (VISITANTE/EMPLEADO/CONTRATISTA): solo credenciales propias
    if (user.rol === "ADMIN") {
      return [
        { to: "/", label: "Dashboard" },
        { to: "/personas", label: "Personas" },
        { to: "/credenciales", label: "Credenciales QR" },
        { to: "/lector", label: "Lector QR" },
        { to: "/puntos", label: "Puntos de acceso" },
        { to: "/eventos", label: "Eventos / Reportes" },
        { to: "/usuarios", label: "Usuarios" },
      ];
    }
    if (user.rol === "SEGURIDAD") {
      return [
        { to: "/", label: "Dashboard" },
        { to: "/credenciales", label: "Credenciales QR" },
        { to: "/lector", label: "Lector QR" },
        { to: "/eventos", label: "Eventos / Reportes" },
      ];
    }
    // VISITANTE / EMPLEADO / CONTRATISTA: solo generar su QR
    return [{ to: "/credenciales", label: "Credenciales QR" }];
  }, [user]);

  useEffect(() => {
    if (user && links.length) {
      const allowed = links.some((l) => l.to === location.pathname);
      if (!allowed) {
        navigate(links[0].to, { replace: true });
      }
    }
  }, [user, links, location.pathname, navigate]);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand" onClick={() => navigate("/")}>
          <strong>SICAE</strong>
          <span className="muted small">Control de accesos</span>
        </div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className="nav-link">
              {l.label}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="sidebar-footer">
            <p className="muted small">{user.nombreCompleto}</p>
            <small className="pill">{user.rol}</small>
            <button onClick={logout}>Cerrar sesión</button>
          </div>
        )}
      </aside>

      <div className="content">
        {loading && <div className="status">Cargando...</div>}
        {status && <div className="status">{status}</div>}
        <Outlet />
      </div>
    </div>
  );
}
