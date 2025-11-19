import { useEffect, useRef, useState } from "react";

type Props = {
  onRead: (value: string) => void;
};

type DetectorState = "pending" | "ready" | "unsupported";

declare const BarcodeDetector: {
  new (options?: { formats?: string[] }): {
    detect: (image: CanvasImageSource) => Promise<{ rawValue: string }[]>;
  };
};

export function QrScanner({ onRead }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<DetectorState>("pending");
  const [manual, setManual] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let interval: number | undefined;

    async function startScanner() {
      if (typeof BarcodeDetector === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setState("unsupported");
        return;
      }

      try {
        const detector = new BarcodeDetector({ formats: ["qr_code"] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setState("ready");

        interval = window.setInterval(async () => {
          if (!videoRef.current || !canvasRef.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          try {
            const codes = await detector.detect(canvas);
            if (codes.length > 0) {
              onRead(codes[0].rawValue);
            }
          } catch (err) {
            console.error(err);
          }
        }, 800);
      } catch (err) {
        console.error("No se pudo iniciar la cámara", err);
        setState("unsupported");
      }
    }

    startScanner();

    return () => {
      if (interval) window.clearInterval(interval);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onRead]);

  return (
    <div className="panel">
      <div className="panel-title">Lector de QR (credencial única)</div>
      <p className="muted small">
        Se usa como única credencial: apunte la cámara al código generado o ingréselo manualmente.
      </p>
      {state === "ready" ? (
        <div className="scanner">
          <video ref={videoRef} muted playsInline className="video-feed" />
          <canvas ref={canvasRef} className="hidden-canvas" />
        </div>
      ) : (
        <div className="scanner-fallback">
          <p className="muted small">
            {state === "pending"
              ? "Activando cámara..."
              : "Este navegador no expone BarcodeDetector. Usa ingreso manual."}
          </p>
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Pega aquí el QR leído"
          />
          <button onClick={() => manual && onRead(manual)}>Validar código</button>
        </div>
      )}
    </div>
  );
}
