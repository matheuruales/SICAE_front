import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

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

  useEffect(() => {
    let stream: MediaStream | null = null;
    let running = true;

    async function startScanner() {
      // Proteger por si se ejecuta en SSR (Next.js) o navegador raro
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setState("unsupported");
        return;
      }

      try {
        // Pedir cámara trasera si existe
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;

        // Esperar a que el video tenga metadata
        await new Promise<void>((resolve) => {
          if (video.readyState >= 2) return resolve();
          video.onloadedmetadata = () => resolve();
        });

        await video.play();
        setState("ready");

        const tick = () => {
          if (!running) return;

          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || !canvas) {
            requestAnimationFrame(tick);
            return;
          }

          // Si aún no está listo el video, seguir esperando
          if (video.videoWidth === 0 || video.videoHeight === 0) {
            requestAnimationFrame(tick);
            return;
          }

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            requestAnimationFrame(tick);
            return;
          }

          // Dibujar frame actual del video
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const result = jsQR(imageData.data, imageData.width, imageData.height);

            if (result?.data) {
              const now = Date.now();
              const code = result.data;

              // Evitar disparar el mismo código muchas veces seguidas
              if (code !== lastCodeRef.current || now - lastScanTimeRef.current > 3000) {
                lastCodeRef.current = code;
                lastScanTimeRef.current = now;
                onRead(code);
              }
            }
          } catch (err) {
            console.error("Error leyendo QR:", err);
          }

          requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
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
      running = false;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      lastCodeRef.current = "";
    };
  }, [onRead, active]);

  const handleManualSubmit = () => {
    const value = manual.trim();
    if (!value) return;
    lastCodeRef.current = value;
    lastScanTimeRef.current = Date.now();
    onRead(value);
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

      {active && state === "ready" ? (
        <div className="scanner">
          <video
            ref={videoRef}
            muted
            playsInline
            // opcionalmente, autoPlay (aunque ya llamamos a play() en el código)
            className="video-feed"
          />
          <div className="scan-overlay">
            <div className="scan-box" />
            <p className="muted small center">Alinea el QR dentro del cuadro</p>
          </div>
          <canvas ref={canvasRef} className="hidden-canvas" />
        </div>
      ) : (
        <div className="scanner-fallback">
          <p className="muted small">
            {!active
              ? "Presiona activar para iniciar la cámara."
              : state === "pending"
              ? "Activando cámara..."
              : "No se pudo acceder a la cámara. Usa el ingreso manual del código."}
          </p>
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Pega aquí el QR leído"
          />
          <button type="button" onClick={handleManualSubmit}>
            Validar código
          </button>
          {error && <p className="muted small">{error}</p>}
        </div>
      )}
    </div>
  );
}
