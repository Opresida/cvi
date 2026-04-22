import { useEffect, useState, useCallback } from "react";
import { AlertCircle, X, Check, MessageSquare, Calculator, Clock } from "lucide-react";
import { TreatmentSummary } from "./TreatmentSummary";

const API_URL = "";
function getToken() { return localStorage.getItem("cvi-token") || ""; }

interface PendingTreatment {
  id: number;
  userId: number;
  referenceMonth: string;
  discountAmount: string;
  bonusAmount: string;
  notes: string | null;
  status: string;
  submittedAt: string | null;
}

function formatBRL(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function monthLabel(refMonth: string) {
  const [y, m] = refMonth.split("-").map(Number);
  return new Date(y, m - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function hoursRemaining(submittedAt: string): { hours: number; mins: number; expired: boolean } {
  const deadline = new Date(submittedAt).getTime() + 24 * 60 * 60 * 1000;
  const diffMs = deadline - Date.now();
  if (diffMs <= 0) return { hours: 0, mins: 0, expired: true };
  return {
    hours: Math.floor(diffMs / 3600000),
    mins: Math.floor((diffMs % 3600000) / 60000),
    expired: false,
  };
}

interface Props {
  userId: number;
}

export function PendingTreatmentAlert({ userId }: Props) {
  const [pending, setPending] = useState<PendingTreatment[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [action, setAction] = useState<"approve" | "question" | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/treatments`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        const mine = (data.treatments as PendingTreatment[]).filter(
          (t) => t.userId === userId && t.status === "submitted_to_employee"
        );
        setPending(mine);
      }
    } catch { /* ignore */ }
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  // Re-renderiza a cada minuto para atualizar o timer
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // Re-checa a cada 2 minutos (caso admin envie enquanto o funcionário está logado)
  useEffect(() => {
    const id = setInterval(() => refresh(), 120000);
    return () => clearInterval(id);
  }, [refresh]);

  // silencia warning do tick não usado; força re-render
  void tick;

  const current = pending.find((p) => p.id === openId) || null;

  async function handleApprove(id: number) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/treatments/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setOpenId(null);
        setAction(null);
        setQuestionText("");
        refresh();
      } else {
        const d = await res.json();
        setError(d.error || "Erro ao aprovar");
      }
    } catch { setError("Erro de conexão"); }
    finally { setLoading(false); }
  }

  async function handleQuestion(id: number) {
    if (questionText.trim().length < 10) {
      setError("Descreva sua questão com pelo menos 10 caracteres");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/treatments/${id}/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ question: questionText }),
      });
      if (res.ok) {
        setOpenId(null);
        setAction(null);
        setQuestionText("");
        refresh();
      } else {
        const d = await res.json();
        setError(d.error || "Erro ao enviar");
      }
    } catch { setError("Erro de conexão"); }
    finally { setLoading(false); }
  }

  if (pending.length === 0) return null;

  return (
    <>
      {/* Banner sticky no topo */}
      <div className="sticky top-16 z-30 bg-warm-500 text-white px-4 sm:px-6 py-2.5 shadow-lg">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-sm font-semibold truncate">
              {pending.length === 1
                ? "Você tem um tratamento de ponto aguardando revisão"
                : `Você tem ${pending.length} tratamentos aguardando revisão`}
            </p>
          </div>
          <button type="button" onClick={() => setOpenId(pending[0].id)}
            className="shrink-0 bg-white hover:bg-neutral-50 text-neutral-900 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm">
            Revisar agora
          </button>
        </div>
      </div>

      {/* Modal de revisão */}
      {current && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => !loading && (setOpenId(null), setAction(null), setQuestionText(""), setError(""))}>
          <div className="bg-white rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Calculator size={18} className="text-primary-700" />
                Revisar tratamento
              </h2>
              <button type="button" disabled={loading}
                onClick={() => { setOpenId(null); setAction(null); setQuestionText(""); setError(""); }}
                className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-50">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-xl">
              <p className="text-xs uppercase tracking-wider text-primary-700 font-bold mb-1">Mês de referência</p>
              <p className="text-base font-bold text-neutral-900 capitalize">{monthLabel(current.referenceMonth)}</p>
            </div>

            {/* Timer */}
            {current.submittedAt && (() => {
              const r = hoursRemaining(current.submittedAt);
              return (
                <div className="mb-4 p-3 bg-warm-50 border border-warm-200 rounded-xl flex items-center gap-2">
                  <Clock size={16} className="text-warm-500 shrink-0" />
                  <p className="text-xs text-neutral-800">
                    {r.expired
                      ? "Prazo expirado — será aprovado automaticamente em instantes"
                      : <>Você tem <strong className="tabular-nums">{r.hours}h {r.mins}min</strong> para aprovar ou questionar. Passado esse prazo, o tratamento é aprovado automaticamente.</>}
                  </p>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-neutral-50 rounded-xl">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Desconto</p>
                <p className="text-base font-bold text-secondary-600 tabular-nums">{formatBRL(current.discountAmount)}</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Abono</p>
                <p className="text-base font-bold text-accent-600 tabular-nums">{formatBRL(current.bonusAmount)}</p>
              </div>
            </div>

            {current.notes && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-neutral-700 mb-1">Detalhamento do RH:</p>
                <div className="p-3 bg-neutral-50 rounded-xl">
                  <p className="text-sm text-neutral-800 whitespace-pre-wrap">{current.notes}</p>
                </div>
              </div>
            )}

            {/* Detalhamento completo — pontos + ajustes do mês */}
            <div className="mb-4 pt-4 border-t border-neutral-200">
              <TreatmentSummary treatmentId={current.id} />
            </div>

            {action === "question" && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-neutral-800 mb-1 flex items-center gap-1.5">
                  <MessageSquare size={14} /> Descreva seu questionamento
                </label>
                <textarea rows={4} maxLength={2000} value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Explique o que está incorreto ou que gostaria de ajustar no tratamento..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white focus:border-primary-500 outline-none text-sm resize-y" />
                <p className="text-xs text-neutral-400 mt-1">Mínimo 10 caracteres. O tratamento volta para o RH corrigir.</p>
              </div>
            )}

            {error && (
              <div role="alert" className="mb-3 px-3 py-2 rounded-lg bg-secondary-50 border border-secondary-200 text-secondary-700 text-sm">
                {error}
              </div>
            )}

            {/* Botões de ação */}
            {action === null && (
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-200">
                <button type="button" onClick={() => setAction("question")} disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-sm font-semibold px-4 py-2.5 rounded-xl">
                  <MessageSquare size={16} /> Questionar
                </button>
                <button type="button" onClick={() => handleApprove(current.id)} disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50">
                  <Check size={16} /> {loading ? "Aprovando..." : "Aprovar"}
                </button>
              </div>
            )}

            {action === "question" && (
              <div className="flex gap-2 pt-3 border-t border-neutral-200">
                <button type="button" onClick={() => { setAction(null); setQuestionText(""); setError(""); }} disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm text-neutral-700 hover:bg-neutral-100 font-medium">
                  Voltar
                </button>
                <button type="button" onClick={() => handleQuestion(current.id)} disabled={loading || questionText.trim().length < 10}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-warm-500 hover:brightness-110 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50">
                  <MessageSquare size={16} /> {loading ? "Enviando..." : "Enviar questionamento"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
