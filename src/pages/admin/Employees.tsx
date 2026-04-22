import { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Search, Edit2, UserX, X, Save, Users, RefreshCw, ScanFace,
  DollarSign, Plus, Trash2,
} from "lucide-react";
import { FaceCapture } from "@/components/ui/FaceCapture";
import { PasswordInput } from "@/components/ui/PasswordInput";

const API_URL = "";
function getToken() { return localStorage.getItem("cvi-token") || ""; }

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  employmentType: string;
  department: string | null;
  position: string | null;
  requiresPunch: boolean;
  weeklyHours: number;
  dailyHours: number;
  workStartTime: string | null;
  workEndTime: string | null;
  lunchDurationMinutes: number;
  hasLunchBreak: boolean;
  active: boolean;
}

const emptyForm = {
  name: "", email: "", password: "", role: "funcionario",
  employmentType: "clt", department: "", position: "",
  requiresPunch: true, weeklyHours: 44, dailyHours: 8,
  workStartTime: "08:00", workEndTime: "17:00", lunchDurationMinutes: 60,
  hasLunchBreak: true,
};

interface SalaryEntry {
  id: number;
  grossSalary: string;
  netSalary: string;
  effectiveFrom: string;
  notes: string | null;
  createdAt: string;
}

function formatBRL(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [faceRegisterId, setFaceRegisterId] = useState<number | null>(null);

  // Gerenciamento de salário (dentro do modal de edição)
  const [salaryHistory, setSalaryHistory] = useState<SalaryEntry[]>([]);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [salaryForm, setSalaryForm] = useState({ gross: "", net: "", effectiveFrom: new Date().toISOString().slice(0, 10), notes: "" });
  const [salaryLoading, setSalaryLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const url = editingId
        ? `${API_URL}/api/employees/${editingId}`
        : `${API_URL}/api/employees`;
      const method = editingId ? "PUT" : "POST";

      const body: any = { ...form };
      if (editingId && !body.password) delete body.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) { setMsg(data.error); return; }

      setMsg(editingId ? "Funcionário atualizado!" : "Funcionário cadastrado!");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchEmployees();
    } catch {
      setMsg("Erro de conexão");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const fetchSalaryHistory = useCallback(async (userId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/salary/${userId}/history`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSalaryHistory(data.history);
      } else {
        setSalaryHistory([]);
      }
    } catch {
      setSalaryHistory([]);
    }
  }, []);

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setForm({
      name: emp.name, email: emp.email, password: "",
      role: emp.role, employmentType: emp.employmentType,
      department: emp.department || "", position: emp.position || "",
      requiresPunch: emp.requiresPunch,
      weeklyHours: emp.weeklyHours, dailyHours: emp.dailyHours,
      workStartTime: emp.workStartTime || "08:00",
      workEndTime: emp.workEndTime || "17:00",
      lunchDurationMinutes: emp.lunchDurationMinutes,
      hasLunchBreak: emp.hasLunchBreak,
    });
    setShowSalaryForm(false);
    setSalaryForm({ gross: "", net: "", effectiveFrom: new Date().toISOString().slice(0, 10), notes: "" });
    fetchSalaryHistory(emp.id);
    setShowForm(true);
  };

  const handleAddSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSalaryLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/salary/${editingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          grossSalary: parseFloat(salaryForm.gross),
          netSalary: parseFloat(salaryForm.net),
          effectiveFrom: salaryForm.effectiveFrom,
          notes: salaryForm.notes || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Salário registrado");
        setShowSalaryForm(false);
        setSalaryForm({ gross: "", net: "", effectiveFrom: new Date().toISOString().slice(0, 10), notes: "" });
        fetchSalaryHistory(editingId);
      } else {
        setMsg(data.error || "Erro ao registrar salário");
      }
    } catch {
      setMsg("Erro de conexão");
    } finally {
      setSalaryLoading(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleDeleteSalary = async (entryId: number) => {
    if (!editingId) return;
    if (!confirm("Remover esse registro de salário?")) return;
    try {
      const res = await fetch(`${API_URL}/api/salary/entry/${entryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        fetchSalaryHistory(editingId);
        setMsg("Registro removido");
        setTimeout(() => setMsg(""), 3000);
      }
    } catch { /* ignore */ }
  };

  const handleDeactivate = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setMsg("Funcionário desativado com sucesso");
        fetchEmployees();
      } else {
        const data = await res.json();
        setMsg(data.error || "Erro ao desativar");
      }
    } catch {
      setMsg("Erro de conexão");
    } finally {
      setLoading(false);
      setConfirmDelete(null);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleReactivate = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ active: true }),
      });
      if (res.ok) {
        setMsg("Funcionário reativado com sucesso");
        fetchEmployees();
      }
    } catch {
      setMsg("Erro de conexão");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-neutral-900">Funcionários</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">{employees.filter(e => e.active).length} ativos de {employees.length} cadastrados</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="w-full sm:w-auto flex sm:inline-flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white text-sm sm:text-base font-semibold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-colors"
        >
          <UserPlus size={16} className="sm:hidden" />
          <UserPlus size={18} className="hidden sm:block" />
          Novo Funcionário
        </button>
      </div>

      {msg && (
        <div role="status" className="mb-4 px-4 py-3 rounded-xl bg-accent-50 border border-accent-200 text-accent-700 text-sm font-medium">
          {msg}
        </div>
      )}

      {/* Busca */}
      <div className="relative mb-4 sm:mb-6">
        <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm rounded-xl border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
        />
      </div>

      {/* Modal de cadastro/edição */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-elevated w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900">
                {editingId ? "Editar Funcionário" : "Novo Funcionário"}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-neutral-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Nome completo *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">E-mail *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 outline-none" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">
                    Senha {editingId ? "(deixe vazio para manter)" : "*"}
                  </label>
                  <PasswordInput required={!editingId} value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Vínculo</label>
                  <select value={form.employmentType} onChange={e => setForm({...form, employmentType: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 outline-none">
                    <option value="clt">CLT</option>
                    <option value="pj">PJ / Prestador</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Departamento</label>
                  <input value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Cargo</label>
                  <input value={form.position} onChange={e => setForm({...form, position: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 outline-none" />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Perfil</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 outline-none">
                    <option value="funcionario">Funcionário</option>
                    <option value="gestor">Gestor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Entrada</label>
                  <input type="time" value={form.workStartTime} onChange={e => setForm({...form, workStartTime: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Saída</label>
                  <input type="time" value={form.workEndTime} onChange={e => setForm({...form, workEndTime: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 outline-none" />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Horas semanais</label>
                  <input type="number" value={form.weeklyHours} onChange={e => setForm({...form, weeklyHours: +e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Horas diárias</label>
                  <input type="number" value={form.dailyHours} onChange={e => setForm({...form, dailyHours: +e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Almoço (min)</label>
                  <input type="number" value={form.lunchDurationMinutes} onChange={e => setForm({...form, lunchDurationMinutes: +e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 outline-none" />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="flex items-start gap-3 cursor-pointer py-1.5">
                  <input type="checkbox" checked={form.requiresPunch} onChange={e => setForm({...form, requiresPunch: e.target.checked})}
                    className="h-5 w-5 mt-0.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-neutral-800 block">Obrigatório registrar ponto</span>
                    <span className="text-xs text-neutral-500">Desmarque para contas administrativas ou que não batem ponto</span>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer py-1.5">
                  <input type="checkbox" checked={form.hasLunchBreak} onChange={e => setForm({...form, hasLunchBreak: e.target.checked})}
                    className="h-5 w-5 mt-0.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-neutral-800 block">Tem intervalo de almoço</span>
                    <span className="text-xs text-neutral-500">Desmarque para jornadas curtas/reduzidas (só bate entrada e saída)</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100 font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50">
                  <Save size={16} /> {editingId ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </form>

            {/* Seção Salário — apenas em modo edição */}
            {editingId && (
              <div className="mt-6 pt-6 border-t-2 border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <DollarSign size={18} className="text-primary-700" />
                    Salário
                  </h3>
                  {!showSalaryForm && (
                    <button type="button" onClick={() => setShowSalaryForm(true)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg">
                      <Plus size={14} /> Novo registro
                    </button>
                  )}
                </div>

                {/* Form inline de novo salário */}
                {showSalaryForm && (
                  <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                    <p className="text-xs font-semibold text-primary-900 mb-3 uppercase tracking-wider">Registrar novo salário</p>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Bruto (R$)</label>
                        <input type="number" step="0.01" min="0" required
                          value={salaryForm.gross}
                          onChange={e => setSalaryForm({...salaryForm, gross: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:border-primary-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Líquido (R$)</label>
                        <input type="number" step="0.01" min="0" required
                          value={salaryForm.net}
                          onChange={e => setSalaryForm({...salaryForm, net: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:border-primary-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Vigência a partir de</label>
                        <input type="date" required
                          value={salaryForm.effectiveFrom}
                          onChange={e => setSalaryForm({...salaryForm, effectiveFrom: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:border-primary-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Observação (opcional)</label>
                        <input type="text" maxLength={500}
                          value={salaryForm.notes}
                          placeholder="Ex: Reajuste anual, promoção..."
                          onChange={e => setSalaryForm({...salaryForm, notes: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:border-primary-500 outline-none" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowSalaryForm(false)} disabled={salaryLoading}
                        className="px-4 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 font-medium">
                        Cancelar
                      </button>
                      <button type="button" onClick={handleAddSalary} disabled={salaryLoading || !salaryForm.gross || !salaryForm.net}
                        className="inline-flex items-center gap-1.5 bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
                        <Save size={14} /> {salaryLoading ? "Salvando..." : "Registrar"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Histórico */}
                {salaryHistory.length === 0 ? (
                  <p className="text-sm text-neutral-400 text-center py-4">Nenhum salário registrado ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {salaryHistory.map((entry, idx) => {
                      const isCurrent = idx === 0 && new Date(entry.effectiveFrom) <= new Date();
                      return (
                        <div key={entry.id}
                          className={`flex items-start justify-between gap-3 p-3 rounded-xl border ${isCurrent ? "bg-accent-50 border-accent-200" : "bg-neutral-50 border-neutral-200"}`}>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-neutral-900 tabular-nums">
                                {formatBRL(entry.grossSalary)}
                              </span>
                              <span className="text-xs text-neutral-500 tabular-nums">
                                (líq {formatBRL(entry.netSalary)})
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] uppercase tracking-wider font-bold text-accent-700 bg-accent-100 px-1.5 py-0.5 rounded-full">
                                  vigente
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              A partir de <strong>{formatDateBR(entry.effectiveFrom)}</strong>
                              {entry.notes && ` — ${entry.notes}`}
                            </p>
                          </div>
                          <button type="button" onClick={() => handleDeleteSalary(entry.id)}
                            aria-label="Remover registro"
                            className="shrink-0 p-1.5 rounded-lg text-neutral-400 hover:bg-secondary-50 hover:text-secondary-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de cadastro facial */}
      {faceRegisterId !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setFaceRegisterId(null)}>
          <div className="bg-white rounded-2xl shadow-elevated w-full max-w-lg p-6 sm:p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <ScanFace size={20} className="text-primary-700" />
                Cadastrar Rosto
              </h3>
              <button type="button" onClick={() => setFaceRegisterId(null)} className="p-2 rounded-lg hover:bg-neutral-100">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-neutral-500 mb-4">
              Funcionário: <strong>{employees.find(e => e.id === faceRegisterId)?.name}</strong>
            </p>
            <FaceCapture
              mode="register"
              userId={faceRegisterId}
              onError={(msg) => { setMsg(msg); setFaceRegisterId(null); setTimeout(() => setMsg(""), 3000); }}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmação de desativação */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-elevated max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
                <UserX size={20} />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Desativar funcionário?</h3>
            </div>
            <p className="text-sm text-neutral-600 mb-6">
              O funcionário será desativado e não poderá mais acessar o sistema. Você pode reativá-lo depois.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 font-medium text-sm">
                Cancelar
              </button>
              <button type="button" onClick={() => handleDeactivate(confirmDelete)} disabled={loading}
                className="px-4 py-2 rounded-lg bg-secondary-600 hover:bg-secondary-700 text-white font-semibold text-sm disabled:opacity-50">
                {loading ? "Desativando..." : "Sim, desativar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista — cards no mobile, tabela no desktop */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 px-6 py-12 text-center text-neutral-400">
          <Users size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhum funcionário encontrado.</p>
        </div>
      ) : (
        <>
          {/* Cards (mobile, < md) */}
          <div className="md:hidden space-y-2.5">
            {filtered.map((emp) => (
              <div key={emp.id} className={`bg-white rounded-xl border border-neutral-200 p-3 ${!emp.active ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-neutral-900 text-sm truncate">{emp.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{emp.email}</p>
                  </div>
                  <span className={`shrink-0 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full ${
                    emp.employmentType === "clt" ? "bg-primary-50 text-primary-700" : "bg-warm-100 text-warm-500"
                  }`}>
                    {emp.employmentType.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs mb-2.5">
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">Cargo</p>
                    <p className="text-neutral-700 truncate">{emp.position || "—"}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">Jornada</p>
                    <p className="text-neutral-700 tabular-nums truncate">{emp.workStartTime}–{emp.workEndTime}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">Semanal</p>
                    <p className="text-neutral-700 tabular-nums">{emp.weeklyHours}h</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">Ponto</p>
                    <p className="text-neutral-700 truncate">{emp.requiresPunch ? "Obrigatório" : "Dispensado"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-neutral-100">
                  <button type="button" onClick={() => setFaceRegisterId(emp.id)} aria-label="Cadastrar rosto"
                    className="min-w-0 flex items-center justify-center gap-1 py-1.5 px-1 rounded-md text-[10px] sm:text-[11px] font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200">
                    <ScanFace size={12} className="shrink-0" />
                    <span className="truncate max-[400px]:hidden">Rosto</span>
                  </button>
                  <button type="button" onClick={() => startEdit(emp)} aria-label="Editar"
                    className="min-w-0 flex items-center justify-center gap-1 py-1.5 px-1 rounded-md text-[10px] sm:text-[11px] font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100">
                    <Edit2 size={12} className="shrink-0" />
                    <span className="truncate max-[400px]:hidden">Editar</span>
                  </button>
                  {emp.active ? (
                    <button type="button" onClick={() => setConfirmDelete(emp.id)} aria-label="Desativar"
                      className="min-w-0 flex items-center justify-center gap-1 py-1.5 px-1 rounded-md text-[10px] sm:text-[11px] font-semibold text-secondary-700 bg-secondary-50 hover:bg-secondary-100">
                      <UserX size={12} className="shrink-0" />
                      <span className="truncate max-[400px]:hidden">Desativar</span>
                    </button>
                  ) : (
                    <button type="button" onClick={() => handleReactivate(emp.id)} aria-label="Reativar"
                      className="min-w-0 flex items-center justify-center gap-1 py-1.5 px-1 rounded-md text-[10px] sm:text-[11px] font-semibold text-accent-700 bg-accent-50 hover:bg-accent-100">
                      <RefreshCw size={12} className="shrink-0" />
                      <span className="truncate max-[400px]:hidden">Reativar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tabela (desktop, ≥ md) */}
          <div className="hidden md:block bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
                    <th className="px-6 py-3 font-semibold">Nome</th>
                    <th className="px-6 py-3 font-semibold">Vínculo</th>
                    <th className="px-6 py-3 font-semibold">Cargo</th>
                    <th className="px-6 py-3 font-semibold hidden lg:table-cell">Jornada</th>
                    <th className="px-6 py-3 font-semibold">Ponto</th>
                    <th className="px-6 py-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filtered.map((emp) => (
                    <tr key={emp.id} className={`hover:bg-neutral-50 ${!emp.active ? "opacity-50" : ""}`}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-neutral-900 text-sm">{emp.name}</p>
                        <p className="text-xs text-neutral-500 break-all">{emp.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                          emp.employmentType === "clt" ? "bg-primary-50 text-primary-700" : "bg-warm-100 text-warm-500"
                        }`}>
                          {emp.employmentType.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">{emp.position || "—"}</td>
                      <td className="px-6 py-4 text-sm text-neutral-700 tabular-nums hidden lg:table-cell">
                        {emp.workStartTime}–{emp.workEndTime} ({emp.weeklyHours}h/sem)
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${emp.requiresPunch ? "bg-accent-500" : "bg-neutral-300"}`}
                          title={emp.requiresPunch ? "Obrigatório" : "Dispensado"} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => setFaceRegisterId(emp.id)} title="Cadastrar rosto"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors">
                            <ScanFace size={14} /> Rosto
                          </button>
                          <button type="button" onClick={() => startEdit(emp)} title="Editar"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors">
                            <Edit2 size={14} /> Editar
                          </button>
                          {emp.active ? (
                            <button type="button" onClick={() => setConfirmDelete(emp.id)} title="Desativar"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-secondary-700 bg-secondary-50 hover:bg-secondary-100 transition-colors">
                              <UserX size={14} /> Desativar
                            </button>
                          ) : (
                            <button type="button" onClick={() => handleReactivate(emp.id)} title="Reativar"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-accent-700 bg-accent-50 hover:bg-accent-100 transition-colors">
                              <RefreshCw size={14} /> Reativar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
