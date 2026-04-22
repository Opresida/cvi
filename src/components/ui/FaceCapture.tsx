import { useRef, useState, useEffect, useCallback } from "react";
import * as faceapi from "face-api.js";
import { Camera, Loader2, CheckCircle, XCircle, Smartphone } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const API_URL = "";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:5000";
function getToken() { return localStorage.getItem("cvi-token") || ""; }

interface FaceCaptureProps {
  mode: "register" | "verify";
  userId?: number;
  onVerified?: (user: { id: number; name: string; email: string }, confidence: number) => void;
  onError?: (message: string) => void;
}

type CaptureMethod = "select" | "webcam" | "qrcode";
type Status = "idle" | "loading-models" | "camera-ready" | "detecting" | "success" | "fail" | "error";

export function FaceCapture({ mode, userId, onVerified, onError }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [method, setMethod] = useState<CaptureMethod>("select");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // QR Code
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrMessage, setQrMessage] = useState("Gerando QR Code...");

  // Cleanup
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => { stopCamera(); stopPolling(); };
  }, [stopCamera, stopPolling]);

  // ============================================
  // MÉTODO 1: WEBCAM (direto no computador)
  // ============================================

  const loadModels = useCallback(async () => {
    if (modelsLoaded) return;
    setStatus("loading-models");
    setMessage("Carregando modelos de IA...");
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      setModelsLoaded(true);
    } catch {
      setStatus("error");
      setMessage("Erro ao carregar modelos de IA");
    }
  }, [modelsLoaded]);

  const startWebcam = useCallback(async () => {
    setMethod("webcam");
    await loadModels();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("camera-ready");
      setMessage(mode === "register"
        ? "Posicione o rosto no centro e clique em Capturar"
        : "Posicione o rosto para verificação"
      );
    } catch {
      // Câmera não disponível — sugerir QR code
      setMethod("select");
      setStatus("error");
      setMessage("Câmera não disponível neste dispositivo. Use o QR Code pelo celular.");
      onError?.("Câmera não disponível");
    }
  }, [loadModels, mode, onError]);

  const captureWebcam = async () => {
    if (!videoRef.current) return;
    setStatus("detecting");
    setMessage("Detectando rosto...");

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus("fail");
        setMessage("Nenhum rosto detectado. Tente novamente.");
        setTimeout(() => setStatus("camera-ready"), 2000);
        return;
      }

      if (canvasRef.current) {
        const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
        const resized = faceapi.resizeResults(detection, dims);
        faceapi.draw.drawDetections(canvasRef.current, [resized]);
      }

      const descriptor = Array.from(detection.descriptor);

      if (mode === "register") {
        const res = await fetch(`${API_URL}/api/face/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ userId, descriptor }),
        });
        if (res.ok) {
          setStatus("success"); setMessage("Rosto cadastrado com sucesso!"); stopCamera();
        } else {
          const data = await res.json();
          setStatus("fail"); setMessage(data.error || "Erro ao cadastrar");
        }
      } else {
        const res = await fetch(`${API_URL}/api/face/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ descriptor }),
        });
        const data = await res.json();
        if (res.ok && data.match) {
          setStatus("success"); setMessage(`Identificado: ${data.user.name} (${data.confidence}%)`);
          stopCamera(); onVerified?.(data.user, data.confidence);
        } else {
          setStatus("fail"); setMessage(data.message || "Rosto não reconhecido");
          setTimeout(() => setStatus("camera-ready"), 2500);
        }
      }
    } catch {
      setStatus("error"); setMessage("Erro ao processar imagem");
    }
  };

  // Auto-verify contínuo no modo verify
  useEffect(() => {
    if (method !== "webcam" || mode !== "verify" || status !== "camera-ready") return;
    const interval = setInterval(captureWebcam, 2500);
    return () => clearInterval(interval);
  }, [method, mode, status]);

  // ============================================
  // MÉTODO 2: QR CODE (celular)
  // ============================================

  const startQrCode = async () => {
    setMethod("qrcode");
    setQrMessage("Gerando sessão...");

    try {
      const res = await fetch(`${API_URL}/api/face/qr-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ purpose: mode, userId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setQrMessage(data.error || "Erro ao gerar sessão");
        return;
      }

      const data = await res.json();
      setSessionId(data.sessionId);
      setQrMessage("Escaneie o QR Code com seu celular");

      // Polling a cada 2s para verificar se celular completou
      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`${API_URL}/api/face/qr-session/${data.sessionId}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          });

          if (!pollRes.ok) {
            stopPolling();
            setQrMessage("Sessão expirada. Gere um novo QR Code.");
            setSessionId(null);
            return;
          }

          const pollData = await pollRes.json();

          if (pollData.status === "completed") {
            stopPolling();

            if (mode === "register") {
              setStatus("success");
              setMessage("Rosto cadastrado via celular!");
            } else {
              if (pollData.result?.match) {
                setStatus("success");
                setMessage(`Identificado: ${pollData.result.matchedUserName} (${pollData.result.confidence}%)`);
                onVerified?.(
                  { id: pollData.result.matchedUserId, name: pollData.result.matchedUserName, email: "" },
                  pollData.result.confidence
                );
              } else {
                setStatus("fail");
                setMessage("Rosto não reconhecido");
              }
            }
          }
        } catch { /* silently ignore */ }
      }, 2000);

    } catch {
      setQrMessage("Erro de conexão com o servidor");
    }
  };

  // ============================================
  // RENDER
  // ============================================

  // Tela de seleção de método
  if (method === "select" && status !== "success") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-neutral-600 text-center mb-2">
          Como deseja {mode === "register" ? "cadastrar o rosto" : "verificar sua identidade"}?
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={startWebcam}
            className="flex flex-col items-center gap-3 p-6 bg-neutral-50 hover:bg-primary-50 border-2 border-neutral-200 hover:border-primary-300 rounded-2xl transition-colors"
          >
            <Camera size={32} className="text-primary-700" />
            <span className="font-semibold text-neutral-900 text-center">Usar câmera agora</span>
            <span className="text-xs text-neutral-500 text-center">Do computador ou do próprio celular</span>
          </button>
          <button
            type="button"
            onClick={startQrCode}
            className="flex flex-col items-center gap-3 p-6 bg-neutral-50 hover:bg-primary-50 border-2 border-neutral-200 hover:border-primary-300 rounded-2xl transition-colors"
          >
            <Smartphone size={32} className="text-primary-700" />
            <span className="font-semibold text-neutral-900 text-center">QR Code em outro celular</span>
            <span className="text-xs text-neutral-500 text-center">Se a câmera não estiver disponível aqui</span>
          </button>
        </div>
        {status === "error" && (
          <p className="text-sm text-secondary-600 text-center">{message}</p>
        )}
        <p className="text-xs text-neutral-400 text-center">
          Processamento local. Nenhuma foto é armazenada.
        </p>
      </div>
    );
  }

  // QR Code
  if (method === "qrcode" && status !== "success" && status !== "fail") {
    return (
      <div className="space-y-4 text-center">
        {sessionId ? (
          <>
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 inline-block mx-auto">
              <QRCodeCanvas
                value={`${SITE_URL}/face/${sessionId}`}
                size={220}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="M"
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-primary-700">
              <Loader2 size={16} className="animate-spin" />
              <p className="text-sm font-semibold">{qrMessage}</p>
            </div>
            <p className="text-xs text-neutral-500">
              Abra a câmera do celular, escaneie o QR Code e siga as instruções.
              <br />A sessão expira em 5 minutos.
            </p>
            <button
              type="button"
              onClick={() => { stopPolling(); setSessionId(null); setMethod("select"); }}
              className="text-sm text-neutral-500 hover:text-neutral-700 underline"
            >
              Cancelar
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center gap-2 text-neutral-400 py-8">
            <Loader2 size={20} className="animate-spin" />
            <p className="text-sm">{qrMessage}</p>
          </div>
        )}
      </div>
    );
  }

  // Webcam ou resultado
  return (
    <div className="space-y-4">
      <div className="relative bg-neutral-900 rounded-2xl overflow-hidden aspect-[4/3] max-w-md mx-auto">
        {status === "success" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-4">
            <CheckCircle size={48} className="text-accent-400" />
            <p className="text-lg font-bold text-white">{message}</p>
          </div>
        ) : status === "fail" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-4">
            <XCircle size={48} className="text-secondary-400" />
            <p className="text-base font-semibold text-white">{message}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ transform: "scaleX(-1)" }} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-48 h-60 rounded-full border-4 border-dashed transition-colors ${
                status === "detecting" ? "border-warm-400" : "border-white/40"
              }`} />
            </div>
            {status === "loading-models" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="flex items-center gap-2 text-white">
                  <Loader2 size={20} className="animate-spin" /> Carregando IA...
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {status !== "idle" && status !== "success" && (
        <p className={`text-sm font-semibold text-center ${
          status === "fail" ? "text-secondary-500" : status === "error" ? "text-secondary-600" : "text-primary-600"
        }`}>{message}</p>
      )}

      {mode === "register" && status === "camera-ready" && (
        <div className="flex justify-center gap-3">
          <button type="button" onClick={captureWebcam}
            className="px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-xl">
            Capturar Rosto
          </button>
          <button type="button" onClick={() => { stopCamera(); setMethod("select"); setStatus("idle"); }}
            className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-semibold rounded-xl">
            Voltar
          </button>
        </div>
      )}

      {mode === "verify" && (status === "camera-ready" || status === "detecting") && (
        <div className="flex justify-center">
          <button type="button" onClick={() => { stopCamera(); setMethod("select"); setStatus("idle"); }}
            className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-semibold rounded-xl">
            Voltar
          </button>
        </div>
      )}

      <p className="text-xs text-neutral-400 text-center max-w-sm mx-auto">
        Processamento local no navegador. Nenhuma foto é armazenada.
      </p>
    </div>
  );
}
