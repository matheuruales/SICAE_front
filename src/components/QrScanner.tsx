import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

type Props = {
  onRead: (value: string) => void;
};

type DetectorState = "pending" | "ready" | "unsupported";

export function QrScanner({ onRead }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<DetectorState>("pending");
  const [manual, setManual] = useState("");
  const lastCodeRef = useRef<string>("");
  const lastScanTimeRef = useRef<number>(0);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    async function startScanner() {
      // Proteger por si se ejecuta en SSR (Next.js) o navegador raro
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setState("unsupported");
        return;
      }

      try {
        const video = videoRef.current;
        if (!video) return;

        const codeReader = new BrowserMultiFormatReader();
        codeReaderRef.current = codeReader;

        await codeReader.decodeFromVideoDevice(
          undefined,
          video,
          (result, err) => {
            if (result) {
              const now = Date.now();
              const code = result.getText();
              if (code && (code !== lastCodeRef.current || now - lastScanTimeRef.current > 3000)) {
                lastCodeRef.current = code;
                lastScanTimeRef.current = now;
                onRead(code);
              }
            }
            if (err && (err as any).name !== "NotFoundException") {
              console.error("Error leyendo QR:", err);
            }
            if (state !== "ready") {
              setState("ready");
            }
          }
        );

        stopRef.current = () => {
          (codeReader as any).reset?.();
        };
      } catch (err) {
        console.error("No se pudo iniciar la cámara", err);
        setState("unsupported");
        setError((err as Error).message);
      }
    }

    if (active) {
      startScanner();
    }

    return () => {
      stopRef.current?.();
      (codeReaderRef.current as any)?.reset?.();
      lastCodeRef.current = "";
    };
  }, [onRead, active, state]);

  const handleManualSubmit = () => {
    const value = manual.trim();
    if (!value) return;
    lastCodeRef.current = value;
    lastScanTimeRef.current = Date.now();
    onRead(value);
    setManual("");
  };

  return (
    <div className="panel">
      <div className="panel-title">Lector de QR (credencial única)</div>
      <p className="muted small">
        Se usa como única credencial: apunte la cámara al código generado o ingréselo manualmente.
      </p>

      <div className="scanner-actions">
        {!active ? (
          <button type="button" onClick={() => setActive(true)}>
            Activar cámara
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setActive(false);
              setState("pending");
            }}
          >
            Detener cámara
          </button>
        )}
      </div>

      {active && state === "pending" && (
        <div className="scanner-fallback" style={{ marginTop: "10px" }}>
          <p className="muted small">Activando cámara...</p>
          <div className="spinner" aria-label="Cargando cámara" />
        </div>
      )}

      {active && state === "ready" ? (
        <div className="scanner">
          <video
            ref={videoRef}
            muted
            autoPlay
            playsInline
            className="video-feed"
            style={{
              width: "100%",
              maxWidth: "500px",
              height: "auto",
              border: "2px solid #ccc",
              borderRadius: "8px"
            }}
          />
          <div className="scan-overlay" style={{
            position: "relative",
            marginTop: "10px",
            textAlign: "center"
          }}>
            <div className="scan-box" style={{
              width: "200px",
              height: "200px",
              border: "2px solid #007bff",
              borderRadius: "8px",
              margin: "0 auto",
              position: "relative"
            }} />
            <p className="muted small" style={{ marginTop: "10px" }}>
              Alinea el QR dentro del cuadro
            </p>
          </div>
          <canvas 
            ref={canvasRef} 
            style={{ display: 'none' }} 
          />
        </div>
      ) : (
        <div className="scanner-fallback" style={{ marginTop: "20px" }}>
          <p className="muted small">
            {!active
              ? "Presiona activar para iniciar la cámara."
              : state === "pending"
              ? "Activando cámara..."
              : "No se pudo acceder a la cámara. Usa el ingreso manual del código."}
          </p>
          
          {state === "unsupported" && (
            <div style={{ marginTop: "15px" }}>
              <input
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="Pega aquí el código QR"
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  padding: "8px",
                  marginBottom: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px"
                }}
              />
              <button 
                type="button" 
                onClick={handleManualSubmit}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Validar código
              </button>
            </div>
          )}
          
          {error && (
            <p className="muted small" style={{ color: "red", marginTop: "10px" }}>
              Error: {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
