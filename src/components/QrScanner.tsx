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
  const animationFrameRef = useRef<number>(0);

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
          video: { 
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
        });

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;

        // Esperar a que el video tenga metadata
        await new Promise<void>((resolve, reject) => {
          if (video.readyState >= 2) return resolve();
          
          const onLoaded = () => {
            video.removeEventListener('loadedmetadata', onLoaded);
            video.removeEventListener('error', onError);
            resolve();
          };
          
          const onError = () => {
            video.removeEventListener('loadedmetadata', onLoaded);
            video.removeEventListener('error', onError);
            reject(new Error("Error cargando video"));
          };
          
          video.addEventListener('loadedmetadata', onLoaded);
          video.addEventListener('error', onError);
        });

        await video.play();
        setState("ready");

        const tick = () => {
          if (!running) return;

          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
            animationFrameRef.current = requestAnimationFrame(tick);
            return;
          }

          // Asegurar que el canvas tenga el tamaño correcto
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            animationFrameRef.current = requestAnimationFrame(tick);
            return;
          }

          // Dibujar frame actual del video en el canvas
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

          animationFrameRef.current = requestAnimationFrame(tick);
        };

        animationFrameRef.current = requestAnimationFrame(tick);
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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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
      </div>

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
