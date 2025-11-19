import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  AuthResponse,
  Credencial,
  EventoAcceso,
  Persona,
  PuntoAcceso,
  Rol,
  UsuarioListado,
} from "../types";
import {
  crearPersona,
  generarQr,
  listarCredenciales,
  listarEventos,
  listarPersonas,
  listarPuntos,
  listUsuarios,
  login,
  register,
  registrarPunto,
  validarQr,
} from "../api/sicae";

type SicaeContextType = {
  user: AuthResponse | null;
  token: string;
  personas: Persona[];
  credenciales: Credencial[];
  eventos: EventoAcceso[];
  puntos: PuntoAcceso[];
  usuarios: UsuarioListado[];
  loading: boolean;
  status: string | null;
  ready: boolean;
  authenticate: (params: { correo: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshData: () => Promise<void>;
  crearPersona: (data: Parameters<typeof crearPersona>[0]) => Promise<void>;
  emitirQr: (personaId: string) => Promise<Credencial | null>;
  validarQr: (code: string, puntoAccesoId?: string, ipLector?: string) => Promise<EventoAcceso | null>;
  crearPunto: (data: { nombre: string; ubicacion: string; tipo: string; activo: boolean }) => Promise<void>;
  registrarUsuario: (data: { nombreCompleto: string; correo: string; password: string; rol: Rol }) => Promise<void>;
};

const SicaeContext = createContext<SicaeContextType | undefined>(undefined);

export function SicaeProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [token, setToken] = useState("");
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [credenciales, setCredenciales] = useState<Credencial[]>([]);
  const [eventos, setEventos] = useState<EventoAcceso[]>([]);
  const [puntos, setPuntos] = useState<PuntoAcceso[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioListado[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sicae_session");
    if (stored) {
      const parsed = JSON.parse(stored) as { user: AuthResponse; token: string };
      setUser(parsed.user);
      setToken(parsed.token);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (token) {
      refreshData();
    }
  }, [token]);

  const saveSession = useCallback((auth: AuthResponse) => {
    setUser(auth);
    setToken(auth.token);
    localStorage.setItem("sicae_session", JSON.stringify({ user: auth, token: auth.token }));
  }, []);

  const authenticate: SicaeContextType["authenticate"] = useCallback(
    async ({ correo, password }) => {
      setLoading(true);
      setStatus(null);
      try {
        const resp = await login(correo, password);
        saveSession(resp);
        setStatus(`Bienvenido, ${resp.nombreCompleto}`);
      } catch (err) {
        setStatus((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [saveSession]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken("");
    setPersonas([]);
    setCredenciales([]);
    setEventos([]);
    setPuntos([]);
    localStorage.removeItem("sicae_session");
  }, []);

  const refreshData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [personasRes, credencialesRes, eventosRes, puntosRes] = await Promise.all([
        listarPersonas(token),
        listarCredenciales(token),
        listarEventos(token),
        listarPuntos(token),
      ]);
      const personasFiltered =
        user && user.rol !== "ADMIN" && user.rol !== "SEGURIDAD"
          ? personasRes.filter((p) => p.id === user.personaId)
          : personasRes;
      setPersonas(personasFiltered);

      const credsFiltered =
        user && user.rol !== "ADMIN" && user.rol !== "SEGURIDAD"
          ? credencialesRes.filter((c) => c.personaId === user.personaId)
          : credencialesRes;
      setCredenciales(credsFiltered);

      setEventos(
        user && user.rol !== "ADMIN" && user.rol !== "SEGURIDAD"
          ? eventosRes.filter((e) => e.personaId === user.personaId)
          : eventosRes
      );
      setPuntos(puntosRes);
      if (user?.rol === "ADMIN") {
        const usuariosRes = await listUsuarios(token);
        setUsuarios(usuariosRes);
      }
    } catch (err) {
      setStatus(`No se pudieron cargar datos: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const crearPersonaAction: SicaeContextType["crearPersona"] = useCallback(
    async (data) => {
      if (!token) return;
      setLoading(true);
      setStatus(null);
      try {
        const persona = await crearPersona(data, token);
        setPersonas((prev) => [...prev, persona]);
        setStatus("Persona registrada.");
      } catch (err) {
        setStatus((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const emitirQr: SicaeContextType["emitirQr"] = useCallback(
    async (personaId) => {
      if (!token) return null;
      setStatus(null);
      setLoading(true);
      try {
        const cred = await generarQr(personaId, token);
        setCredenciales((prev) => [...prev, cred]);
        setStatus("Código QR emitido (1 minuto de vigencia por defecto).");
        return cred;
      } catch (err) {
        setStatus((err as Error).message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const validarQrAction: SicaeContextType["validarQr"] = useCallback(async (code, puntoAccesoId, ipLector) => {
    setLoading(true);
    setStatus("Validando QR...");
    try {
      const evento = await validarQr(code, puntoAccesoId, ipLector);
      setEventos((prev) => [evento, ...prev]);
      setStatus(`Resultado: ${evento.resultado} (${evento.motivo})`);
      return evento;
    } catch (err) {
      setStatus((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const crearPuntoAction: SicaeContextType["crearPunto"] = useCallback(async (data) => {
    if (!token) return;
    setLoading(true);
    setStatus(null);
    try {
      const punto = await registrarPunto(data, token);
      setPuntos((prev) => [...prev, punto]);
      setStatus("Punto de acceso registrado.");
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const registrarUsuario: SicaeContextType["registrarUsuario"] = useCallback(
    async (data) => {
      setLoading(true);
      setStatus(null);
      try {
        const nuevo = await register(data.nombreCompleto, data.correo, data.password, data.rol);
        setUsuarios((prev) => [...prev, nuevo]);
        setStatus("Usuario creado.");
      } catch (err) {
        setStatus((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      token,
      personas,
      credenciales,
      eventos,
      puntos,
      usuarios,
      loading,
      status,
      ready,
      authenticate,
      logout,
      refreshData,
      crearPersona: crearPersonaAction,
      emitirQr,
      validarQr: validarQrAction,
      crearPunto: crearPuntoAction,
      registrarUsuario,
    }),
    [
      user,
      token,
      personas,
      credenciales,
      eventos,
      puntos,
      usuarios,
      loading,
      status,
      ready,
      authenticate,
      logout,
      refreshData,
      crearPersonaAction,
      emitirQr,
      validarQrAction,
      crearPuntoAction,
      registrarUsuario,
    ]
  );

  return <SicaeContext.Provider value={value}>{children}</SicaeContext.Provider>;
}

export function useSicae() {
  const ctx = useContext(SicaeContext);
  if (!ctx) {
    throw new Error("useSicae debe usarse dentro de SicaeProvider");
  }
  return ctx;
}
