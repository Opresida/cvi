import { useState, useEffect, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { ClipboardCheck, Check, X, Plus, Send, Paperclip, FileText } from "lucide-react";

const API_URL = "";
function getToken() { return localStorage.getItem("cvi-token") || ""; }

interface Adjustment {
  id: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  requestedType: string;
  requestedTimestamp: string;
  reason: string;
  attachmentFileId: number | null;
  status: string;
  createdAt: string;
  reviewNotes?: string | null;
}

interface UserData { role: string; }

const typeLabels: Record<string, string> = {
  entrada: "Entrada",
  saida_almoco: "Saída Almoço",
  volta_almoco: "Volta Almoço",
  saida: "Saída",
};

const statusStyles: Record<string, string> = {
  pendente: "bg-warm-100 text-warm-500",
  aprovado: "bg-accent-50 text-accent-700",
  rejeitado: "bg-secondary-50 text-secondary-700",
};

const statusLabels: Record<string, string> = {
  pendente: "Aguardando aprovação",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

export function Adjustments() {
  const { user } = useOutletContext<{ user: UserData }>();
  const isAdmin = user.role === "admin" || user.role === "gestor";

  const [pending, setPending] = useState<Adjustment[]>([]);
  const [mine, setMine] = useState<Adjustment[]>([]);
  const [tab, setTab] = useState<"pending" | "mine" | "new">(isAdmin ? "pending" : "mine");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Form de nova solicitação
  const [form, setForm] = useState({
    requestedType: "entrada",
    date: new Date().toISOString().slice(0, 10),
    time: "08:00",
    reason: "",
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) { setAttachment(null); return; }
    if (f.size > 10 * 1024 * 1024) {
      setMsg("Arquivo excede o limite de 10 MB");
      setTimeout(() => setMsg(""), 4000);
      e.target.value = "";
      return;
    }
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(f.type)) {
      setMsg("Apenas PDF, JPG ou PNG são permitidos");
      setTimeout(() => setMsg(""), 4000);
      e.target.value = "";
      return;
    }
    setAttachment(f);
  }

  function openAttachment(adjId: number) {
    const token = getToken();
    // Fetch com auth header (não dá pra usar simples <a href>)
    fetch(`${API_URL}/api/adjustments/${adjId}/attachment`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (!res.ok) throw new Error("Erro"); return res.blob(); })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      })
      .catch(() => {
        setMsg("Não foi possível abrir o anexo");
        setTimeout(() => setMsg(""), 4000);
      });
  }

  const fetchData = useCallback(async () => {
    try {
      if (isAdmin) {
        const res = await fetch(`${API_URL}/api/adjustments/pending`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) { const data = await res.json(); setPending(data.adjustments); }
      }
      const res2 = await fetch(`${API_URL}/api/adjustments/mine`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res2.ok) { const data = await res2.json(); setMine(data.adjustments); }
    } catch { /* ignore */ }
  }, [isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const timestamp = `${form.date}T${form.time}:00Z`;
      const fd = new FormData();
      fd.append("requestedType", form.requestedType);
      fd.append("requestedTimestamp", timestamp);
      fd.append("reason", form.reason);
      if (attachment) fd.append("attachment", attachment);

      const res = await fetch(`${API_URL}/api/adjustments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` }, // sem Content-Type: navegador define com boundary
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Solicitação enviada com sucesso! Aguarde a aprovação do RH.");
        setForm({ requestedType: "entrada", date: new Date().toISOString().slice(0, 10), time: "08:00", reason: "" });
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setTab("mine");
        fetchData();
      } else {
        setMsg(data.error || "Erro ao enviar solicitação");
      }
    } catch {
      setMsg("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 5000);
    }
  };

  const handleReview = async (id: number, status: "aprovado" | "rejeitado") => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/adjustments/${id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status, reviewNotes }),
      });
      if (res.ok) {
        setMsg(status === "aprovado" ? "Ajuste aprovado — registro criado" : "Ajuste rejeitado");
        setReviewNotes("");
        setReviewingId(null);
        fetchData();
      }
    } catch { /* ignore */ }
    setLoading(false);
    setTimeout(() => setMsg(""), 4000);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-neutral-900">Ajustes de Ponto</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {isAdmin ? "Gerencie solicitações de ajuste dos funcionários" : "Solicite correções nos seus registros de ponto"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTab("new")}
          className="inline-flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
        >
          <Plus size={18} /> Nova Solicitação
        </button>
      </div>

      {msg && (
        <div role="status" className="mb-6 px-4 py-3 rounded-xl bg-accent-50 border border-accent-200 text-accent-700 text-sm font-medium">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 mb-5 sm:mb-6 overflow-x-auto">
        {isAdmin && (
          <button type="button" onClick={() => setTab("pending")}
            className={`flex-1 py-2 px-2 sm:py-2.5 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap
              ${tab === "pending" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}>
            <span className="sm:hidden">Pend. ({pending.length})</span>
            <span className="hidden sm:inline">Pendentes ({pending.length})</span>
          </button>
        )}
        <button type="button" onClick={() => setTab("mine")}
          className={`flex-1 py-2 px-2 sm:py-2.5 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap
            ${tab === "mine" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}>
          <span className="sm:hidden">{isAdmin ? "Meus" : "Minhas"} ({mine.length})</span>
          <span className="hidden sm:inline">{isAdmin ? "Meus ajustes" : "Minhas solicitações"} ({mine.length})</span>
        </button>
        <button type="button" onClick={() => setTab("new")}
          className={`flex-1 py-2 px-2 sm:py-2.5 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap
            ${tab === "new" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}>
          <span className="sm:hidden">Nova</span>
          <span className="hidden sm:inline">Nova solicitação</span>
        </button>
      </div>

      {/* ============ ABA: NOVA SOLICITAÇÃO ============ */}
      {tab === "new" && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-8 max-w-2xl">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-1">Solicitar Ajuste de Ponto</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mb-5 sm:mb-6">
            Preencha os dados do registro que precisa ser corrigido ou adicionado. O RH irá avaliar sua solicitação.
          </p>

          <form onSubmit={handleSubmitAdjustment} className="space-y-5">
            <div>
              <label htmlFor="adj-type" className="block text-sm font-semibold text-neutral-800 mb-2">
                Tipo de registro *
              </label>
              <select
                id="adj-type"
                value={form.requestedType}
                onChange={(e) => setForm({ ...form, requestedType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              >
                <option value="entrada">Entrada</option>
                <option value="saida_almoco">Saída para Almoço</option>
                <option value="volta_almoco">Volta do Almoço</option>
                <option value="saida">Saída</option>
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="adj-date" className="block text-sm font-semibold text-neutral-800 mb-2">
                  Data *
                </label>
                <input
                  id="adj-date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  max={new Date().toISOString().slice(0, 10)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                />
              </div>
              <div>
                <label htmlFor="adj-time" className="block text-sm font-semibold text-neutral-800 mb-2">
                  Horário correto *
                </label>
                <input
                  id="adj-time"
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="adj-reason" className="block text-sm font-semibold text-neutral-800 mb-2">
                Motivo da solicitação *
              </label>
              <textarea
                id="adj-reason"
                required
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Ex: Esqueci de registrar a entrada. Cheguei às 08h conforme de costume."
                minLength={5}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-y"
              />
              <p className="text-xs text-neutral-400 mt-1">Mínimo 5 caracteres. Seja claro no motivo para facilitar a aprovação.</p>
            </div>

            {/* Upload de anexo */}
            <div>
              <label htmlFor="adj-attachment" className="block text-sm font-semibold text-neutral-800 mb-2">
                Anexo <span className="text-xs font-normal text-neutral-400">(opcional — atestado, comprovante)</span>
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  ref={fileInputRef}
                  id="adj-attachment"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium"
                >
                  <Paperclip size={16} />
                  {attachment ? "Trocar arquivo" : "Escolher arquivo"}
                </button>
                {attachment && (
                  <div className="flex items-center gap-2 text-xs">
                    <FileText size={14} className="text-primary-700" />
                    <span className="text-neutral-700 font-medium truncate max-w-[200px]">{attachment.name}</span>
                    <span className="text-neutral-400 tabular-nums">({(attachment.size / 1024).toFixed(0)} KB)</span>
                    <button type="button" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="text-secondary-600 hover:underline text-xs font-semibold">
                      Remover
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-1">PDF, JPG ou PNG · máximo 10 MB</p>
            </div>

            <button
              type="submit"
              disabled={loading || form.reason.trim().length < 5}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800
                disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Send size={16} /> {loading ? "Enviando..." : "Enviar Solicitação"}
            </button>
          </form>
        </div>
      )}

      {/* ============ ABA: MINHAS SOLICITAÇÕES ============ */}
      {tab === "mine" && (
        <div className="space-y-3 sm:space-y-4">
          {mine.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 px-6 py-12 text-center text-neutral-400">
              <ClipboardCheck size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Você ainda não fez nenhuma solicitação de ajuste.</p>
              <button type="button" onClick={() => setTab("new")}
                className="mt-4 text-sm text-primary-700 font-semibold hover:underline">
                Fazer primeira solicitação
              </button>
            </div>
          ) : (
            mine.map((adj) => (
              <div key={adj.id} className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-neutral-900">
                        {typeLabels[adj.requestedType] || adj.requestedType}
                      </span>
                      <span className="text-sm tabular-nums text-neutral-500">
                        {new Date(adj.requestedTimestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${statusStyles[adj.status] || ""}`}>
                        {statusLabels[adj.status] || adj.status}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600">
                      <strong>Motivo:</strong> {adj.reason}
                    </p>
                    {adj.attachmentFileId && (
                      <button type="button" onClick={() => openAttachment(adj.id)}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary-700 font-semibold hover:underline">
                        <Paperclip size={12} /> Ver anexo
                      </button>
                    )}
                    {adj.reviewNotes && (
                      <p className="text-xs text-neutral-500 mt-2 p-2 bg-neutral-50 rounded-lg">
                        <strong>Obs. do RH:</strong> {adj.reviewNotes}
                      </p>
                    )}
                    <p className="text-xs text-neutral-400 mt-2">
                      Solicitado em {new Date(adj.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============ ABA: PENDENTES (ADMIN/GESTOR) ============ */}
      {tab === "pending" && isAdmin && (
        <div className="space-y-3 sm:space-y-4">
          {pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 px-6 py-12 text-center text-neutral-400">
              <ClipboardCheck size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhum ajuste pendente de aprovação.</p>
            </div>
          ) : (
            pending.map((adj) => (
              <div key={adj.id} className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Info do funcionário */}
                  <div>
                    <p className="text-sm sm:text-base font-bold text-neutral-900">{adj.userName}</p>
                    <p className="text-xs text-neutral-500 truncate">{adj.userEmail}</p>
                  </div>

                  {/* Dados do ajuste */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-neutral-50 rounded-xl">
                    <div>
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Tipo</p>
                      <p className="text-xs sm:text-sm font-semibold text-neutral-900">{typeLabels[adj.requestedType]}</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Data solicitada</p>
                      <p className="text-xs sm:text-sm font-semibold text-neutral-900 tabular-nums">
                        {new Date(adj.requestedTimestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Solicitado em</p>
                      <p className="text-xs sm:text-sm text-neutral-700 tabular-nums">
                        {new Date(adj.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm text-neutral-700">
                      <strong>Motivo:</strong> {adj.reason}
                    </p>
                    {adj.attachmentFileId && (
                      <button type="button" onClick={() => openAttachment(adj.id)}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary-700 font-semibold hover:underline">
                        <Paperclip size={12} /> Ver documento anexo
                      </button>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="border-t border-neutral-200 pt-3 sm:pt-4">
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <input
                        type="text"
                        placeholder="Observação para o funcionário (opcional)"
                        value={reviewingId === adj.id ? reviewNotes : ""}
                        onFocus={() => setReviewingId(adj.id)}
                        onChange={(e) => { setReviewingId(adj.id); setReviewNotes(e.target.value); }}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:border-primary-500 outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => handleReview(adj.id, "aprovado")} disabled={loading}
                          className="inline-flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50">
                          <Check size={16} /> Aprovar
                        </button>
                        <button type="button" onClick={() => handleReview(adj.id, "rejeitado")} disabled={loading}
                          className="inline-flex items-center justify-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50">
                          <X size={16} /> Rejeitar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
