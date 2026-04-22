import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { FileText, ChevronLeft, ChevronRight, Download } from "lucide-react";

const API_URL = "";
function getToken() { return localStorage.getItem("cvi-token") || ""; }

interface UserData { name: string; role: string; }
interface DayRecord {
  id: number;
  type: string;
  timestamp: string;
  status: string;
  distanceFromSede: string | null;
}

const statusColors: Record<string, string> = {
  valido: "text-accent-600",
  fora_perimetro: "text-warm-500",
  ajustado: "text-primary-600",
  ajuste_pendente: "text-neutral-400 line-through",
};

export function Timesheet() {
  const { user } = useOutletContext<{ user: UserData & { id: number } }>();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchEspelho = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ponto/espelho?mes=${month}&userId=${user.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [month, user.id]);

  useEffect(() => { fetchEspelho(); }, [fetchEspelho]);

  const navigateMonth = (dir: number) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setMonth(d.toISOString().slice(0, 7));
  };

  const monthLabel = (() => {
    const [y, m] = month.split("-").map(Number);
    return new Date(y, m - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  })();

  const handlePrint = () => window.print();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-neutral-900">Espelho de Ponto</h1>
          <p className="text-neutral-500 mt-1">{data?.employee?.name || user.name}</p>
        </div>
        <button type="button" onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-900 text-white font-semibold px-5 py-3 rounded-xl">
          <Download size={18} /> Imprimir / PDF
        </button>
      </div>

      {/* Navegação de mês */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
        <button type="button" onClick={() => navigateMonth(-1)}
          className="h-11 w-11 flex items-center justify-center rounded-lg hover:bg-neutral-200" aria-label="Mês anterior">
          <ChevronLeft size={20} />
        </button>
        <span className="text-base sm:text-lg font-bold text-neutral-900 capitalize min-w-0 sm:min-w-[200px] text-center">
          {monthLabel}
        </span>
        <button type="button" onClick={() => navigateMonth(1)}
          className="h-11 w-11 flex items-center justify-center rounded-lg hover:bg-neutral-200" aria-label="Próximo mês">
          <ChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-400">Carregando...</div>
      ) : !data ? (
        <div className="bg-white rounded-2xl border border-neutral-200 px-6 py-12 text-center text-neutral-400">
          <FileText size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Sem dados para este mês.</p>
        </div>
      ) : (
        <>
          {/* Resumo */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 text-center">
              <p className="text-3xl font-bold text-neutral-900">{data.totalDays}</p>
              <p className="text-sm text-neutral-500">Dias com registro</p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 text-center">
              <p className="text-3xl font-bold text-neutral-900">{data.totalPunches}</p>
              <p className="text-sm text-neutral-500">Total de marcações</p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 text-center">
              <p className="text-3xl font-bold text-neutral-900">{data.employee?.weeklyHours}h</p>
              <p className="text-sm text-neutral-500">Jornada semanal</p>
            </div>
          </div>

          {/* Cards (mobile) / Tabela (desktop) */}
          <div className="md:hidden space-y-3">
            {Object.entries(data.dailyRecords as Record<string, DayRecord[]>).map(([day, records]) => {
              const getTime = (type: string) => {
                const r = records.find((r) => r.type === type && r.status !== "ajuste_pendente");
                if (!r) return { text: "—", status: "" };
                return {
                  text: new Date(r.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                  status: r.status,
                };
              };
              const entrada = getTime("entrada");
              const saidaAlm = getTime("saida_almoco");
              const voltaAlm = getTime("volta_almoco");
              const saida = getTime("saida");
              const hasIssue = records.some((r) => r.status === "fora_perimetro");

              return (
                <div key={day} className={`bg-white rounded-2xl border p-4 ${hasIssue ? "border-warm-200 bg-warm-50/30" : "border-neutral-200"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-neutral-900 capitalize tabular-nums">
                      {new Date(day + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" })}
                    </p>
                    {hasIssue && (
                      <span className="text-[9px] uppercase tracking-wider font-bold text-warm-500 bg-warm-100 px-2 py-0.5 rounded-full">
                        Fora
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Entrada</p>
                      <p className={`tabular-nums font-semibold ${statusColors[entrada.status] || "text-neutral-800"}`}>{entrada.text}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Saída</p>
                      <p className={`tabular-nums font-semibold ${statusColors[saida.status] || "text-neutral-800"}`}>{saida.text}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">S. Almoço</p>
                      <p className={`tabular-nums ${statusColors[saidaAlm.status] || "text-neutral-700"}`}>{saidaAlm.text}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">V. Almoço</p>
                      <p className={`tabular-nums ${statusColors[voltaAlm.status] || "text-neutral-700"}`}>{voltaAlm.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden md:block bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
                    <th className="px-4 py-3 font-semibold">Data</th>
                    <th className="px-4 py-3 font-semibold">Entrada</th>
                    <th className="px-4 py-3 font-semibold">S. Almoço</th>
                    <th className="px-4 py-3 font-semibold">V. Almoço</th>
                    <th className="px-4 py-3 font-semibold">Saída</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {Object.entries(data.dailyRecords as Record<string, DayRecord[]>).map(([day, records]) => {
                    const getTime = (type: string) => {
                      const r = records.find((r) => r.type === type && r.status !== "ajuste_pendente");
                      if (!r) return { text: "—", status: "" };
                      return {
                        text: new Date(r.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                        status: r.status,
                      };
                    };
                    const entrada = getTime("entrada");
                    const saidaAlm = getTime("saida_almoco");
                    const voltaAlm = getTime("volta_almoco");
                    const saida = getTime("saida");
                    const hasIssue = records.some((r) => r.status === "fora_perimetro");

                    return (
                      <tr key={day} className={`hover:bg-neutral-50 ${hasIssue ? "bg-warm-50/50" : ""}`}>
                        <td className="px-4 py-3 text-sm font-medium text-neutral-900 tabular-nums whitespace-nowrap">
                          {new Date(day + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}
                        </td>
                        {[entrada, saidaAlm, voltaAlm, saida].map((t, i) => (
                          <td key={i} className={`px-4 py-3 text-sm tabular-nums font-medium whitespace-nowrap ${statusColors[t.status] || "text-neutral-700"}`}>
                            {t.text}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          {hasIssue && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-warm-500 bg-warm-100 px-2 py-0.5 rounded-full">
                              Fora do perímetro
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assinatura */}
          <div className="mt-6 sm:mt-8 grid sm:grid-cols-2 gap-4 sm:gap-8 print:mt-16">
            <div className="border-t-2 border-neutral-400 pt-3 text-center">
              <p className="text-sm text-neutral-700 font-semibold">{data.employee?.name}</p>
              <p className="text-xs text-neutral-500">Funcionário(a)</p>
            </div>
            <div className="border-t-2 border-neutral-400 pt-3 text-center">
              <p className="text-sm text-neutral-700 font-semibold">Gestão de RH — CVI Amazonas</p>
              <p className="text-xs text-neutral-500">Responsável</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
