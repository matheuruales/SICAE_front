import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PersonasPage } from "./pages/PersonasPage";
import { CredencialesPage } from "./pages/CredencialesPage";
import { LectorPage } from "./pages/LectorPage";
import { PuntosAccesoPage } from "./pages/PuntosAccesoPage";
import { EventosPage } from "./pages/EventosPage";
import { UsuariosPage } from "./pages/UsuariosPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/personas" element={<PersonasPage />} />
          <Route path="/credenciales" element={<CredencialesPage />} />
          <Route path="/lector" element={<LectorPage />} />
          <Route path="/puntos" element={<PuntosAccesoPage />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
