import { useState } from "react";
import { useSicae } from "../context/SicaeContext";
import { QrScanner } from "../components/QrScanner";

export function LectorPage() {
  const { validarQr, puntos, status } = useSicae();
  const [puntoAccesoId, setPuntoAccesoId] = useState("");
  const [ipLector, setIpLector] = useState("");

  const onRead = (code: string) => {
    validarQr(code, puntoAccesoId || undefined, ipLector || undefined);
  };

  return (
    <div className="grid two-columns">
      <div className="panel">
        <div className="panel-title">Lector en tiempo real</div>
        <div className="grid">
          <label>
            Punto de acceso
            <select value={puntoAccesoId} onChange={(e) => setPuntoAccesoId(e.target.value)}>
              <option value="">(opcional)</option>
              {puntos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} · {p.ubicacion}
                </option>
              ))}
            </select>
          </label>
          <label>
            IP del lector
            <input value={ipLector} onChange={(e) => setIpLector(e.target.value)} placeholder="10.0.0.12" />
          </label>
          {status && <p className="muted small">{status}</p>}
        </div>
      </div>
      <QrScanner onRead={onRead} />
    </div>
  );
}
