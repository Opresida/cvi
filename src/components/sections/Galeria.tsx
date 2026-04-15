import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HeartHandshake,
  Bus,
  Landmark,
  Activity,
  Calendar,
  ArrowRight,
  Images,
} from "lucide-react";
import { siteContent } from "@/data/content";

const { gallery } = siteContent;

const iconMap: Record<string, React.ReactNode> = {
  "heart-handshake": <HeartHandshake size={24} strokeWidth={1.5} aria-hidden="true" />,
  bus: <Bus size={24} strokeWidth={1.5} aria-hidden="true" />,
  landmark: <Landmark size={24} strokeWidth={1.5} aria-hidden="true" />,
  activity: <Activity size={24} strokeWidth={1.5} aria-hidden="true" />,
  calendar: <Calendar size={24} strokeWidth={1.5} aria-hidden="true" />,
};

export function Galeria() {
  return (
    <section
      id="galeria"
      aria-labelledby="galeria-title"
      className="relative py-28 lg:py-36 bg-neutral-50 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute -top-10 left-0 text-[20rem] font-black text-primary-100/40 leading-none select-none pointer-events-none hidden lg:block"
      >
        08
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="mb-16 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span aria-hidden="true" className="h-px w-12 bg-primary-600" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
              {gallery.section_label}
            </span>
          </div>
          <h2
            id="galeria-title"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.05] tracking-tight mb-6"
          >
            {gallery.headline}
          </h2>
          <p className="text-lg text-neutral-700 leading-[1.75] max-w-2xl">
            {gallery.subheadline}
          </p>
        </div>

        {/* Grid de pastas */}
        <ol
          role="list"
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-12"
        >
          {gallery.folders.map((folder, i) => {
            const count: number = folder.photos.length;
            const cover = (folder as { cover?: string }).cover;
            return (
              <motion.li
                key={folder.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={`/galeria#${folder.slug}`}
                  className="group relative flex flex-col h-full aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3"
                >
                  {/* Foto de capa (preenche o card) */}
                  {cover && (
                    <img
                      src={cover}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}

                  {/* Overlay gradiente (garante legibilidade) */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-primary-900/95 via-primary-900/55 to-primary-900/20 group-hover:from-primary-900/90 group-hover:via-primary-900/40 transition-colors"
                  />

                  {/* Moldura decorativa editorial */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-3 border border-white/20 rounded-xl pointer-events-none group-hover:border-white/60 transition-colors"
                  />

                  {/* Conteúdo */}
                  <div className="relative flex flex-col h-full p-5 lg:p-6">
                    <div className="flex items-center justify-between mb-auto">
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur text-white group-hover:bg-white group-hover:text-primary-800 transition-colors"
                      >
                        {iconMap[folder.icon]}
                      </span>
                      <span className="font-mono text-[0.65rem] tracking-[0.25em] text-white/70 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold leading-tight tracking-tight mb-1 text-white drop-shadow-lg">
                        {folder.name}
                      </h3>
                      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary-100 drop-shadow">
                        {count === 0
                          ? "Em breve"
                          : `${count} ${count === 1 ? "foto" : "fotos"}`}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ol>

        {/* CTA card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-white border border-neutral-200 p-8 lg:p-12"
        >
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary-100/80 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent-100/60 blur-3xl"
          />

          <div className="relative grid lg:grid-cols-[1.4fr_auto] items-center gap-8">
            <div className="max-w-2xl flex items-start gap-4 sm:gap-5">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white"
              >
                <Images size={22} strokeWidth={1.5} />
              </span>
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-primary-700 mb-2">
                  Galeria completa
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight tracking-tight mb-3">
                  Mergulhe no dia a dia do CVI Amazonas.
                </h3>
                <p className="text-base text-neutral-700 leading-[1.7]">
                  Abra cada pasta e encontre os rostos, os momentos e as conquistas
                  que transformam reabilitação em história de vida.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                to={gallery.cta.primary.href}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-700 text-white font-bold hover:bg-primary-800 transition-colors shadow-lg shadow-primary-700/25 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 whitespace-nowrap"
              >
                {gallery.cta.primary.label}
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                to={gallery.cta.secondary.href}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-primary-200 text-primary-800 font-bold hover:bg-primary-50 hover:border-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 whitespace-nowrap"
              >
                {gallery.cta.secondary.label}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
