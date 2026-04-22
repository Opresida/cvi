import { useEffect, useState } from "react";
import {
  Clock, LogIn, LogOut, UtensilsCrossed, Coffee, Paperclip, CheckCircle2, XCircle, CircleDashed,
} from "lucide-react";

const API_URL = "";
function getToken() { return localStorage.getItem("cvi-token") || ""; }

interface Props {
  treatmentId: number;
}

interface PunchRec {
  id: number;
  type: string;
  timestamp: string;
  status: string;
}

interface AdjRec {
  id: number;
  requestedType: string;
  requestedTimestamp: string;
  reason: string;
  attachmentFileId: number | null;
  status: string;
  reviewNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

const punchTypeLabels: Record<string, string> = {
  entrada: "Entrada",
  saida_almoco: "S. Almoço",
  volta_almoco: "V. Almoço",
  saida: "Saída",
};

const punchTypeIcons: Record<string, typeof Clock> = {
  entrada: LogIn,
  saida_almoco: UtensilsCrossed,
  volta_almoco: Coffee,
  saida: LogOut,
};

const adjStatusLabels: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

const adjStatusStyles: Record<string, string> = {
  pendente: "bg-warm-100 text-warm-500 border-warm-200",
  aprovado: "bg-accent-50 text-accent-700 border-accent-200",
  rejeitado: "bg-secondary-50 text-secondary-700 border-secondary-200",
};

const adjStatusIcons: Record<string, typeof CheckCircle2> = {
  pendente: CircleDashed,
  aprovado: CheckCircle2,
  rejeitado: XCircle,
};

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateShort(ts: string) {
  return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatDateTime(ts: string) {
  return new Date(ts).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function TreatmentSummary({ treatmentId }: Props) {
  const [punches, setPunches] = useState<PunchRec[]>([]);
  const [adjustments, setAdjustments] = useState<AdjRec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_URL}/api/treatments/summary/${treatmentId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (cancelled) return;
        setPunches(data.punchRecords || []);
        setAdjustments(data.adjustments || []);
      })
      .catch(() => { /* ignore */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [treatmentId]);

  // Agrupar pontos por dia
  const punchesByDay: Record<string, PunchRec[]> = {};
  for (const p of punches) {
    const day = new Date(p.timestamp).toISOString().slice(0, 10);
    if (!punchesByDay[day]) punchesByDay[day] = [];
    punchesByDay[day].push(p);
  }

  function openAttachment(adjId: number) {
    fetch(`${API_URL}/api/adjustments/${adjId}/attachment`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.ok ? r.blob() : Promise.reject())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      })
      .catch(() => alert("Não foi possível abrir o anexo"));
  }

  if (loading) {
    return <p className="text-xs text-neutral-400 text-center py-3">Carregando detalhes...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Pontos batidos no mês */}
      <details className="group" open>
        <summary className="flex items-center gap-2 cursor-pointer list-none py-1">
          <Clock size={14} className="text-primary-700" />
          <span className="text-sm font-semibold text-neutral-800">
            Pontos batidos no mês ({punches.length})
          </span>
          <span className="ml-auto text-xs text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-2">
          {Object.keys(punchesByDay).length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4 bg-neutral-50 rounded-lg">
              Nenhum ponto registrado neste mês.
            </p>
          ) : (
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-neutral-50 sticky top-0">
                    <tr className="text-left text-[10px] uppercase tracking-wider text-neutral-500">
                      <th className="px-2 py-2 font-semibold">Data</th>
                      <th className="px-2 py-2 font-semibold">Pontos do dia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {Object.entries(punchesByDay).sort(([a], [b]) => a.localeCompare(b)).map(([day, recs]) => {
                      const hasIssue = recs.some(r => r.status === "fora_perimetro");
                      return (
                        <tr key={day} className={hasIssue ? "bg-warm-50/40" : ""}>
                          <td className="px-2 py-2 tabular-nums font-medium whitespace-nowrap">
                            {formatDateShort(day + "T12:00:00")}
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex flex-wrap gap-1.5">
                              {recs.map((r) => {
                                const Icon = punchTypeIcons[r.type] || Clock;
                                return (
                                  <span key={r.id} className="inline-flex items-center gap-1 bg-white border border-neutral-200 rounded px-1.5 py-0.5 tabular-nums">
                                    <Icon size={10} className="text-neutral-500" />
                                    <span className="text-neutral-700">{formatTime(r.timestamp)}</span>
                                  </span>
                                );
                              })}
                              {hasIssue && (
                                <span className="text-[9px] uppercase font-bold text-warm-500 ml-1">fora perímetro</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </details>

      {/* Ajustes/atestados do mês */}
      <details className="group" open={adjustments.length > 0}>
        <summary className="flex items-center gap-2 cursor-pointer list-none py-1">
          <Paperclip size={14} className="text-primary-700" />
          <span className="text-sm font-semibold text-neutral-800">
            Ajustes solicitados no mês ({adjustments.length})
          </span>
          <span className="ml-auto text-xs text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-2">
          {adjustments.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4 bg-neutral-50 rounded-lg">
              Nenhum ajuste solicitado neste mês.
            </p>
          ) : (
            <div className="space-y-2">
              {adjustments.map((adj) => {
                const StatusIcon = adjStatusIcons[adj.status] || CircleDashed;
                return (
                  <div key={adj.id} className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-xs font-bold text-neutral-900">
                            {punchTypeLabels[adj.requestedType] || adj.requestedType}
                          </span>
                          <span className="text-xs text-neutral-500 tabular-nums">
                            {formatDateTime(adj.requestedTimestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600">{adj.reason}</p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full border ${adjStatusStyles[adj.status]}`}>
                        <StatusIcon size={10} />
                        {adjStatusLabels[adj.status]}
                      </span>
                    </div>
                    {adj.reviewNotes && (
                      <p className="text-[11px] text-neutral-500 bg-neutral-50 rounded px-2 py-1 mt-1">
                        <strong>RH:</strong> {adj.reviewNotes}
                      </p>
                    )}
                    {adj.attachmentFileId && (
                      <button type="button" onClick={() => openAttachment(adj.id)}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary-700 font-semibold hover:underline">
                        <Paperclip size={10} /> Ver anexo
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
