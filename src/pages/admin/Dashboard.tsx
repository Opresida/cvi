import { useState, useEffect } from "react";
import { useNavigate, Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Users,
  FileText,
  ClipboardCheck,
  Building2,
} from "lucide-react";
import logoImg from "@/assets/images/logo-white.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string | null;
  position: string | null;
}

type NavItem = {
  to: string;
  icon: typeof Clock;
  label: string;
  end?: boolean;
  roles: string[];
};

type NavGroup = {
  id: string;
  label: string;
  icon: typeof Clock;
  roles: string[];
  items: NavItem[];
};

// Itens de nível superior (fora de qualquer grupo)
const topLevelItems: NavItem[] = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Painel", end: true, roles: ["admin", "gestor", "funcionario"] },
];

// Grupos de departamento
const navGroups: NavGroup[] = [
  {
    id: "rh",
    label: "Recursos Humanos",
    icon: Building2,
    roles: ["admin", "gestor", "funcionario"],
    items: [
      { to: "/admin/dashboard/rh/ponto", icon: Clock, label: "Registro de Ponto", roles: ["admin", "gestor", "funcionario"] },
      { to: "/admin/dashboard/rh/funcionarios", icon: Users, label: "Funcionários", roles: ["admin", "gestor"] },
      { to: "/admin/dashboard/rh/ajustes", icon: ClipboardCheck, label: "Ajustes de Ponto", roles: ["admin", "gestor", "funcionario"] },
      { to: "/admin/dashboard/rh/espelho", icon: FileText, label: "Espelho de Ponto", roles: ["admin", "gestor", "funcionario"] },
    ],
  },
  // Futuros departamentos:
  // { id: "financeiro", label: "Financeiro", icon: DollarSign, roles: [...], items: [...] },
  // { id: "exames", label: "Exames", icon: FileSearch, roles: [...], items: [...] },
];

function SidebarNav({ role, onNavigate }: { role: string; onNavigate?: () => void }) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    // Abrir automaticamente o grupo da rota atual
    const initial = new Set<string>();
    for (const g of navGroups) {
      if (g.items.some((item) => location.pathname.startsWith(item.to))) {
        initial.add(g.id);
      }
    }
    // Se nenhum grupo aberto, abrir RH por padrão
    if (initial.size === 0) initial.add("rh");
    return initial;
  });

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleTopLevel = topLevelItems.filter((i) => i.roles.includes(role));
  const visibleGroups = navGroups
    .filter((g) => g.roles.includes(role))
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => i.roles.includes(role)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Menu principal">
      {/* Top-level items */}
      {visibleTopLevel.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary-700 text-white"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`
          }
        >
          <item.icon size={20} aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}

      {/* Separador */}
      {visibleTopLevel.length > 0 && visibleGroups.length > 0 && (
        <div className="pt-2 pb-1 px-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-semibold">
            Departamentos
          </p>
        </div>
      )}

      {/* Grupos colapsáveis */}
      {visibleGroups.map((group) => {
        const isOpen = openGroups.has(group.id);
        const hasActiveChild = group.items.some((i) => location.pathname.startsWith(i.to));

        return (
          <div key={group.id}>
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={isOpen}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                hasActiveChild
                  ? "text-white bg-neutral-800"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <group.icon size={20} aria-hidden="true" />
              <span className="flex-1 text-left">{group.label}</span>
              <ChevronRight
                size={16}
                aria-hidden="true"
                className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="ml-4 pl-4 border-l border-neutral-800 mt-1 space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary-700 text-white"
                          : "text-neutral-500 hover:text-white hover:bg-neutral-800"
                      }`
                    }
                  >
                    <item.icon size={16} aria-hidden="true" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cvi-user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch { /* silently ignore */ }
    localStorage.removeItem("cvi-token");
    localStorage.removeItem("cvi-user");
    navigate("/admin");
  };

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-neutral-900">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="px-6 py-6 border-b border-neutral-800">
            <img src={logoImg} alt="CVI Amazonas" className="h-10 w-auto" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-2">
              Sistema de Gestão
            </p>
          </div>

          <SidebarNav role={user.role} />

          <div className="p-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <LogOut size={20} aria-hidden="true" />
              Sair do sistema
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-neutral-800">
          <img src={logoImg} alt="CVI Amazonas" className="h-10 w-auto" />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-neutral-400 hover:text-white p-1"
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>
        <SidebarNav role={user.role} onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 -ml-2 h-11 w-11 flex items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>

            <div className="hidden lg:block">
              <p className="text-sm text-neutral-500">
                Bem-vindo(a), <span className="font-semibold text-neutral-800">{user.name.split(" ")[0]}</span>
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <span className="h-8 w-8 rounded-full bg-primary-700 text-white flex items-center justify-center text-xs font-bold">
                  {initials}
                </span>
                <span className="hidden sm:block text-sm font-medium text-neutral-800">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown size={14} className="text-neutral-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-64 max-w-xs bg-white rounded-2xl shadow-elevated border border-neutral-200 z-20 overflow-hidden">
                    <div className="p-4 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                      <p className="text-xs text-neutral-500">{user.email}</p>
                      <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                        {user.role}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <LogOut size={16} aria-hidden="true" />
                      Sair do sistema
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
