import { useState, useEffect, useCallback, useMemo } from "react";
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
  Search,
  Users,
} from "lucide-react";
import { FaceCapture } from "@/components/ui/FaceCapture";

const API_URL = "";

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
  hasLunchBreak?: boolean;
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

interface AllRecord {
  id: number;
  userId: number;
  userName: string;
  userDepartment: string | null;
  type: string;
  timestamp: string;
  status: string;
}

interface EmployeeBrief {
  id: number;
  name: string;
  department: string | null;
  requiresPunch: boolean;
  active: boolean;
}

type PresenceStatus = "ausente" | "trabalhando" | "almoco" | "saiu";

const presenceBadgeStyle: Record<PresenceStatus, string> = {
  ausente: "bg-neutral-100 text-neutral-500",
  trabalhando: "bg-accent-50 text-accent-700 border border-accent-200",
  almoco: "bg-warm-100 text-warm-500 border border-warm-200",
  saiu: "bg-primary-50 text-primary-700 border border-primary-200",
};

const presenceLabel: Record<PresenceStatus, string> = {
  ausente: "Ausente",
  trabalhando: "Presente",
  almoco: "Em almoço",
  saiu: "Saiu",
};

function formatHHMM(ts: string) {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function Ponto() {
  const { user } = useOutletContext<{ user: UserData }>();
  const isAdminOrManager = user.role === "admin" || user.role === "gestor";
  const hasLunch = user.hasLunchBreak !== false; // padrão true se ausente
  const [records, setRecords] = useState<PunchRecord[]>([]);
  const [time, setTime] = useState(new Date());
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: string; lng: string } | null>(null);
  const [showFace, setShowFace] = useState(false);
  const [faceVerified, setFaceVerified] = useState<{ name: string; confidence: number } | null>(null);

  // Presença de hoje (apenas admin/gestor)
  const [allRecords, setAllRecords] = useState<AllRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeBrief[]>([]);
  const [presenceSearch, setPresenceSearch] = useState("");

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

  // Carregar presença de todos (admin/gestor) com refresh a cada 30s
  const fetchPresence = useCallback(async () => {
    if (!isAdminOrManager) return;
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [todosRes, empRes] = await Promise.all([
        fetch(`${API_URL}/api/ponto/todos?dias=1`, { headers, credentials: "include" }),
        fetch(`${API_URL}/api/employees`, { headers, credentials: "include" }),
      ]);
      if (todosRes.ok) {
        const data = await todosRes.json();
        setAllRecords(data.records);
      }
      if (empRes.ok) {
        const data = await empRes.json();
        setEmployees(data.employees.filter((e: EmployeeBrief) => e.requiresPunch && e.active));
      }
    } catch { /* ignore */ }
  }, [isAdminOrManager]);

  useEffect(() => {
    fetchPresence();
    if (!isAdminOrManager) return;
    const interval = setInterval(fetchPresence, 30000); // refresh 30s
    return () => clearInterval(interval);
  }, [fetchPresence, isAdminOrManager]);

  // Derivar lista de presença com status calculado
  const presenceList = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return employees
      .map((emp) => {
        const empRecords = allRecords.filter(
          (r) => r.userId === emp.id && new Date(r.timestamp) >= todayStart
        );
        const entrada = empRecords.find((r) => r.type === "entrada");
        const saidaAlmoco = empRecords.find((r) => r.type === "saida_almoco");
        const voltaAlmoco = empRecords.find((r) => r.type === "volta_almoco");
        const saida = empRecords.find((r) => r.type === "saida");

        let st: PresenceStatus = "ausente";
        if (saida) st = "saiu";
        else if (saidaAlmoco && !voltaAlmoco) st = "almoco";
        else if (entrada) st = "trabalhando";

        return {
          id: emp.id,
          name: emp.name,
          department: emp.department,
          status: st,
          entrada: entrada?.timestamp,
          saidaAlmoco: saidaAlmoco?.timestamp,
          voltaAlmoco: voltaAlmoco?.timestamp,
          saida: saida?.timestamp,
        };
      })
      .filter((p) =>
        !presenceSearch ||
        p.name.toLowerCase().includes(presenceSearch.toLowerCase()) ||
        (p.department || "").toLowerCase().includes(presenceSearch.toLowerCase())
      )
      .sort((a, b) => {
        // Ordenar: ausentes por último, resto por status depois por nome
        const order: Record<PresenceStatus, number> = { trabalhando: 0, almoco: 1, saiu: 2, ausente: 3 };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        return a.name.localeCompare(b.name);
      });
  }, [employees, allRecords, presenceSearch]);

  const presenceStats = useMemo(() => {
    const counts = { trabalhando: 0, almoco: 0, saiu: 0, ausente: 0 };
    for (const p of presenceList) counts[p.status]++;
    return counts;
  }, [presenceList]);

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
            className={`w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 font-semibold px-3 py-3 sm:py-4 rounded-2xl transition-colors text-center text-sm sm:text-base ${
              faceVerified
                ? "bg-accent-600 text-white"
                : "bg-neutral-800 hover:bg-neutral-900 text-white"
            }`}
          >
            <ScanFace size={22} aria-hidden="true" className="shrink-0" />
            <span className="leading-tight">
              {faceVerified
                ? `Identidade confirmada: ${faceVerified.name} (${faceVerified.confidence}%)`
                : "Verificar identidade — obrigatório para Entrada e Saída"
              }
            </span>
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

      {/* Aviso — jornada sem almoço */}
      {!hasLunch && (
        <div role="note" className="mb-4 px-4 py-3 rounded-xl bg-primary-50 border border-primary-200 text-primary-800 text-xs sm:text-sm flex items-start gap-2">
          <UtensilsCrossed size={16} aria-hidden="true" className="shrink-0 mt-0.5" />
          <span>Sua jornada é <strong>sem intervalo de almoço</strong>. Registre apenas Entrada e Saída.</span>
        </div>
      )}

      {/* Botões de registro */}
      <div className={`grid gap-4 mb-8 ${hasLunch ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"}`}>
        {punchTypes
          .filter((pt) => hasLunch || !["saida_almoco", "volta_almoco"].includes(pt.type))
          .map((pt) => {
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

      {/* Registros de hoje (próprio usuário) */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-200">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900">Meus registros de hoje</h2>
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

      {/* Presença de hoje — apenas admin/gestor */}
      {isAdminOrManager && (
        <div className="mt-6 sm:mt-8 bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Users size={18} aria-hidden="true" />
              Presença de hoje
            </h2>
            <div className="flex items-center gap-2 flex-wrap text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-500" /> {presenceStats.trabalhando} presente{presenceStats.trabalhando !== 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warm-100 text-warm-500 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-warm-500" /> {presenceStats.almoco} almoço
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-500" /> {presenceStats.saiu} saiu
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" /> {presenceStats.ausente} ausente{presenceStats.ausente !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Busca */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar por nome ou departamento..."
                value={presenceSearch}
                onChange={(e) => setPresenceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
          </div>

          {/* Lista */}
          {presenceList.length === 0 ? (
            <div className="px-4 sm:px-6 py-10 sm:py-12 text-center text-neutral-400">
              <Users size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                {employees.length === 0
                  ? "Nenhum funcionário cadastrado que bate ponto."
                  : "Nenhum resultado para essa busca."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {presenceList.map((p) => (
                <div key={p.id} className="px-4 sm:px-6 py-3 sm:py-4 flex items-start sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-neutral-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{p.department || "—"}</p>
                    {(p.entrada || p.saidaAlmoco || p.voltaAlmoco || p.saida) && (
                      <div className="mt-1.5 flex items-center gap-2 sm:gap-3 text-[11px] text-neutral-500 tabular-nums flex-wrap">
                        {p.entrada && (
                          <span className="inline-flex items-center gap-1">
                            <LogIn size={11} aria-hidden="true" /> {formatHHMM(p.entrada)}
                          </span>
                        )}
                        {p.saidaAlmoco && (
                          <span className="inline-flex items-center gap-1">
                            <UtensilsCrossed size={11} aria-hidden="true" /> {formatHHMM(p.saidaAlmoco)}
                          </span>
                        )}
                        {p.voltaAlmoco && (
                          <span className="inline-flex items-center gap-1">
                            <Coffee size={11} aria-hidden="true" /> {formatHHMM(p.voltaAlmoco)}
                          </span>
                        )}
                        {p.saida && (
                          <span className="inline-flex items-center gap-1">
                            <LogOut size={11} aria-hidden="true" /> {formatHHMM(p.saida)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className={`shrink-0 text-[10px] sm:text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${presenceBadgeStyle[p.status]}`}>
                    {presenceLabel[p.status]}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 sm:px-6 py-2 text-[10px] text-neutral-400 border-t border-neutral-100 bg-neutral-50">
            Atualiza automaticamente a cada 30 segundos
          </div>
        </div>
      )}
    </div>
  );
}
