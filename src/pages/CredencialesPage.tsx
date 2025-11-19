import type { FormEvent } from "react";
import { useMemo, useState, useEffect } from "react";
import { useSicae } from "../context/SicaeContext";
import type { Credencial } from "../types";

export function CredencialesPage() {
  const { personas, credenciales, emitirQr, loading, user } = useSicae();
  const [personaSeleccionada, setPersonaSeleccionada] = useState("");
  const [ultCredencial, setUltCredencial] = useState<Credencial | null>(null);

  // Para roles que solo pueden generar su propio QR, autoselecciona la primera persona disponible
  useEffect(() => {
    if (personaSeleccionada) return;
    if (user?.personaId) {
      setPersonaSeleccionada(user.personaId);
      return;
    }
    if (personas.length > 0) {
      setPersonaSeleccionada(personas[0].id);
    }
  }, [user?.personaId, personas, personaSeleccionada]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!personaSeleccionada) return;
    const cred = await emitirQr(personaSeleccionada);
    if (cred) setUltCredencial(cred);
  };

  const qrPreview = useMemo(() => {
    if (!ultCredencial?.qrToken?.code) return null;
    const data = encodeURIComponent(ultCredencial.qrToken.code);
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${data}`;
  }, [ultCredencial]);

  const selectablePersonas = user?.rol === "ADMIN" || user?.rol === "SEGURIDAD" ? personas : personas;

  return (
    <div className="grid two-columns">
      <div className="panel">
        <div className="panel-title">Emitir credencial QR de un solo uso</div>
        <p className="muted small">
          {user?.rol === "ADMIN"
            ? "Selecciona a la persona y emite un QR de un solo uso."
            : user?.rol === "SEGURIDAD"
            ? "Genera tu QR temporal y controla accesos."
            : "Genera tu QR temporal (vigencia 1 minuto)."}
        </p>
        <form className="grid" onSubmit={handleSubmit}>
          {user?.rol === "ADMIN" || user?.rol === "SEGURIDAD" ? (
            <label>
              Persona
              <select required value={personaSeleccionada} onChange={(e) => setPersonaSeleccionada(e.target.value)}>
                <option value="">Selecciona...</option>
                {selectablePersonas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombreCompleto}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="muted small">
              Se generará el QR para tu registro. Si no apareces en la lista, solicita alta al administrador.
            </p>
          )}
          <button className="primary" type="submit" disabled={!personaSeleccionada || loading}>
            Generar QR (1 min)
          </button>
        </form>
        {ultCredencial && (
          <div className="qr-preview">
            <p className="muted small">
              Código: <strong>{ultCredencial.qrToken.code}</strong>
            </p>
            {qrPreview && <img src={qrPreview} alt="QR generado" />}
            <p className="muted small">
              Expira: {new Date(ultCredencial.qrToken.expiraEn).toLocaleTimeString()} · Estado: {ultCredencial.estado}
            </p>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-title">Credenciales emitidas</div>
        <div className="table">
          <div className="table-header">
            <span>Persona</span>
            <span>Estado</span>
            <span>Expira</span>
          </div>
          {credenciales.map((c) => (
            <div key={c.id} className="table-row">
              <span>{personas.find((p) => p.id === c.personaId)?.nombreCompleto ?? "N/D"}</span>
              <span>{c.estado}</span>
              <span>{new Date(c.expiraEn).toLocaleTimeString()}</span>
            </div>
          ))}
          {!credenciales.length && <p className="muted small">Aún no hay credenciales emitidas.</p>}
        </div>
      </div>
    </div>
  );
}
