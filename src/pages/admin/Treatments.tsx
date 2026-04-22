import { useState, useEffect, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Calculator, ChevronLeft, ChevronRight, FileText, Edit3, X, Save, Check, AlertCircle,
  TrendingDown, TrendingUp, Users, Send, MessageSquare, Eye, Download, Package,
} from "lucide-react";
import { TreatmentSummary } from "@/components/admin/TreatmentSummary";

const API_URL = "";
function getToken() { return localStorage.getItem("cvi-token") || ""; }

interface UserData { id: number; role: string; }

interface Employee {
  id: number;
  name: string;
  department: string | null;
  requiresPunch: boolean;
  active: boolean;
}

interface Treatment {
  id: number;
  userId: number;
  userName?: string;
  userDepartment?: string | null;
  referenceMonth: string;
  discountAmount: string;
  bonusAmount: string;
  notes: string | null;
  status: "draft" | "submitted_to_employee" | "approved_by_employee" | "auto_approved" | "questioned";
  submittedAt: string | null;
  decisionAt: string | null;
  employeeQuestion: string | null;
}

const statusStyles: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-600 border-neutral-200",
  submitted_to_employee: "bg-warm-100 text-warm-500 border-warm-200",
  approved_by_employee: "bg-accent-50 text-accent-700 border-accent-200",
  auto_approved: "bg-primary-50 text-primary-700 border-primary-200",
  questioned: "bg-secondary-50 text-secondary-700 border-secondary-200",
};

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  submitted_to_employee: "Aguardando funcionário",
  approved_by_employee: "Aprovado",
  auto_approved: "Aprovado (auto)",
  questioned: "Questionado",
};

