import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  HeartHandshake,
  Bus,
  Landmark,
  Activity,
  Calendar,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipLinks } from "@/components/layout/SkipLinks";
import { AccessibilityToolbar } from "@/components/layout/AccessibilityToolbar";
import { FloatingDonateCTA } from "@/components/layout/FloatingDonateCTA";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { siteContent } from "@/data/content";

const { gallery } = siteContent;

const iconMap: Record<string, React.ReactNode> = {
  "heart-handshake": <HeartHandshake size={20} strokeWidth={1.5} aria-hidden="true" />,
  bus: <Bus size={20} strokeWidth={1.5} aria-hidden="true" />,
  landmark: <Landmark size={20} strokeWidth={1.5} aria-hidden="true" />,
  activity: <Activity size={20} strokeWidth={1.5} aria-hidden="true" />,
  calendar: <Calendar size={20} strokeWidth={1.5} aria-hidden="true" />,
};

export function Galeria() {
  const { hash } = useLocation();
  const [activeSlug, setActiveSlug] = useState<string>(
    gallery.folders[0]?.slug || ""
  );
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Sincroniza com hash (vindo da home: /galeria#acolhimento)
  useEffect(() => {
    const slug = hash.replace("#", "");
    if (slug && gallery.folders.some((f) => f.slug === slug)) {
      setActiveSlug(slug);
    }
  }, [hash]);

  // ESC fecha lightbox + navegação por teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      const folder = gallery.folders.find((f) => f.slug === activeSlug);
      const total = folder?.photos.length || 0;
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? null : (i - 1 + total) % total));
      if (e.key === "ArrowRight") setLightbox((i) => (i === null ? null : (i + 1) % total));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, activeSlug]);

  const activeFolder = gallery.folders.find((f) => f.slug === activeSlug);
  const photos = activeFolder?.photos || [];

  return (
    <>
      <SkipLinks />
      <Header />
      <AccessibilityToolbar />

      <main id="main-content" role="main">
        {/* ── HERO ─────────────────────────────────────────── */}
        <section
          aria-labelledby="galeria-title"
          className="relative pt-40 pb-16 lg:pt-48 lg:pb-20 bg-gradient-to-b from-primary-50 via-white to-white overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute -top-10 right-0 text-[20rem] font-black text-primary-100/50 leading-none select-none pointer-events-none hidden lg:block"
          >
            08
          </div>

          <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800 mb-8 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 rounded-sm"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Voltar para a página inicial
              </Link>

              <div className="flex items-center gap-3 mb-6">
                <span aria-hidden="true" className="h-px w-12 bg-primary-600" />
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
                  {gallery.section_label}
                </span>
              </div>

              <h1
                id="galeria-title"
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.05] tracking-tight mb-6"
              >
                {gallery.headline}
              </h1>

              <p className="text-lg sm:text-xl text-neutral-700 leading-[1.75] max-w-2xl">
                {gallery.subheadline}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── ABAS DE PASTAS ───────────────────────────────── */}
        <section
          aria-label="Pastas da galeria"
          className="sticky top-[72px] z-30 bg-white/90 backdrop-blur border-y border-neutral-200"
        >
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <nav
              aria-label="Navegação da galeria"
              className="flex gap-2 py-4 overflow-x-auto scrollbar-thin"
            >
              {gallery.folders.map((f) => {
                const isActive = activeSlug === f.slug;
                const count: number = f.photos.length;
                return (
                  <button
                    key={f.slug}
                    type="button"
                    onClick={() => {
                      setActiveSlug(f.slug);
                      window.history.replaceState(null, "", `#${f.slug}`);
                    }}
                    aria-pressed={isActive}
                    className={`group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 ${
                      isActive
                        ? "bg-primary-700 text-white shadow-lg shadow-primary-700/20"
                        : "bg-neutral-100 text-neutral-700 hover:bg-primary-50 hover:text-primary-800"
                    }`}
                  >
                    <span
                      className={`${
                        isActive ? "text-primary-100" : "text-primary-700"
                      }`}
                    >
                      {iconMap[f.icon]}
                    </span>
                    {f.name}
                    <span
                      className={`inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-[0.65rem] font-bold tabular-nums ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-white text-neutral-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </section>

        {/* ── CONTEÚDO DA PASTA ATIVA ──────────────────────── */}
        <section
          aria-labelledby="folder-title"
          className="relative py-16 lg:py-24 bg-white"
        >
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <AnimatePresence mode="wait">
              {activeFolder && (
                <motion.div
                  key={activeFolder.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-12 max-w-3xl">
                    <h2
                      id="folder-title"
                      className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight tracking-tight mb-3"
                    >
                      {activeFolder.name}
                    </h2>
                    <p className="text-base sm:text-lg text-neutral-700 leading-[1.75]">
                      {activeFolder.description}
                    </p>
                  </div>

                  {photos.length === 0 ? (
                    <EmptyState folderName={activeFolder.name} />
                  ) : (
                    <ol
                      role="list"
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5"
                    >
                      {photos.map((photo: any, i: number) => (
                        <motion.li
                          key={`${activeFolder.slug}-${i}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Math.min(i * 0.03, 0.3) }}
                        >
                          <button
                            type="button"
                            onClick={() => setLightbox(i)}
                            className="group relative block w-full aspect-square overflow-hidden rounded-xl bg-neutral-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3"
                          >
                            <span
                              aria-hidden="true"
                              className="absolute inset-2 border border-white/30 rounded-lg pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                            <img
                              src={photo.src}
                              alt={photo.alt || `${activeFolder.name} — foto ${i + 1}`}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                            {photo.caption && (
                              <span className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                                {photo.caption}
                              </span>
                            )}
                          </button>
                        </motion.li>
                      ))}
                    </ol>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── CTA FINAL — CONTATO + DOAÇÃO ─────────────────── */}
        <section
          aria-labelledby="galeria-cta-title"
          className="relative py-24 lg:py-32 bg-primary-900 text-white overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-secondary-500/15 blur-3xl"
          />

          <div className="relative mx-auto max-w-5xl px-6 sm:px-10 lg:px-16">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="flex items-center justify-center gap-3 mb-6">
                <span aria-hidden="true" className="h-px w-12 bg-primary-400" />
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-300">
                  Faça parte dessa história
                </span>
                <span aria-hidden="true" className="h-px w-12 bg-primary-400" />
              </div>
              <h2
                id="galeria-cta-title"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-6"
              >
                As imagens que você viu são o presente.<br className="hidden sm:block" />{" "}
                <span className="text-primary-200">O próximo capítulo depende de você.</span>
              </h2>
              <p className="text-lg text-primary-100 leading-[1.75] max-w-2xl mx-auto">
                Cada rosto nessas fotos é alguém que chegou até nós precisando de cuidado —
                e saiu com mais autonomia. Para que essa história continue sendo escrita,
                a gente precisa de você ao nosso lado.
              </p>
            </div>

            {/* Dois cards lado a lado */}
            <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
              {/* Card Contato */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className="group relative overflow-hidden rounded-2xl bg-white text-neutral-900 p-8 lg:p-10 flex flex-col"
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary-100/80 blur-2xl group-hover:bg-primary-200 transition-colors"
                />
                <div className="relative flex items-start gap-4 mb-6">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-700 text-white"
                  >
                    <MessageCircle size={22} strokeWidth={1.8} />
                  </span>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-[0.3em] text-primary-700 mb-2">
                      Entre em contato
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight">
                      Vamos conversar?
                    </h3>
                  </div>
                </div>
                <p className="relative text-base text-neutral-700 leading-[1.75] mb-8 flex-1">
                  Se você é paciente em busca de atendimento, parceiro institucional
                  ou quer conhecer nosso trabalho de perto, nossa equipe de acolhimento
                  está pronta para ouvir você.
                </p>
                <Link
                  to="/#contato"
                  className="group/btn relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-700 text-white font-bold hover:bg-primary-800 transition-colors shadow-lg shadow-primary-700/25 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 self-start"
                >
                  Falar com o CVI
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform group-hover/btn:translate-x-1"
                  />
                </Link>
              </motion.div>

              {/* Card Doação */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600 text-white p-8 lg:p-10 flex flex-col"
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors"
                />
                <div className="relative flex items-start gap-4 mb-6">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-secondary-600"
                  >
                    <Heart size={22} strokeWidth={2} fill="currentColor" />
                  </span>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-[0.3em] text-white/80 mb-2">
                      Apoie o nosso trabalho
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight">
                      Sua doação muda uma vida.
                    </h3>
                  </div>
                </div>
                <p className="relative text-base text-white/90 leading-[1.75] mb-8 flex-1">
                  Com R$ 50 você financia uma sessão de fisioterapia. Com R$ 150, uma semana de
                  acompanhamento psicológico familiar. Toda contribuição expande o alcance do
                  que você acabou de ver.
                </p>
                <Link
                  to="/#doar"
                  className="group/btn relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-secondary-700 font-bold hover:bg-neutral-100 transition-colors shadow-xl shadow-black/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white focus-visible:ring-offset-3 focus-visible:ring-offset-secondary-600 self-start"
                >
                  Quero doar agora
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform group-hover/btn:translate-x-1"
                  />
                </Link>
              </motion.div>
            </div>

            {/* Nota de reforço */}
            <p className="text-center text-sm text-primary-200 mt-10 max-w-xl mx-auto leading-relaxed">
              Todo atendimento do CVI é gratuito, financiado pelo SUS. Suas doações ampliam
              projetos, equipamentos e o alcance para mais municípios do Amazonas.
            </p>
          </div>
        </section>

        {/* ── LIGHTBOX ─────────────────────────────────────── */}
        <AnimatePresence>
          {lightbox !== null && photos[lightbox] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-label="Visualização ampliada da foto"
              className="fixed inset-0 z-[100] bg-neutral-900/95 backdrop-blur flex items-center justify-center p-6"
              onClick={() => setLightbox(null)}
            >
              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="Fechar visualização"
                className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white"
              >
                <X size={22} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
                }}
                aria-label="Foto anterior"
                className="absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white"
              >
                <ChevronLeft size={24} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => (i === null ? null : (i + 1) % photos.length));
                }}
                aria-label="Próxima foto"
                className="absolute right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white"
              >
                <ChevronRight size={24} aria-hidden="true" />
              </button>

              <motion.figure
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-5xl max-h-[85vh] flex flex-col items-center gap-4"
              >
                <img
                  src={photos[lightbox].src}
                  alt={photos[lightbox].alt || ""}
                  className="max-h-[75vh] w-auto rounded-xl shadow-2xl"
                />
                {photos[lightbox].caption && (
                  <figcaption className="text-center text-neutral-200 text-sm max-w-2xl">
                    {photos[lightbox].caption}
                  </figcaption>
                )}
                <span className="text-xs font-mono tabular-nums text-neutral-400">
                  {lightbox + 1} / {photos.length}
                </span>
              </motion.figure>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      <FloatingDonateCTA />
      <FloatingWhatsApp />
    </>
  );
}

function EmptyState({ folderName }: { folderName: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-neutral-300 bg-neutral-50/50 p-12 sm:p-16 text-center">
      <span
        aria-hidden="true"
        className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-700 mb-6"
      >
        <ImageIcon size={28} strokeWidth={1.5} />
      </span>
      <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mb-3">
        As fotos de <span className="text-primary-700">{folderName}</span> estão chegando
      </h3>
      <p className="max-w-md mx-auto text-base text-neutral-700 leading-[1.75] mb-8">
        Estamos organizando o material com cuidado. Em breve esta pasta estará
        viva com registros reais das nossas vivências.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-50 border border-warm-200 text-warm-800 text-xs font-bold uppercase tracking-[0.2em]">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-warm-500 animate-pulse"
        />
        Em preparação
      </div>
    </div>
  );
}
