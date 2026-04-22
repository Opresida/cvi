import { useState, useEffect } from "react";
import { Clock, Users, CalendarCheck, Activity } from "lucide-react";
import { useOutletContext } from "react-router-dom";

const API_URL = "";
function getToken() { return localStorage.getItem("cvi-token") || ""; }

interface UserData {
  name: string;
  role: string;
  department: string | null;
}

export function DashboardHome() {
  const { user } = useOutletContext<{ user: UserData }>();
  const [stats, setStats] = useState({ employees: 0, todayPunches: 0 });
  const [now, setNow] = useState(new Date());

  const greeting =
    now.getHours() < 12
      ? "Bom dia"
      : now.getHours() < 18
        ? "Boa tarde"
        : "Boa noite";

  // Relógio atualiza a cada minuto
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Buscar dados reais
  useEffect(() => {
    const isAdmin = user.role === "admin" || user.role === "gestor";

    async function fetchStats() {
      try {
        if (isAdmin) {
          const [empRes, pontoRes] = await Promise.all([
            fetch(`${API_URL}/api/employees`, {
              headers: { Authorization: `Bearer ${getToken()}` },
            }),
            fetch(`${API_URL}/api/ponto/todos?dias=1`, {
              headers: { Authorization: `Bearer ${getToken()}` },
            }),
          ]);

          if (empRes.ok) {
            const empData = await empRes.json();
            const activeCount = empData.employees.filter((e: any) => e.active).length;
            setStats(prev => ({ ...prev, employees: activeCount }));
          }

          if (pontoRes.ok) {
            const pontoData = await pontoRes.json();
            setStats(prev => ({ ...prev, todayPunches: pontoData.records.length }));
          }
        } else {
          const pontoRes = await fetch(`${API_URL}/api/ponto/hoje`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          if (pontoRes.ok) {
            const pontoData = await pontoRes.json();
            setStats(prev => ({ ...prev, todayPunches: pontoData.records.length }));
          }
        }
      } catch { /* silently ignore */ }
    }

    fetchStats();
  }, [user.role]);

  const isAdmin = user.role === "admin" || user.role === "gestor";

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-neutral-900">
          {greeting}, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-xs sm:text-base text-neutral-500 mt-1">
          Painel administrativo do CVI Amazonas
          {user.department ? ` — ${user.department}` : ""}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 flex items-center sm:items-start gap-3 sm:gap-4">
          <div className="bg-primary-700 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0">
            <Clock size={20} className="sm:hidden" aria-hidden="true" />
            <Clock size={22} className="hidden sm:block" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-neutral-500 truncate">Registro de Ponto</p>
            <p className="text-lg sm:text-2xl font-bold text-accent-600">Ativo</p>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 flex items-center sm:items-start gap-3 sm:gap-4">
            <div className="bg-accent-600 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0">
              <Users size={20} className="sm:hidden" aria-hidden="true" />
              <Users size={22} className="hidden sm:block" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-neutral-500 truncate">Funcionários ativos</p>
              <p className="text-lg sm:text-2xl font-bold text-neutral-900">{stats.employees}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 flex items-center sm:items-start gap-3 sm:gap-4">
          <div className="bg-warm-500 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0">
            <CalendarCheck size={20} className="sm:hidden" aria-hidden="true" />
            <CalendarCheck size={22} className="hidden sm:block" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-neutral-500 truncate">{isAdmin ? "Registros hoje" : "Seus registros hoje"}</p>
            <p className="text-lg sm:text-2xl font-bold text-neutral-900">{stats.todayPunches}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 flex items-center sm:items-start gap-3 sm:gap-4">
          <div className="bg-accent-500 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0">
            <Activity size={20} className="sm:hidden" aria-hidden="true" />
            <Activity size={22} className="hidden sm:block" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-neutral-500 truncate">Status do Sistema</p>
            <p className="text-lg sm:text-2xl font-bold text-accent-600">Online</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-3 sm:mb-4">Informações da Sessão</h2>
        <dl className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div>
            <dt className="text-neutral-500">Usuário logado</dt>
            <dd className="font-semibold text-neutral-900 truncate">{user.name}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Nível de acesso</dt>
            <dd className="font-semibold text-neutral-900 capitalize">{user.role}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Data atual</dt>
            <dd className="font-semibold text-neutral-900">
              {now.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Horário</dt>
            <dd className="font-semibold text-neutral-900">
              {now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
