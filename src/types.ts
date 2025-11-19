export type Rol = "ADMIN" | "SEGURIDAD" | "VISITANTE";

export interface Usuario {
  usuarioId: string;
  nombreCompleto: string;
  correo: string;
  rol: Rol;
  token: string;
}

export type TipoPersona = "EMPLEADO" | "VISITANTE" | "CONTRATISTA";

export interface Persona {
  id: string;
  nombreCompleto: string;
  documento: string;
  fechaNacimiento?: string;
  telefono?: string;
  tipo: TipoPersona;
  numeroEmpleado?: string;
  departamento?: string;
  fechaIngreso?: string;
  empresa?: string;
  personaContacto?: string;
  motivoVisita?: string;
  empresaContratista?: string;
  numeroContacto?: string;
  fechaVencimientoContrato?: string;
}

export type EstadoCredencial = "ACTIVA" | "INACTIVA" | "REVOCADA" | "EXPIRADA";

export interface QRToken {
  code: string;
  usado: boolean;
  fechaGeneracion: string;
  expiraEn: string;
}

export interface Credencial {
  id: string;
  personaId: string;
  estado: EstadoCredencial;
  emitidaEn: string;
  expiraEn: string;
  tipo: "QR";
  qrToken: QRToken;
  motivoRevocacion?: string;
}

export type ResultadoAcceso = "PERMITIDO" | "DENEGADO" | "PENDIENTE";
export type TipoEvento = "ENTRADA" | "SALIDA" | "INTENTO";

export interface EventoAcceso {
  id: string;
  personaId?: string;
  credencialId?: string;
  puntoAccesoId?: string;
  fechaHora: string;
  resultado: ResultadoAcceso;
  motivo: string;
  qrCode: string;
  ipLector?: string;
  tipoEvento: TipoEvento;
  fechaHoraSalida?: string;
}

export type TipoPunto = "PUERTA" | "TORNIQUETE" | "ESTACION" | "BARRERA";

export interface PuntoAcceso {
  id: string;
  nombre: string;
  ubicacion: string;
  tipo: TipoPunto;
  activo: boolean;
  fechaInstalacion: string;
}

export interface AuthResponse {
  token: string;
  usuarioId: string;
  nombreCompleto: string;
  correo: string;
  rol: Rol;
  personaId: string | null;
}

export interface UsuarioListado {
  usuarioId: string;
  nombreCompleto: string;
  correo: string;
  rol: Rol;
  personaId?: string | null;
}
