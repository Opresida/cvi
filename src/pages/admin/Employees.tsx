import { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Search, Edit2, UserX, X, Save, Users, RefreshCw, ScanFace,
} from "lucide-react";
import { FaceCapture } from "@/components/ui/FaceCapture";

const API_URL = import.meta.env.VITE_API_URL || "";
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
  active: boolean;
}

const emptyForm = {
  name: "", email: "", password: "", role: "funcionario",
  employmentType: "clt", department: "", position: "",
  requiresPunch: true, weeklyHours: 44, dailyHours: 8,
  workStartTime: "08:00", workEndTime: "17:00", lunchDurationMinutes: 60,
};

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
    });
    setShowForm(true);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Funcionários</h1>
          <p className="text-neutral-500 mt-1">{employees.filter(e => e.active).length} ativos de {employees.length} cadastrados</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
        >
          <UserPlus size={18} /> Novo Funcionário
        </button>
      </div>

      {msg && (
        <div role="status" className="mb-4 px-4 py-3 rounded-xl bg-accent-50 border border-accent-200 text-accent-700 text-sm font-medium">
          {msg}
        </div>
      )}

      {/* Busca */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
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
                  <input type="password" required={!editingId} value={form.password}
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

              <label className="flex items-center gap-3 cursor-pointer py-2">
                <input type="checkbox" checked={form.requiresPunch} onChange={e => setForm({...form, requiresPunch: e.target.checked})}
                  className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm font-medium text-neutral-800">Obrigatório registrar ponto</span>
              </label>

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

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-neutral-400">
            <Users size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum funcionário encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-semibold">Nome</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-semibold hidden sm:table-cell">Vínculo</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-semibold hidden md:table-cell">Cargo</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-semibold hidden lg:table-cell">Jornada</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-semibold hidden sm:table-cell">Ponto</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((emp) => (
                  <tr key={emp.id} className={`hover:bg-neutral-50 ${!emp.active ? "opacity-50" : ""}`}>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <p className="font-semibold text-neutral-900 text-sm">{emp.name}</p>
                      <p className="text-xs text-neutral-500 break-all">{emp.email}</p>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <span className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                        emp.employmentType === "clt" ? "bg-primary-50 text-primary-700" : "bg-warm-100 text-warm-500"
                      }`}>
                        {emp.employmentType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-neutral-700 hidden md:table-cell">{emp.position || "—"}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-neutral-700 tabular-nums hidden lg:table-cell">
                      {emp.workStartTime}–{emp.workEndTime} ({emp.weeklyHours}h/sem)
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${emp.requiresPunch ? "bg-accent-500" : "bg-neutral-300"}`}
                        title={emp.requiresPunch ? "Obrigatório" : "Dispensado"} />
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
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
        )}
      </div>
    </div>
  );
}
