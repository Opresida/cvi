import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff, Shield } from "lucide-react";
import logoImg from "@/assets/images/logo.png";

const API_URL = "";

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Limpar sessão anterior ao entrar na tela de login
  useEffect(() => {
    localStorage.removeItem("cvi-token");
    localStorage.removeItem("cvi-user");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao fazer login");
        return;
      }

      localStorage.setItem("cvi-token", data.token);
      localStorage.setItem("cvi-user", JSON.stringify(data.user));
      navigate("/admin/dashboard");
    } catch {
      setError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 px-4">
      {/* Decoração lateral */}
      <div
        aria-hidden="true"
        className="fixed left-0 top-0 bottom-0 w-1/3 hidden lg:block"
        style={{
          background:
            "linear-gradient(135deg, #053c47 0%, #085969 50%, #0a7688 100%)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/70 px-12">
            <Shield size={48} className="mx-auto mb-6 text-accent-400" />
            <h2 className="text-3xl font-bold text-white mb-3">Área Administrativa</h2>
            <p className="text-sm leading-relaxed">
              Sistema interno de gestão do CVI — Centro de Vida Independente do Amazonas.
              Acesso restrito a funcionários autorizados.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md lg:ml-auto lg:mr-[16%] relative z-10">
        <div className="bg-white rounded-3xl shadow-elevated p-8 sm:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logoImg} alt="CVI Amazonas" className="h-14 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-neutral-900">Entrar no Sistema</h1>
            <p className="text-sm text-neutral-500 mt-1">Acesso restrito — área administrativa</p>
          </div>

          {/* Erro */}
          {error && (
            <div
              role="alert"
              className="mb-6 px-4 py-3 rounded-xl bg-secondary-50 border border-secondary-200 text-secondary-700 text-sm font-medium"
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-neutral-800 mb-2">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-900
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-neutral-800 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-900
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800
                disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-semibold
                py-4 rounded-xl transition-colors focus-visible:ring-4 focus-visible:ring-primary-300"
            >
              {loading ? (
                <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-400">
            Problemas com acesso? Contate a gestão do CVI.
          </p>
        </div>

        <p className="text-center text-xs text-neutral-600 mt-6">
          © {new Date().getFullYear()} CVI Amazonas — Sistema interno
        </p>
      </div>
    </div>
  );
}
