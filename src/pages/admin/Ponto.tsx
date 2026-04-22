import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  LogIn,
  Coffee,
  UtensilsCrossed,
  LogOut,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  ScanFace,
} from "lucide-react";
import { FaceCapture } from "@/components/ui/FaceCapture";

const API_URL = import.meta.env.VITE_API_URL || "";

interface PunchRecord {
  id: number;
  type: string;
  timestamp: string;
  latitude: string | null;
  longitude: string | null;
  notes: string | null;
}

interface UserData {
  name: string;
  role: string;
}

const punchTypes = [
  { type: "entrada", label: "Entrada", icon: LogIn, color: "bg-accent-600 hover:bg-accent-700" },
  { type: "saida_almoco", label: "Saída Almoço", icon: UtensilsCrossed, color: "bg-warm-500 hover:bg-yellow-600" },
  { type: "volta_almoco", label: "Volta Almoço", icon: Coffee, color: "bg-primary-600 hover:bg-primary-700" },
  { type: "saida", label: "Saída", icon: LogOut, color: "bg-secondary-500 hover:bg-secondary-600" },
];

const typeLabels: Record<string, string> = {
  entrada: "Entrada",
  saida_almoco: "Saída Almoço",
  volta_almoco: "Volta Almoço",
  saida: "Saída",
};

function getToken(): string {
  return localStorage.getItem("cvi-token") || "";
}