function formatBRL(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function Treatments() {
  const { user } = useOutletContext<{ user: UserData }>();
  const isAdmin = user.role === "admin" || user.role === "gestor";

  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [previewName, setPreviewName] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<"approved" | "all">("approved");
  const [exportIncludePdf, setExportIncludePdf] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [form, setForm] = useState({ discount: "", bonus: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const [empRes, treatRes] = await Promise.all([
        fetch(`${API_URL}/api/employees`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`${API_URL}/api/treatments?month=${month}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      if (empRes.ok) {
        const d = await empRes.json();
        setEmployees(d.employees.filter((e: Employee) => e.requiresPunch && e.active));
      }
      if (treatRes.ok) {
        const d = await treatRes.json();
        setTreatments(d.treatments);
      }
    } catch { /* ignore */ }
  }, [month, isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const treatmentByUserId = useMemo(() => {
    const m: Record<number, Treatment> = {};
    for (const t of treatments) m[t.userId] = t;
    return m;
  }, [treatments]);

  const totals = useMemo(() => {
    let discount = 0, bonus = 0;
    for (const t of treatments) {
      discount += parseFloat(t.discountAmount || "0");
      bonus += parseFloat(t.bonusAmount || "0");
    }
    return { discount, bonus, net: bonus - discount };
  }, [treatments]);

  const monthLabel = (() => {
    const [y, m] = month.split("-").map(Number);
    return new Date(y, m - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  })();

  function navigateMonth(dir: number) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setMonth(d.toISOString().slice(0, 7));
  }

  function startEdit(emp: Employee) {
    const existing = treatmentByUserId[emp.id];
    setEditingEmployee(emp);
    setForm({
      discount: existing ? existing.discountAmount : "",
      bonus: existing ? existing.bonusAmount : "",
      notes: existing?.notes || "",
    });
  }

  async function handleSave() {
    if (!editingEmployee) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/treatments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          userId: editingEmployee.id,
          month,
          discountAmount: form.discount || "0",
          bonusAmount: form.bonus || "0",
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: "success", text: data.action === "created" ? "Tratamento criado" : "Tratamento atualizado" });
        setEditingEmployee(null);
        fetchData();
      } else {
        setMsg({ type: "error", text: data.error || "Erro ao salvar" });
      }
    } catch {
      setMsg({ type: "error", text: "Erro de conexão" });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 3500);
    }
  }

  async function handleDelete(treatmentId: number) {
    if (!confirm("Remover este tratamento?")) return;
    try {
      const res = await fetch(`${API_URL}/api/treatments/${treatmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) { fetchData(); setMsg({ type: "success", text: "Removido" }); }
      else { const d = await res.json(); setMsg({ type: "error", text: d.error || "Erro" }); }
    } catch { setMsg({ type: "error", text: "Erro de conexão" }); }
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleDownloadZip() {
    setExporting(true);
    setMsg(null);
    try {
      const pdfFlag = exportIncludePdf ? "&pdf=1" : "";
      const res = await fetch(`${API_URL}/api/exports/monthly?month=${month}&status=${exportStatus}${pdfFlag}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setMsg({ type: "error", text: d.error || `Erro ao exportar (HTTP ${res.status})` });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `folha-${month}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      setExportOpen(false);
      setMsg({ type: "success", text: "Exportação concluída" });
    } catch {
      setMsg({ type: "error", text: "Erro de conexão" });
    } finally {
      setExporting(false);
      setTimeout(() => setMsg(null), 4000);
    }
  }

  async function handleSubmit(treatmentId: number) {
    if (!confirm("Enviar para revisão do funcionário? Ele terá 24h para aprovar ou questionar — após esse prazo, o tratamento será aprovado automaticamente.")) return;
    try {
      const res = await fetch(`${API_URL}/api/treatments/${treatmentId}/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setMsg({ type: "success", text: "Enviado para revisão do funcionário" });
        fetchData();
      } else {
        const d = await res.json();
        setMsg({ type: "error", text: d.error || "Erro ao enviar" });
      }
    } catch { setMsg({ type: "error", text: "Erro de conexão" }); }
    setTimeout(() => setMsg(null), 4000);
  }

  function hoursUntilAutoApprove(submittedAt: string | null): string {
    if (!submittedAt) return "";
    const deadline = new Date(submittedAt).getTime() + 24 * 60 * 60 * 1000;
    const diffMs = deadline - Date.now();
    if (diffMs <= 0) return "prazo expirado";
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    const mins = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${mins}min restantes`;
  }

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 px-6 py-12 text-center text-neutral-400">
        <p>Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-neutral-900">Tratamento de Ponto</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Aplique descontos e abonos mensais antes de enviar para revisão do funcionário
        </p>
      </div>

      {msg && (
        <div role="status" aria-live="polite"
          className={`mb-4 px-4 py-3 rounded-xl flex items-start gap-2 text-sm font-medium ${
            msg.type === "success"
              ? "bg-accent-50 border border-accent-200 text-accent-700"
              : "bg-secondary-50 border border-secondary-200 text-secondary-700"
          }`}>
          {msg.type === "success" ? <Check size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Navegação de mês + exportação */}
      <div className="flex items-center justify-between gap-2 mb-5 sm:mb-6 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-center sm:justify-start">
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
        <button type="button" onClick={() => setExportOpen(true)}
          className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl">
          <Package size={16} /> Exportar ZIP
        </button>
      </div>

      {/* Resumo do mês */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-secondary-600" />
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-semibold">Total descontos</p>
          </div>
          <p className="text-base sm:text-xl font-bold text-secondary-600 tabular-nums">{formatBRL(totals.discount)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-accent-600" />
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-semibold">Total abonos</p>
          </div>
          <p className="text-base sm:text-xl font-bold text-accent-600 tabular-nums">{formatBRL(totals.bonus)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calculator size={14} className="text-primary-700" />
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-semibold">Saldo líquido</p>
          </div>
          <p className={`text-base sm:text-xl font-bold tabular-nums ${totals.net >= 0 ? "text-accent-600" : "text-secondary-600"}`}>
            {formatBRL(totals.net)}
          </p>
        </div>
      </div>

      {/* Lista de funcionários */}
      {employees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 px-6 py-12 text-center text-neutral-400">
          <Users size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhum funcionário ativo que bate ponto.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map((emp) => {
            const t = treatmentByUserId[emp.id];
            const status = t?.status || "draft";
            const discount = t ? parseFloat(t.discountAmount) : 0;
            const bonus = t ? parseFloat(t.bonusAmount) : 0;

            return (
              <div key={emp.id} className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm sm:text-base font-bold text-neutral-900 truncate">{emp.name}</p>
                      {t ? (
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${statusStyles[status]}`}>
                          {statusLabels[status]}
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-neutral-50 text-neutral-400 border border-neutral-200">
                          Não iniciado
                        </span>
                      )}
                    </div>
                    {emp.department && <p className="text-xs text-neutral-500">{emp.department}</p>}
                  </div>
                </div>

                {t && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Desconto</p>
                      <p className="text-sm font-semibold text-secondary-600 tabular-nums">{formatBRL(discount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Abono</p>
                      <p className="text-sm font-semibold text-accent-600 tabular-nums">{formatBRL(bonus)}</p>
                    </div>
                  </div>
                )}

                {t?.notes && (
                  <div className="mb-3 p-2 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-600 whitespace-pre-wrap">{t.notes}</p>
                  </div>
                )}

                {/* Questionamento do funcionário */}
                {t?.status === "questioned" && t.employeeQuestion && (
                  <div className="mb-3 p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
                    <p className="text-[10px] uppercase tracking-wider text-secondary-700 font-bold mb-1 flex items-center gap-1">
                      <MessageSquare size={11} /> Questionamento do funcionário
                    </p>
                    <p className="text-xs text-secondary-800 whitespace-pre-wrap">{t.employeeQuestion}</p>
                  </div>
                )}

                {/* Timer de expiração */}
                {t?.status === "submitted_to_employee" && t.submittedAt && (
                  <div className="mb-3 p-2 bg-warm-50 border border-warm-200 rounded-lg">
                    <p className="text-xs text-neutral-800">
                      <strong className="text-warm-500">⏱️ Aguardando funcionário</strong> — {hoursUntilAutoApprove(t.submittedAt)} para aprovação automática
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 flex-wrap">
                  <a
                    href={`/admin/dashboard/rh/espelho?userId=${emp.id}&mes=${month}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg"
                  >
                    <FileText size={12} /> Ver espelho
                  </a>
                  {t && (
                    <button type="button" onClick={() => { setPreviewId(t.id); setPreviewName(emp.name); }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg">
                      <Eye size={12} /> Pré-visualizar
                    </button>
                  )}
                  {(["draft", "questioned"].includes(status) || !t) && (
                    <button type="button" onClick={() => startEdit(emp)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg">
                      <Edit3 size={12} /> {t ? "Editar tratamento" : "Iniciar tratamento"}
                    </button>
                  )}
                  {t && ["draft", "questioned"].includes(status) && (
                    <button type="button" onClick={() => handleSubmit(t.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-accent-600 hover:bg-accent-700 px-3 py-1.5 rounded-lg">
                      <Send size={12} /> Enviar para revisão
                    </button>
                  )}
                  {t && status === "draft" && (
                    <button type="button" onClick={() => handleDelete(t.id)}
                      className="ml-auto text-xs font-semibold text-neutral-500 hover:text-secondary-600 px-2 py-1.5 rounded-lg hover:bg-neutral-100">
                      Remover
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de exportação */}
      {exportOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => !exporting && setExportOpen(false)}>
          <div className="bg-white rounded-2xl shadow-elevated w-full max-w-md p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Package size={18} className="text-primary-700" /> Exportar folha
              </h3>
              <button type="button" onClick={() => setExportOpen(false)} disabled={exporting}
                className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-50">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-xl">
              <p className="text-xs uppercase tracking-wider text-primary-700 font-bold mb-1">Mês</p>
              <p className="text-base font-bold text-neutral-900 capitalize">{monthLabel}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-neutral-800 mb-2">O que incluir:</p>
              <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer mb-2">
                <input type="radio" name="export-status" value="approved" checked={exportStatus === "approved"}
                  onChange={() => setExportStatus("approved")} className="mt-1" />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Apenas aprovados <span className="text-xs font-normal text-neutral-500">(recomendado)</span></p>
                  <p className="text-xs text-neutral-500">Inclui só tratamentos aprovados pelo funcionário ou aprovados automaticamente após 24h.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                <input type="radio" name="export-status" value="all" checked={exportStatus === "all"}
                  onChange={() => setExportStatus("all")} className="mt-1" />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Todos os tratamentos</p>
                  <p className="text-xs text-neutral-500">Inclui rascunhos, pendentes e questionados também. Útil pra conferência interna.</p>
                </div>
              </label>
            </div>

            <div className="mb-4">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                <input type="checkbox" checked={exportIncludePdf} onChange={(e) => setExportIncludePdf(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-700 focus:ring-primary-500" />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Incluir PDF institucional</p>
                  <p className="text-xs text-neutral-500">Arquivo único timbrado com logo do CVI, sumário, detalhe por funcionário e assinatura — pronto pra enviar ao contador.</p>
                </div>
              </label>
            </div>

            <div className="mb-4 p-3 bg-neutral-50 rounded-xl text-xs text-neutral-600">
              <p className="font-semibold mb-1">O ZIP contém:</p>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-500">
                <li><code className="text-neutral-700">folha-consolidada-{month}.csv</code> — planilha resumo</li>
                <li><code className="text-neutral-700">&lt;Nome do Funcionário&gt;/</code> — pasta com <code>resumo.txt</code>, <code>pontos.csv</code>, <code>ajustes.csv</code>, <code>notas-rh.txt</code></li>
                {exportIncludePdf && <li><code className="text-neutral-700">folha-{month}.pdf</code> — PDF institucional timbrado</li>}
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <button type="button" onClick={() => setExportOpen(false)} disabled={exporting}
                className="px-4 py-2.5 rounded-xl text-sm text-neutral-700 hover:bg-neutral-100 font-medium disabled:opacity-50">
                Cancelar
              </button>
              <button type="button" onClick={handleDownloadZip} disabled={exporting}
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50">
                <Download size={16} /> {exporting ? "Gerando..." : "Baixar ZIP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pré-visualização — mostra ao admin o que o funcionário verá */}
      {previewId !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => { setPreviewId(null); setPreviewName(""); }}>
          <div className="bg-white rounded-2xl shadow-elevated w-full max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Eye size={18} className="text-primary-700" />
                Pré-visualização
              </h2>
              <button type="button" onClick={() => { setPreviewId(null); setPreviewName(""); }}
                className="p-1.5 rounded-lg hover:bg-neutral-100">
                <X size={18} />
              </button>
            </div>
            <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-xl">
              <p className="text-xs uppercase tracking-wider text-primary-700 font-bold mb-1">Funcionário</p>
              <p className="text-base font-bold text-neutral-900">{previewName}</p>
              <p className="text-[11px] text-neutral-500 mt-1">Esta é a mesma visão que ele terá ao clicar em "Revisar agora"</p>
            </div>
            <TreatmentSummary treatmentId={previewId} />
          </div>
        </div>
      )}

      {/* Modal de edição */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => !loading && setEditingEmployee(null)}>
          <div className="bg-white rounded-2xl shadow-elevated w-full max-w-lg p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Calculator size={18} className="text-primary-700" />
                Tratamento — {monthLabel}
              </h3>
              <button type="button" onClick={() => setEditingEmployee(null)} disabled={loading}
                className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-50">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-neutral-50 rounded-xl">
              <p className="text-sm font-semibold text-neutral-900">{editingEmployee.name}</p>
              {editingEmployee.department && <p className="text-xs text-neutral-500">{editingEmployee.department}</p>}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1 flex items-center gap-1.5">
                  <TrendingDown size={14} className="text-secondary-600" /> Desconto (R$)
                </label>
                <input type="number" step="0.01" min="0" value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  placeholder="0,00"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white focus:border-primary-500 outline-none text-sm tabular-nums" />
                <p className="text-xs text-neutral-400 mt-1">Valor total de atrasos não justificados no mês</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-accent-600" /> Abono (R$)
                </label>
                <input type="number" step="0.01" min="0" value={form.bonus}
                  onChange={(e) => setForm({ ...form, bonus: e.target.value })}
                  placeholder="0,00"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white focus:border-primary-500 outline-none text-sm tabular-nums" />
                <p className="text-xs text-neutral-400 mt-1">Bonificações ou ajustes positivos</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Observação</label>
                <textarea rows={4} maxLength={2000} value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Ex:&#10;• 15/04 - Atraso 20min sem justificativa → R$ 25,00&#10;• 22/04 - Ajuste aprovado → R$ 50,00 abonado"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white focus:border-primary-500 outline-none text-sm font-mono resize-y" />
                <p className="text-xs text-neutral-400 mt-1">Detalhe os lançamentos item a item para o funcionário entender</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-neutral-200">
              <button type="button" onClick={() => setEditingEmployee(null)} disabled={loading}
                className="px-4 py-2.5 rounded-xl text-sm text-neutral-700 hover:bg-neutral-100 font-medium disabled:opacity-50">
                Cancelar
              </button>
              <button type="button" onClick={handleSave} disabled={loading}
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50">
                <Save size={16} /> {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
