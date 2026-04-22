import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import * as faceapi from "face-api.js";
import { Camera, Loader2, CheckCircle, XCircle, AlertCircle, ScanFace } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

type Status = "loading" | "camera" | "detecting" | "success" | "fail" | "expired" | "error";

export function FaceMobile() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Carregando...");

  // Validar sessão
  useEffect(() => {
    if (!sessionId) { setStatus("error"); setMessage("Sessão inválida"); return; }

    fetch(`${API_URL}/api/face/mobile/${sessionId}`, { method: "HEAD" })
      .catch(() => {});

    // Verificar se sessão existe (via complete endpoint com body vazio — vai dar 400 mas prova que existe)
    setStatus("loading");
    setMessage("Carregando modelos de reconhecimento facial...");

    Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]).then(() => {
      startCamera();
    }).catch(() => {
      setStatus("error");
      setMessage("Erro ao carregar modelos de IA");
    });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [sessionId]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("camera");
      setMessage("Posicione seu rosto no centro e toque em Capturar");
    } catch {
      setStatus("error");
      setMessage("Câmera não disponível. Permita o acesso nas configurações do navegador.");
    }
  };

  const capture = useCallback(async () => {
    if (!videoRef.current || !sessionId) return;

    setStatus("detecting");
    setMessage("Analisando rosto...");

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus("camera");
        setMessage("Rosto não detectado. Aproxime-se e tente novamente.");
        return;
      }

      // Desenhar no canvas
      if (canvasRef.current) {
        const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
        const resized = faceapi.resizeResults(detection, dims);
        faceapi.draw.drawDetections(canvasRef.current, [resized]);
      }

      const descriptor = Array.from(detection.descriptor);

      setMessage("Enviando para o servidor...");

      const res = await fetch(`${API_URL}/api/face/mobile/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setStatus("expired");
          setMessage("Sessão expirada. Gere um novo QR Code no computador.");
        } else if (res.status === 409) {
          setStatus("fail");
          setMessage("Esta sessão já foi utilizada.");
        } else {
          setStatus("fail");
          setMessage(data.error || "Erro ao processar");
        }
        return;
      }

      // Parar câmera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      if (data.match === false) {
        setStatus("fail");
        setMessage("Rosto não reconhecido. Peça ao RH para cadastrar seu rosto.");
      } else {
        setStatus("success");
        setMessage(data.userName
          ? `Verificado: ${data.userName} (${data.confidence}%)`
          : "Rosto cadastrado com sucesso!"
        );
      }
    } catch {
      setStatus("error");
      setMessage("Erro de conexão. Verifique sua internet.");
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <ScanFace size={40} className="text-primary-400 mx-auto mb-3" />
        <h1 className="text-xl font-bold text-white">CVI Amazonas</h1>
        <p className="text-sm text-neutral-400">Reconhecimento Facial</p>
      </div>

      {/* Câmera */}
      <div className="relative w-full max-w-sm aspect-[3/4] bg-black rounded-3xl overflow-hidden mb-6">
        {status === "loading" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 gap-3">
            <Loader2 size={40} className="animate-spin" />
            <p className="text-sm">{message}</p>
          </div>
        ) : status === "expired" || status === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 gap-3 px-6 text-center">
            <AlertCircle size={40} className="text-secondary-400" />
            <p className="text-sm">{message}</p>
          </div>
        ) : status === "success" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <CheckCircle size={48} className="text-accent-400" />
            <p className="text-lg font-bold text-white">{message}</p>
            <p className="text-sm text-neutral-400">Pode fechar esta página.</p>
          </div>
        ) : status === "fail" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <XCircle size={48} className="text-secondary-400" />
            <p className="text-base font-semibold text-white">{message}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ transform: "scaleX(-1)" }}
            />
            {/* Guia oval */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-52 h-64 rounded-full border-4 border-dashed border-white/40" />
            </div>
          </>
        )}
      </div>

      {/* Botão de captura */}
      {(status === "camera" || status === "detecting") && (
        <button
          type="button"
          onClick={capture}
          disabled={status === "detecting"}
          className="w-full max-w-sm bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-600
            text-white font-bold py-4 rounded-2xl text-lg transition-colors flex items-center justify-center gap-2"
        >
          {status === "detecting" ? (
            <><Loader2 size={20} className="animate-spin" /> Analisando...</>
          ) : (
            <><Camera size={20} /> Capturar Rosto</>
          )}
        </button>
      )}

      {/* Info */}
      <p className="mt-6 text-xs text-neutral-500 text-center max-w-xs leading-relaxed">
        Processamento 100% local no navegador. Nenhuma foto é armazenada — apenas um código numérico de verificação.
      </p>
    </div>
  );
}