export function Ponto() {
  const { user } = useOutletContext<{ user: UserData }>();
  const [records, setRecords] = useState<PunchRecord[]>([]);
  const [time, setTime] = useState(new Date());
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: string; lng: string } | null>(null);
  const [showFace, setShowFace] = useState(false);
  const [faceVerified, setFaceVerified] = useState<{ name: string; confidence: number } | null>(null);

  // Relógio em tempo real
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Buscar geolocalização
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude.toFixed(6),
            lng: pos.coords.longitude.toFixed(6),
          });
        },
        () => setLocation(null)
      );
    }
  }, []);

  // Buscar registros de hoje
  const fetchToday = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/ponto/hoje`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records);
      }
    } catch {
      /* silently ignore — backend pode não estar rodando ainda */
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  // Tipos que exigem reconhecimento facial
  const FACE_REQUIRED_TYPES = ["entrada", "saida"];

  // Registrar ponto
  const handlePunch = async (type: string) => {
    // Bloquear se tipo exige face e não foi verificado
    if (FACE_REQUIRED_TYPES.includes(type) && !faceVerified) {
      setStatus("error");
      setStatusMsg("Reconhecimento facial obrigatório para Entrada e Saída. Verifique sua identidade primeiro.");
      setTimeout(() => setStatus("idle"), 4000);
      return;
    }

    setLoading(true);
    setStatus("idle");
    try {
      const res = await fetch(`${API_URL}/api/ponto/registrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        credentials: "include",
        body: JSON.stringify({
          type,
          latitude: location?.lat,
          longitude: location?.lng,
          faceVerified: FACE_REQUIRED_TYPES.includes(type) ? true : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const geo = data.geofence;
        if (geo && !geo.within) {
          setStatus("success");
          setStatusMsg(`${typeLabels[type]} registrada — ⚠️ fora do perímetro (${Math.round(geo.distance)}m da sede, limite: ${geo.radius}m)`);
        } else {
          setStatus("success");
          setStatusMsg(`${typeLabels[type]} registrada com sucesso! ✓ Dentro do perímetro`);
        }
        fetchToday();
      } else {
        setStatus("error");
        setStatusMsg(data.error || "Erro ao registrar ponto");
      }
    } catch {
      setStatus("error");
      setStatusMsg("Erro de conexão com o servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-neutral-900">Registro de Ponto</h1>
        <p className="text-neutral-500 mt-1">{user.name}</p>
      </div>

      {/* Relógio grande */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200 p-5 sm:p-12 text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
          <Clock size={14} aria-hidden="true" />
          {time.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>

        <p className="text-4xl sm:text-6xl lg:text-8xl font-bold text-neutral-900 tabular-nums tracking-tight leading-none mb-2">
          {time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </p>

        {location && (
          <p className="text-xs text-neutral-400 flex items-center justify-center gap-1 mt-4">
            <MapPin size={12} aria-hidden="true" />
            Localização capturada: {location.lat}, {location.lng}
          </p>
        )}

        {/* Status feedback */}
        {status !== "idle" && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
              status === "success"
                ? "bg-accent-50 text-accent-700 border border-accent-200"
                : "bg-secondary-50 text-secondary-700 border border-secondary-200"
            }`}
          >
            {status === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
            {statusMsg}
          </div>
        )}
      </div>

      {/* Reconhecimento facial — obrigatório para Entrada e Saída */}
      <div className="mb-6 sm:mb-8">
        {!showFace ? (
          <button
            type="button"
            onClick={() => setShowFace(true)}
            className={`w-full flex items-center justify-center gap-3 font-semibold py-4 rounded-2xl transition-colors ${
              faceVerified
                ? "bg-accent-600 text-white"
                : "bg-neutral-800 hover:bg-neutral-900 text-white"
            }`}
          >
            <ScanFace size={22} aria-hidden="true" />
            {faceVerified
              ? `Identidade confirmada: ${faceVerified.name} (${faceVerified.confidence}%)`
              : "Verificar identidade — obrigatório para Entrada e Saída"
            }
          </button>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-primary-200 p-5 sm:p-8">
            <h3 className="text-lg font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <ScanFace size={20} aria-hidden="true" className="text-primary-700" />
              Reconhecimento Facial
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
              Obrigatório para registrar <strong>Entrada</strong> e <strong>Saída</strong>. Almoço requer apenas localização GPS.
            </p>
            <FaceCapture
              mode="verify"
              onVerified={(verifiedUser, confidence) => {
                setFaceVerified({ name: verifiedUser.name, confidence });
                setShowFace(false);
                setStatus("success");
                setStatusMsg(`Identidade confirmada: ${verifiedUser.name} (${confidence}% confiança)`);
                setTimeout(() => setStatus("idle"), 4000);
              }}
              onError={(msg) => {
                setStatus("error");
                setStatusMsg(msg);
                setTimeout(() => setStatus("idle"), 3000);
              }}
            />
          </div>
        )}
      </div>

      {/* Botões de registro */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {punchTypes.map((pt) => {
          const needsFace = FACE_REQUIRED_TYPES.includes(pt.type);
          const blocked = needsFace && !faceVerified;
          return (
            <button
              key={pt.type}
              type="button"
              onClick={() => handlePunch(pt.type)}
              disabled={loading || blocked}
              className={`${blocked ? "bg-neutral-300 cursor-not-allowed" : pt.color} text-white font-semibold py-5 rounded-2xl flex flex-col items-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed transition-colors
                focus-visible:ring-4 focus-visible:ring-primary-300 relative`}
            >
              <pt.icon size={28} aria-hidden="true" />
              <span>{pt.label}</span>
              {needsFace && (
                <span className={`text-[10px] uppercase tracking-wider font-bold mt-1 flex items-center gap-1 ${
                  faceVerified ? "text-white/70" : "text-white/50"
                }`}>
                  <ScanFace size={12} aria-hidden="true" />
                  {faceVerified ? "Face OK" : "Requer face"}
                </span>
              )}
              {!needsFace && (
                <span className="text-[10px] uppercase tracking-wider font-bold mt-1 text-white/70 flex items-center gap-1">
                  <MapPin size={12} aria-hidden="true" />
                  Só GPS
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Registros de hoje */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-200">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900">Registros de Hoje</h2>
        </div>

        {records.length === 0 ? (
          <div className="px-4 sm:px-6 py-10 sm:py-12 text-center text-neutral-400">
            <Clock size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum registro para hoje.</p>
            <p className="text-xs mt-1">Clique em um dos botões acima para registrar seu ponto.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-semibold">Tipo</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-semibold">Horário</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-semibold hidden sm:table-cell">Localização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800">
                        {typeLabels[r.type] || r.type}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm tabular-nums text-neutral-700">
                      {new Date(r.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs text-neutral-400 hidden sm:table-cell">
                      {r.latitude && r.longitude ? `${r.latitude}, ${r.longitude}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
