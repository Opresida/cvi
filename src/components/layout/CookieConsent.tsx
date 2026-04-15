import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Shield, X, Check, Settings2 } from "lucide-react";
import { useCookieConsent } from "@/hooks/useCookieConsent";

/**
 * Banner de consentimento de cookies (LGPD).
 *
 * Fluxo:
 * 1. Na primeira visita, o banner aparece sticky no rodapé.
 * 2. Usuário escolhe: Aceitar todos / Apenas essenciais / Personalizar.
 * 3. Se personalizar, abre modal com toggles por categoria.
 * 4. Decisão é persistida. Banner some.
 * 5. Pode ser reaberto via botão "Preferências de Cookies" no toolbar/footer.
 */

export function CookieConsent() {
  const { preferences, decided, loaded, acceptAll, rejectOptional, save } = useCookieConsent();
  const [panelOpen, setPanelOpen] = useState(false);
  const [localAnalytics, setLocalAnalytics] = useState(preferences.analytics);
  const [localMarketing, setLocalMarketing] = useState(preferences.marketing);
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  const panelCloseRef = useRef<HTMLButtonElement>(null);

  // Escuta evento custom para reabrir modal (do toolbar ou footer)
  useEffect(() => {
    const onReopen = () => {
      setLocalAnalytics(preferences.analytics);
      setLocalMarketing(preferences.marketing);
      setPanelOpen(true);
    };
    window.addEventListener("cvi:open-cookie-preferences", onReopen);
    return () => window.removeEventListener("cvi:open-cookie-preferences", onReopen);
  }, [preferences]);

  // Focus trap + ESC no modal
  useEffect(() => {
    if (!panelOpen) return;
    panelCloseRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  // Foco inicial no banner quando aparece
  useEffect(() => {
    if (loaded && !decided) {
      firstFocusRef.current?.focus();
    }
  }, [loaded, decided]);

  const showBanner = loaded && !decided && !panelOpen;

  const openCustomize = () => {
    setLocalAnalytics(preferences.analytics);
    setLocalMarketing(preferences.marketing);
    setPanelOpen(true);
  };

  const handleSaveCustom = () => {
    save({ analytics: localAnalytics, marketing: localMarketing });
    setPanelOpen(false);
  };

  return (
    <>
      {/* ── BANNER INICIAL ──────────────────────────────────── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            role="dialog"
            aria-labelledby="cookie-banner-title"
            aria-describedby="cookie-banner-desc"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 z-[90] max-w-5xl mx-auto"
          >
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-2xl p-6 sm:p-8 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-6">
              <div className="hidden lg:flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <Cookie size={26} strokeWidth={1.5} aria-hidden="true" />
              </div>

              <div className="mb-5 lg:mb-0">
                <div className="flex items-center gap-3 mb-3 lg:hidden">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <Cookie size={20} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <h2
                    id="cookie-banner-title"
                    className="text-base font-bold text-neutral-900 tracking-tight"
                  >
                    Seus dados, sua escolha.
                  </h2>
                </div>
                <h2
                  id="cookie-banner-title"
                  className="hidden lg:block text-lg font-bold text-neutral-900 tracking-tight mb-1"
                >
                  Seus dados, sua escolha.
                </h2>
                <p
                  id="cookie-banner-desc"
                  className="text-sm text-neutral-700 leading-[1.7]"
                >
                  Usamos cookies essenciais para o funcionamento do site e, com seu
                  consentimento, cookies de análise para entender como melhorar sua
                  experiência. Você pode aceitar todos, apenas os essenciais ou
                  personalizar suas preferências a qualquer momento.{" "}
                  <Link
                    to="/privacidade"
                    className="font-semibold text-primary-700 underline decoration-primary-300 decoration-2 underline-offset-4 hover:decoration-primary-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 rounded-sm"
                  >
                    Saiba mais na política de privacidade
                  </Link>
                  .
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                <button
                  ref={firstFocusRef}
                  type="button"
                  onClick={acceptAll}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-700 text-white font-bold text-sm hover:bg-primary-800 transition-colors shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 whitespace-nowrap"
                >
                  <Check size={16} aria-hidden="true" />
                  Aceitar todos
                </button>
                <button
                  type="button"
                  onClick={rejectOptional}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl border-2 border-neutral-300 text-neutral-800 font-bold text-sm hover:bg-neutral-50 hover:border-neutral-400 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 whitespace-nowrap"
                >
                  Apenas essenciais
                </button>
                <button
                  type="button"
                  onClick={openCustomize}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-primary-800 font-bold text-sm hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 whitespace-nowrap"
                >
                  <Settings2 size={16} aria-hidden="true" />
                  Personalizar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL DE PREFERÊNCIAS ───────────────────────────── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-panel-title"
            className="fixed inset-0 z-[95] bg-neutral-900/70 backdrop-blur flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={() => setPanelOpen(false)}
          >
            <motion.div
              initial={{ y: 40, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, scale: 0.98 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 p-6 sm:p-8 pb-4 border-b border-neutral-200">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <Shield size={22} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <div>
                    <h2
                      id="cookie-panel-title"
                      className="text-xl font-bold text-neutral-900 tracking-tight mb-1"
                    >
                      Preferências de Cookies
                    </h2>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      Controle quais cookies você permite. Você pode alterar a
                      qualquer momento.
                    </p>
                  </div>
                </div>
                <button
                  ref={panelCloseRef}
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Fechar preferências de cookies"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {/* Categorias */}
              <div className="overflow-y-auto p-6 sm:p-8 space-y-4">
                <CategoryToggle
                  title="Essenciais"
                  description="Necessários para o funcionamento básico do site (navegação, preferências de acessibilidade, segurança). Não podem ser desativados."
                  checked
                  locked
                />
                <CategoryToggle
                  title="Análise de uso"
                  description="Cookies que nos ajudam a entender como você navega no site, identificar gargalos e melhorar a experiência. Anônimos e agregados."
                  checked={localAnalytics}
                  onChange={setLocalAnalytics}
                />
                <CategoryToggle
                  title="Marketing"
                  description="Permitem personalização de conteúdo institucional e mensuração do alcance de campanhas de conscientização. Nunca serão usados para fins comerciais."
                  checked={localMarketing}
                  onChange={setLocalMarketing}
                />
              </div>

              {/* Ações */}
              <div className="border-t border-neutral-200 p-6 sm:p-8 pt-5 flex flex-col sm:flex-row gap-3 bg-neutral-50">
                <button
                  type="button"
                  onClick={() => {
                    acceptAll();
                    setPanelOpen(false);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-700 text-white font-bold text-sm hover:bg-primary-800 transition-colors shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 flex-1"
                >
                  <Check size={16} aria-hidden="true" />
                  Aceitar todos
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl border-2 border-primary-600 text-primary-800 font-bold text-sm hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 flex-1"
                >
                  Salvar escolhas
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* Toggle acessível por categoria */
function CategoryToggle({
  title,
  description,
  checked,
  locked = false,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        locked
          ? "bg-neutral-50 border-neutral-200"
          : checked
          ? "bg-primary-50/50 border-primary-200"
          : "bg-white border-neutral-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              {title}
            </h3>
            {locked && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 text-[0.62rem] font-bold uppercase tracking-wider">
                Obrigatórios
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed">{description}</p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={`${title}: ${checked ? "ativado" : "desativado"}`}
          disabled={locked}
          onClick={() => onChange?.(!checked)}
          className={`relative shrink-0 inline-flex h-7 w-12 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 ${
            checked ? "bg-primary-600" : "bg-neutral-300"
          } ${locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span
            aria-hidden="true"
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
              checked ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
