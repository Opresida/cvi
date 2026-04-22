import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FileText, ChevronLeft, ChevronRight, Upload, Download, X, Save, Check, AlertCircle,
  Trash2, Paperclip, Receipt,
} from "lucide-react";

const API_URL = "";
function getToken() { return localStorage.getItem("cvi-token") || ""; }

interface UserData { id: number; role: string; }
interface Employee { id: number; name: string; department: string | null; requiresPunch: boolean; active: boolean; }
interface Paystub {
  id: number;
  userId: number;
  userName: string;
  userDepartment: string | null;
  referenceMonth: string;
  fileId: number;
  fileName: string;
  fileSizeBytes: number;
  notes: string | null;
  uploadedAt: string;
}

function formatDateBR(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function Paystubs() {
  const { user } = useOutletContext<{ user: UserData }>();
  const isAdmin = user.role === "admin" || user.role === "gestor";

  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stubs, setStubs] = useState<Paystub[]>([]);
  const [uploadingForEmployee, setUploadingForEmployee] = useState<Employee | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const stubsUrl = isAdmin
        ? `${API_URL}/api/paystubs?month=${month}`
        : `${API_URL}/api/paystubs`; // funcionário vê todos seus (histórico completo)
      const stubsRes = await fetch(stubsUrl, { headers });
      if (stubsRes.ok) { const d = await stubsRes.json(); setStubs(d.paystubs); }

      if (isAdmin) {
        const empRes = await fetch(`${API_URL}/api/employees`, { headers });
        if (empRes.ok) {
          const d = await empRes.json();
          setEmployees(d.employees.filter((e: Employee) => e.requiresPunch && e.active));
        }
      }
    } catch { /* ignore */ }
  }, [month, isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stubByUserId = useMemo(() => {
    const m: Record<number, Paystub> = {};
    for (const s of stubs) m[s.userId] = s;
    return m;
  }, [stubs]);

  const monthLabel = (() => {
    const [y, m] = month.split("-").map(Number);
    return new Date(y, m - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  })();

  function navigateMonth(dir: number) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setMonth(d.toISOString().slice(0, 7));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) { setFile(null); return; }
    if (f.size > 10 * 1024 * 1024) {
      setMsg({ type: "error", text: "Arquivo excede 10 MB" });
      e.target.value = ""; return;
    }
    if (f.type !== "application/pdf") {
      setMsg({ type: "error", text: "Apenas PDF é aceito para contracheques" });
      e.target.value = ""; return;
    }
    setFile(f);
  }

  async function handleUpload() {
    if (!uploadingForEmployee || !file) return;
    setLoading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("userId", String(uploadingForEmployee.id));
      fd.append("month", month);
      fd.append("file", file);
      if (notes) fd.append("notes", notes);

      const res = await fetch(`${API_URL}/api/paystubs`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: "success", text: data.action === "replaced" ? "Contracheque substituído" : "Contracheque enviado" });
        setUploadingForEmployee(null);
        setFile(null);
        setNotes("");
        if (fileRef.current) fileRef.current.value = "";
        fetchData();
      } else {
        setMsg({ type: "error", text: data.error || "Erro ao enviar" });
      }
    } catch {
      setMsg({ type: "error", text: "Erro de conexão" });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 4000);
    }
  }

  async function handleDelete(stubId: number) {
    if (!confirm("Remover este contracheque? O arquivo será apagado permanentemente.")) return;
    try {
      const res = await fetch(`${API_URL}/api/paystubs/${stubId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) { fetchData(); setMsg({ type: "success", text: "Contracheque removido" }); }
      else { const d = await res.json(); setMsg({ type: "error", text: d.error || "Erro" }); }
    } catch { setMsg({ type: "error", text: "Erro de conexão" }); }
    setTimeout(() => setMsg(null), 3000);
  }

  function handleDownload(stub: Paystub) {
    fetch(`${API_URL}/api/paystubs/${stub.id}/download`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.ok ? r.blob() : Promise.reject())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = stub.fileName || `contracheque-${stub.referenceMonth}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      })
      .catch(() => setMsg({ type: "error", text: "Não foi possível baixar" }));
  }

  function startUpload(emp: Employee) {
    setUploadingForEmployee(emp);
    setFile(null);
    setNotes("");
    if (fileRef.current) fileRef.current.value = "";
  }

  // ==================== VIEW DO FUNCIONÁRIO ====================
  if (!isAdmin) {
    return (
      <div>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-neutral-900">Meus Contracheques</h1>
          <p className="text-sm text-neutral-500 mt-1">Histórico completo dos seus contracheques — clique para baixar o PDF</p>
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

        {stubs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 px-6 py-12 text-center text-neutral-400">
            <Receipt size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum contracheque disponível ainda.</p>
            <p className="text-xs mt-1">Quando o RH anexar seu contracheque mensal, ele aparecerá aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stubs.map((stub) => {
              const refDate = new Date(stub.referenceMonth + "T12:00:00");
              const monthName = refDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
              return (
                <div key={stub.id} className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center">
                      <Receipt size={18} className="text-primary-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-neutral-900 capitalize">{monthName}</p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                        <Paperclip size={10} />
                        <span className="truncate">{stub.fileName}</span>
                        <span className="tabular-nums">({formatSize(stub.fileSizeBytes)})</span>
                      </p>
                      {stub.notes && <p className="text-xs text-neutral-500 mt-1">{stub.notes}</p>}
                      <p className="text-[10px] text-neutral-400 mt-1">Enviado em {formatDateBR(stub.uploadedAt)}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleDownload(stub)}
                    className="shrink-0 inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg">
                    <Download size={14} />
                    <span className="hidden sm:inline">Baixar</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ==================== VIEW DO ADMIN ====================
  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-neutral-900">Contracheques</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Envie o contracheque PDF de cada funcionário devolvido pelo contador
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

      {/* Navegação de mês */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-5 sm:mb-6">
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

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-semibold">Enviados</p>
          <p className="text-lg sm:text-2xl font-bold text-accent-600 tabular-nums">
            {stubs.length} de {employees.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-semibold">Pendentes</p>
          <p className="text-lg sm:text-2xl font-bold text-warm-500 tabular-nums">
            {employees.length - stubs.length}
          </p>
        </div>
      </div>

      {/* Lista de funcionários */}
      {employees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 px-6 py-12 text-center text-neutral-400">
          <FileText size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhum funcionário ativo cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map((emp) => {
            const stub = stubByUserId[emp.id];
            return (
              <div key={emp.id} className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-bold text-neutral-900 truncate">{emp.name}</p>
                    {emp.department && <p className="text-xs text-neutral-500">{emp.department}</p>}
                  </div>
                  {stub ? (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200">
                      <Check size={10} /> Enviado
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-warm-100 text-warm-500 border border-warm-200">
                      Pendente
                    </span>
                  )}
                </div>

                {stub && (
                  <div className="mb-3 p-2.5 bg-neutral-50 rounded-lg flex items-center gap-2">
                    <Paperclip size={12} className="text-primary-700 shrink-0" />
                    <p className="text-xs text-neutral-700 truncate flex-1">{stub.fileName}</p>
                    <span className="text-[10px] text-neutral-400 tabular-nums shrink-0">{formatSize(stub.fileSizeBytes)}</span>
                  </div>
                )}

                {stub?.notes && (
                  <p className="text-xs text-neutral-500 mb-3 p-2 bg-neutral-50 rounded-lg">
                    <strong>Obs:</strong> {stub.notes}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 flex-wrap">
                  {stub && (
                    <button type="button" onClick={() => handleDownload(stub)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg">
                      <Download size={12} /> Baixar
                    </button>
                  )}
                  <button type="button" onClick={() => startUpload(emp)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-primary-700 hover:bg-primary-800 px-3 py-1.5 rounded-lg">
                    <Upload size={12} /> {stub ? "Substituir" : "Enviar"}
                  </button>
                  {stub && (
                    <button type="button" onClick={() => handleDelete(stub.id)}
                      className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-secondary-600 px-2 py-1.5 rounded-lg hover:bg-neutral-100">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de upload */}
      {uploadingForEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => !loading && setUploadingForEmployee(null)}>
          <div className="bg-white rounded-2xl shadow-elevated w-full max-w-md p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Upload size={18} className="text-primary-700" />
                {stubByUserId[uploadingForEmployee.id] ? "Substituir contracheque" : "Enviar contracheque"}
              </h3>
              <button type="button" onClick={() => setUploadingForEmployee(null)} disabled={loading}
                className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-50">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-xl">
              <p className="text-xs uppercase tracking-wider text-primary-700 font-bold mb-1">Funcionário · {monthLabel}</p>
              <p className="text-sm font-bold text-neutral-900">{uploadingForEmployee.name}</p>
              {uploadingForEmployee.department && <p className="text-xs text-neutral-500">{uploadingForEmployee.department}</p>}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">Arquivo PDF *</label>
                <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFileSelect} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-neutral-300 hover:border-primary-400 hover:bg-primary-50 text-neutral-700 text-sm font-medium">
                  <Paperclip size={16} />
                  {file ? "Trocar arquivo" : "Escolher arquivo PDF"}
                </button>
                {file && (
                  <div className="mt-2 p-2.5 bg-neutral-50 rounded-lg flex items-center gap-2">
                    <FileText size={14} className="text-primary-700 shrink-0" />
                    <p className="text-xs text-neutral-700 truncate flex-1">{file.name}</p>
                    <span className="text-[10px] text-neutral-400 tabular-nums shrink-0">{formatSize(file.size)}</span>
                  </div>
                )}
                <p className="text-xs text-neutral-400 mt-1">Apenas PDF · máximo 10 MB</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">Observação (opcional)</label>
                <input type="text" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Inclui 13º proporcional"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white focus:border-primary-500 outline-none text-sm" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-neutral-200">
              <button type="button" onClick={() => setUploadingForEmployee(null)} disabled={loading}
                className="px-4 py-2.5 rounded-xl text-sm text-neutral-700 hover:bg-neutral-100 font-medium disabled:opacity-50">
                Cancelar
              </button>
              <button type="button" onClick={handleUpload} disabled={loading || !file}
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50">
                <Save size={16} /> {loading ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
