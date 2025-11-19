import { useState, useCallback } from "react";
import { useSicae } from "../context/SicaeContext";
import { QrScanner } from "../components/QrScanner";

export function LectorPage() {
  const { validarQr, puntos, status } = useSicae();
  const [puntoAccesoId, setPuntoAccesoId] = useState("");
  const [ipLector, setIpLector] = useState("");

  const onRead = useCallback(
    (code: string) => {
      // Puedes hacer algún trim o log si quieres
      const qr = code.trim();
      if (!qr) return;

      validarQr(qr, puntoAccesoId || undefined, ipLector || undefined);
    },
    [validarQr, puntoAccesoId, ipLector]
  );

  const puntosSafe = puntos ?? [];

  return (
    <div className="grid two-columns">
      <div className="panel">
        <div className="panel-title">Lector en tiempo real</div>
        <div className="grid">
          <label>
            Punto de acceso
            <select
              value={puntoAccesoId}
              onChange={(e) => setPuntoAccesoId(e.target.value)}
            >
              <option value="">(opcional)</option>
              {puntosSafe.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} · {p.ubicacion}
                </option>
              ))}
            </select>
          </label>

          <label>
            IP del lector
            <input
              value={ipLector}
              onChange={(e) => setIpLector(e.target.value)}
              placeholder="10.0.0.12"
            />
          </label>

          {status && <p className="muted small">{status}</p>}
        </div>
      </div>

      <QrScanner onRead={onRead} />
    </div>
  );
}