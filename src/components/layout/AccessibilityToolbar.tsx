import { useState, useEffect } from "react";
import {
  Accessibility,
  Type,
  Contrast,
  Pause,
  Play,
  Underline,
  RotateCcw,
  X,
  Hand,
  Cookie,
} from "lucide-react";
import { useAccessibilitySettings } from "@/hooks/useAccessibilitySettings";

export function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [vlibrasLoaded, setVlibrasLoaded] = useState(false);
  const { settings, update, reset } = useAccessibilitySettings();

  // Fechar com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleVlibras = () => {
    if (vlibrasLoaded) return;
    // Carrega VLibras sob demanda (widget oficial gov.br)
    const script = document.createElement("script");
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.async = true;
    script.onload = () => {
      // @ts-expect-error VLibras é global
      if (window.VLibras) {
        // @ts-expect-error VLibras é global
        new window.VLibras.Widget("https://vlibras.gov.br/app");
        setVlibrasLoaded(true);
      }
    };
    document.body.appendChild(script);

    // Container requerido pelo widget
    const div = document.createElement("div");
    div.setAttribute("vw", "");
    div.className = "enabled";
    div.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `;
    document.body.appendChild(div);
  };

  return (
    <>
      {/* Botão flutuante abre a toolbar */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label={open ? "Fechar ferramentas de acessibilidade" : "Abrir ferramentas de acessibilidade"}
        className="fixed left-4 top-28 z-40 flex h-14 w-14 items-center justify-center rounded-full
          bg-primary-700 text-white shadow-elevated transition-all
          hover:bg-primary-800 hover:scale-105
          focus-visible:ring-4 focus-visible:ring-primary-300"
      >
        {open ? <X size={24} aria-hidden="true" /> : <Accessibility size={24} aria-hidden="true" />}
      </button>

      {/* Painel lateral */}
      {open && (
        <div
          id="a11y-panel"
          role="dialog"
          aria-label="Ferramentas de acessibilidade"
          className="fixed left-4 top-48 z-40 w-72 rounded-2xl bg-white shadow-elevated
            border-2 border-primary-200 p-5 max-h-[calc(100vh-14rem)] overflow-y-auto"
        >
          <h2 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Accessibility size={18} aria-hidden="true" className="text-primary-700" />
            Acessibilidade
          </h2>

          {/* Tamanho da fonte */}
          <fieldset className="mb-5">
            <legend className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Type size={14} aria-hidden="true" /> Tamanho da fonte
            </legend>
            <div className="grid grid-cols-3 gap-1" role="radiogroup">
              {[
                { v: "normal", label: "A" },
                { v: "large", label: "A+" },
                { v: "xlarge", label: "A++" },
              ].map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  role="radio"
                  aria-checked={settings.fontSize === opt.v}
                  onClick={() => update("fontSize", opt.v as typeof settings.fontSize)}
                  className={`py-2 rounded-lg text-sm font-bold transition-colors
                    ${settings.fontSize === opt.v
                      ? "bg-primary-700 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Alto contraste */}
          <div className="mb-4">
            <button
              type="button"
              role="switch"
              aria-checked={settings.contrast === "high"}
              onClick={() =>
                update("contrast", settings.contrast === "high" ? "normal" : "high")
              }
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg
                bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-neutral-800">
                <Contrast size={16} aria-hidden="true" />
                Alto contraste
              </span>
              <span
                className={`inline-block h-6 w-10 rounded-full relative transition-colors
                  ${settings.contrast === "high" ? "bg-primary-700" : "bg-neutral-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform
                    ${settings.contrast === "high" ? "translate-x-[1.1rem]" : "translate-x-0.5"}`}
                />
              </span>
            </button>
          </div>

          {/* Pausar animações */}
          <div className="mb-4">
            <button
              type="button"
              role="switch"
              aria-checked={settings.motion === "off"}
              onClick={() =>
                update("motion", settings.motion === "off" ? "auto" : "off")
              }
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg
                bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-neutral-800">
                {settings.motion === "off" ? (
                  <Pause size={16} aria-hidden="true" />
                ) : (
                  <Play size={16} aria-hidden="true" />
                )}
                Pausar animações
              </span>
              <span
                className={`inline-block h-6 w-10 rounded-full relative transition-colors
                  ${settings.motion === "off" ? "bg-primary-700" : "bg-neutral-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform
                    ${settings.motion === "off" ? "translate-x-[1.1rem]" : "translate-x-0.5"}`}
                />
              </span>
            </button>
          </div>

          {/* Sublinhar links */}
          <div className="mb-4">
            <button
              type="button"
              role="switch"
              aria-checked={settings.links === "underlined"}
              onClick={() =>
                update("links", settings.links === "underlined" ? "default" : "underlined")
              }
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg
                bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-neutral-800">
                <Underline size={16} aria-hidden="true" />
                Sublinhar links
              </span>
              <span
                className={`inline-block h-6 w-10 rounded-full relative transition-colors
                  ${settings.links === "underlined" ? "bg-primary-700" : "bg-neutral-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform
                    ${settings.links === "underlined" ? "translate-x-[1.1rem]" : "translate-x-0.5"}`}
                />
              </span>
            </button>
          </div>

          {/* VLibras */}
          <div className="mb-4">
            <button
              type="button"
              onClick={toggleVlibras}
              disabled={vlibrasLoaded}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg
                bg-accent-50 hover:bg-accent-100 transition-colors
                disabled:opacity-60 disabled:cursor-not-allowed border border-accent-200"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-accent-800">
                <Hand size={16} aria-hidden="true" />
                {vlibrasLoaded ? "VLibras ativado" : "Ativar VLibras"}
              </span>
              {!vlibrasLoaded && (
                <span className="text-xs text-accent-600 font-semibold">Libras</span>
              )}
            </button>
          </div>

          {/* Preferências de cookies */}
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("cvi:open-cookie-preferences"))
            }
            className="w-full flex items-center justify-center gap-2 py-2.5 mb-1 text-sm font-semibold text-primary-700 hover:text-primary-800 border border-primary-200 hover:bg-primary-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3"
          >
            <Cookie size={14} aria-hidden="true" />
            Preferências de cookies
          </button>

          {/* Restaurar padrões */}
          <button
            type="button"
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Restaurar padrões
          </button>

          <p className="mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-500 leading-relaxed">
            Suas preferências são salvas neste dispositivo.
          </p>
        </div>
      )}
    </>
  );
}
