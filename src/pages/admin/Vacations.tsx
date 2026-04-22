import { useState, useEffect, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Plane, Plus, X, Save, Calendar, Paperclip, FileText, Trash2, Check, AlertCircle,
} from "lucide-react";

const API_URL = "";
function getToken() { return localStorage.getItem("cvi-token") || ""; }

interface Vacation {
  id: number;
  userId: number;
  userName: string;
  userDepartment: string | null;
  startDate: string;
  endDate: string;
  status: "agendada" | "em_curso" | "concluida" | "cancelada";
  noticeFileId: number | null;
  acknowledgedAt: string | null;
  notes: string | null;
  createdAt: string;
}

interface UserData { id: number; role: string; }

interface EmployeeOption { id: number; name: string; department: string | null; active: boolean; }

const statusStyles: Record<string, string> = {
  agendada: "bg-warm-100 text-warm-500 border-warm-200",
  em_curso: "bg-primary-50 text-primary-700 border-primary-200",
  concluida: "bg-accent-50 text-accent-700 border-accent-200",
  cancelada: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

const statusLabels: Record<string, string> = {
  agendada: "Agendada",
  em_curso: "Em curso",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

function formatDateBR(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function Vacations() {
  const { user } = useOutletContext<{ user: UserData }>();
  const isAdmin = user.role === "admin" || user.role === "gestor";

  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userId: "", startDate: "", notes: "" });
  const [notice, setNotice] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchVacations = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/vacations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) { const data = await res.json(); setVacations(data.vacations); }
    } catch { /* ignore */ }
  }, []);

  const fetchEmployees = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`${API_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees.filter((e: EmployeeOption) => e.active));
      }
    } catch { /* ignore */ }
  }, [isAdmin]);

  useEffect(() => { fetchVacations(); fetchEmployees(); }, [fetchVacations, fetchEmployees]);

  const endDate = form.startDate ? addDays(form.startDate, 29) : ""; // 30 dias inclusive → +29

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) { setNotice(null); return; }
    if (f.size > 10 * 1024 * 1024) {
      setMsg({ type: "error", text: "Arquivo excede 10 MB" });
      e.target.value = ""; return;
    }
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(f.type)) {
      setMsg({ type: "error", text: "Apenas PDF, JPG ou PNG" });
      e.target.value = ""; return;
    }
    setNotice(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.userId || !form.startDate) {
      setMsg({ type: "error", text: "Funcionário e data início são obrigatórios" });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("userId", form.userId);
      fd.append("startDate", form.startDate);
      fd.append("endDate", endDate);
      if (form.notes) fd.append("notes", form.notes);
      if (notice) fd.append("notice", notice);

      const res = await fetch(`${API_URL}/api/vacations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: "success", text: "Férias agendadas com sucesso" });
        setShowForm(false);
        setForm({ userId: "", startDate: "", notes: "" });
        setNotice(null);
        if (fileRef.current) fileRef.current.value = "";
        fetchVacations();
      } else {
        setMsg({ type: "error", text: data.error || "Erro ao agendar férias" });
      }
    } catch {
      setMsg({ type: "error", text: "Erro de conexão" });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 4500);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remover esse registro de férias?")) return;
    try {
      const res = await fetch(`${API_URL}/api/vacations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) { fetchVacations(); setMsg({ type: "success", text: "Férias removidas" }); }
      else { const d = await res.json(); setMsg({ type: "error", text: d.error || "Erro" }); }
    } catch { setMsg({ type: "error", text: "Erro de conexão" }); }
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleChangeStatus(id: number, status: string) {
    try {
      const res = await fetch(`${API_URL}/api/vacations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { fetchVacations(); setMsg({ type: "success", text: "Status atualizado" }); }
    } catch { /* ignore */ }
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleAcknowledge(id: number) {
    try {
      const res = await fetch(`${API_URL}/api/vacations/${id}/acknowledge`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) { fetchVacations(); setMsg({ type: "success", text: "Ciência confirmada" }); }
      else { const d = await res.json(); setMsg({ type: "error", text: d.error || "Erro" }); }
    } catch { /* ignore */ }
    setTimeout(() => setMsg(null), 3000);
  }

  function openNotice(vacId: number) {
    fetch(`${API_URL}/api/vacations/${vacId}/notice`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => { if (!r.ok) throw new Error(); return r.blob(); })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      })
      .catch(() => setMsg({ type: "error", text: "Não foi possível abrir o aviso" }));
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-neutral-900">Férias</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {isAdmin ? "Agende e gerencie férias dos funcionários" : "Veja suas férias agendadas"}
          </p>
        </div>
        {isAdmin && !showForm && (
          <button type="button" onClick={() => setShowForm(true)}
            className="w-full sm:w-auto flex sm:inline-flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white text-sm sm:text-base font-semibold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl">
            <Plus size={18} /> Agendar férias
          </button>
        )}
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

      {/* Form de agendamento */}
      {isAdmin && showForm && (
        <div className="mb-6 bg-white rounded-2xl border border-primary-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Calendar size={18} className="text-primary-700" /> Nova férias
            </h2>
            <button type="button" onClick={() => { setShowForm(false); setForm({ userId: "", startDate: "", notes: "" }); setNotice(null); }}
              className="p-1.5 rounded-lg hover:bg-neutral-100">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Funcionário *</label>
              <select required value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white focus:border-primary-500 outline-none text-sm">
                <option value="">Selecione...</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}{e.department ? ` — ${e.department}` : ""}</option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Data início *</label>
                <input required type="date" value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white focus:border-primary-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Data fim (30 dias)</label>
                <input type="date" value={endDate} readOnly disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500 text-sm cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Observação (opcional)</label>
              <input type="text" maxLength={500} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ex: férias fracionadas pré-acordadas..."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white focus:border-primary-500 outline-none text-sm" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">
                Aviso de férias <span className="text-xs font-normal text-neutral-400">(opcional — PDF)</span>
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <input ref={fileRef} type="file" accept="application/pdf,image/jpeg,image/png" onChange={handleFile} className="hidden" id="vac-notice" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium">
                  <Paperclip size={16} /> {notice ? "Trocar arquivo" : "Anexar aviso"}
                </button>
                {notice && (
                  <div className="flex items-center gap-2 text-xs">
                    <FileText size={14} className="text-primary-700" />
                    <span className="font-medium truncate max-w-[200px]">{notice.name}</span>
                    <button type="button" onClick={() => { setNotice(null); if (fileRef.current) fileRef.current.value = ""; }}
                      className="text-secondary-600 text-xs font-semibold hover:underline">Remover</button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
              <button type="button" onClick={() => { setShowForm(false); setForm({ userId: "", startDate: "", notes: "" }); setNotice(null); }}
                className="px-4 py-2.5 rounded-xl text-sm text-neutral-700 hover:bg-neutral-100 font-medium">
                Cancelar
              </button>
              <button type="submit" disabled={loading || !form.userId || !form.startDate}
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50">
                <Save size={16} /> {loading ? "Salvando..." : "Agendar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {vacations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 px-6 py-12 text-center text-neutral-400">
          <Plane size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">{isAdmin ? "Nenhuma férias agendada ainda." : "Você não tem férias agendadas."}</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {vacations.map((v) => {
            const isSelf = v.userId === user.id;
            const pendingAck = !v.acknowledgedAt;
            return (
              <div key={v.id} className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <p className="text-sm sm:text-base font-bold text-neutral-900 truncate">{v.userName}</p>
                      <span className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${statusStyles[v.status]}`}>
                        {statusLabels[v.status]}
                      </span>
                      {v.acknowledgedAt && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-accent-700 bg-accent-50 border border-accent-200 px-2 py-0.5 rounded-full">
                          <Check size={10} /> Ciente
                        </span>
                      )}
                    </div>
                    {v.userDepartment && <p className="text-xs text-neutral-500 mb-2">{v.userDepartment}</p>}
                    <div className="flex items-center gap-1.5 text-sm text-neutral-700 tabular-nums">
                      <Calendar size={14} className="text-primary-700 shrink-0" />
                      <span>{formatDateBR(v.startDate)}</span>
                      <span className="text-neutral-400">até</span>
                      <span>{formatDateBR(v.endDate)}</span>
                      <span className="text-neutral-400 text-xs">(30 dias)</span>
                    </div>
                    {v.notes && <p className="text-xs text-neutral-500 mt-2">{v.notes}</p>}
                  </div>
                  {isAdmin && (
                    <button type="button" onClick={() => handleDelete(v.id)}
                      aria-label="Remover"
                      className="shrink-0 p-2 rounded-lg text-neutral-400 hover:bg-secondary-50 hover:text-secondary-600">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-neutral-100">
                  {v.noticeFileId && (
                    <button type="button" onClick={() => openNotice(v.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg">
                      <Paperclip size={12} /> Ver aviso
                    </button>
                  )}
                  {isSelf && pendingAck && (
                    <button type="button" onClick={() => handleAcknowledge(v.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-accent-600 hover:bg-accent-700 px-3 py-1.5 rounded-lg">
                      <Check size={12} /> Confirmar ciência
                    </button>
                  )}
                  {isAdmin && v.status === "agendada" && (
                    <button type="button" onClick={() => handleChangeStatus(v.id, "em_curso")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg">
                      Marcar em curso
                    </button>
                  )}
                  {isAdmin && v.status === "em_curso" && (
                    <button type="button" onClick={() => handleChangeStatus(v.id, "concluida")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-700 hover:bg-accent-50 px-3 py-1.5 rounded-lg">
                      Concluir
                    </button>
                  )}
                  {isAdmin && (v.status === "agendada" || v.status === "em_curso") && (
                    <button type="button" onClick={() => handleChangeStatus(v.id, "cancelada")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 px-3 py-1.5 rounded-lg">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
