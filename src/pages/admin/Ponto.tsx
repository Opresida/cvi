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
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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

  // Registrar ponto
  const handlePunch = async (type: string) => {
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

      {/* Botões de registro */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {punchTypes.map((pt) => (
          <button
            key={pt.type}
            type="button"
            onClick={() => handlePunch(pt.type)}
            disabled={loading}
            className={`${pt.color} text-white font-semibold py-5 rounded-2xl flex flex-col items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors
              focus-visible:ring-4 focus-visible:ring-primary-300`}
          >
            <pt.icon size={28} aria-hidden="true" />
            <span>{pt.label}</span>
          </button>
        ))}
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
