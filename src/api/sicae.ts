import { apiFetch } from "./client";
import type {
  AuthResponse,
  Credencial,
  EventoAcceso,
  Persona,
  PuntoAcceso,
  TipoPersona,
  Rol,
  UsuarioListado,
} from "../types";

export async function login(correo: string, password: string) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ correo, password }),
  });
}

export async function register(data: {
  nombreCompleto: string;
  correo: string;
  password: string;
  rol: Rol;
  documento: string;
  tipoPersona: TipoPersona;
  telefono?: string;
  empresa?: string;
  personaContacto?: string;
  motivoVisita?: string;
}) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listUsuarios(token: string) {
  return apiFetch<UsuarioListado[]>("/auth/usuarios", {}, token);
}

export async function crearPersona(
  persona: {
    nombreCompleto: string;
    documento: string;
    tipo: TipoPersona;
    telefono?: string;
    empresa?: string;
    personaContacto?: string;
    motivoVisita?: string;
  },
  token: string
) {
  return apiFetch<Persona>(
    "/personas",
    {
      method: "POST",
      body: JSON.stringify(persona),
    },
    token
  );
}

export async function listarPersonas(token: string) {
  return apiFetch<Persona[]>("/personas", {}, token);
}

export async function generarQr(personaId: string | undefined, token: string) {
  return apiFetch<Credencial>(
    "/credenciales/qr",
    { method: "POST", body: JSON.stringify({ personaId }) },
    token
  );
}

export async function listarCredenciales(token: string) {
  return apiFetch<Credencial[]>("/credenciales", {}, token);
}

export async function validarQr(code: string, puntoAccesoId?: string, ipLector?: string) {
  return apiFetch<EventoAcceso>("/credenciales/validar", {
    method: "POST",
    body: JSON.stringify({ qrCode: code, puntoAccesoId, ipLector }),
  });
}

export async function listarEventos(token: string) {
  return apiFetch<EventoAcceso[]>("/eventos", {}, token);
}

export async function registrarPunto(
  punto: {
    nombre: string;
    ubicacion: string;
    tipo: string;
    activo: boolean;
  },
  token: string
) {
  return apiFetch<PuntoAcceso>("/puntos-acceso", { method: "POST", body: JSON.stringify(punto) }, token);
}

export async function listarPuntos(token: string) {
  return apiFetch<PuntoAcceso[]>("/puntos-acceso", {}, token);
}
