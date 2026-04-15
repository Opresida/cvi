import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldCheck, Heart, BookOpen, ChevronDown, ArrowRight } from "lucide-react";
import { siteContent } from "@/data/content";

const { services } = siteContent;

const iconMap: Record<string, React.ReactNode> = {
  activity: <Activity size={28} strokeWidth={1.5} aria-hidden="true" />,
  "shield-check": <ShieldCheck size={28} strokeWidth={1.5} aria-hidden="true" />,
  heart: <Heart size={28} strokeWidth={1.5} aria-hidden="true" />,
  "book-open": <BookOpen size={28} strokeWidth={1.5} aria-hidden="true" />,
};

export function Services() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <section id="servicos" aria-labelledby="services-title" className="relative py-28 lg:py-36 bg-white overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-10 left-0 text-[20rem] font-black text-primary-50 leading-none select-none pointer-events-none hidden lg:block"
      >
        03
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <div className="mb-16 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span aria-hidden="true" className="h-px w-12 bg-primary-600" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
              {services.section_label}
            </span>
          </div>
          <h2 id="services-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.05] mb-6">
            {services.headline}
          </h2>
          <p className="text-lg text-neutral-700 leading-relaxed">{services.subheadline}</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
          {/* Diagrama circular (SVG) */}
          <div className="relative aspect-square max-w-md mx-auto w-full">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full"
              role="img"
              aria-label="Diagrama da integração multidisciplinar: pessoa atendida no centro, cercada por quatro serviços"
            >
              {/* Linhas conectoras */}
              <g stroke="var(--color-primary-200)" strokeWidth="1.5" strokeDasharray="4 4" fill="none">
                <line x1="200" y1="200" x2="200" y2="80" />
                <line x1="200" y1="200" x2="320" y2="200" />
                <line x1="200" y1="200" x2="200" y2="320" />
                <line x1="200" y1="200" x2="80" y2="200" />
              </g>

              {/* Círculo central - Pessoa Atendida */}
              <circle cx="200" cy="200" r="60" fill="var(--color-primary-700)" />
              <text x="200" y="195" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Plus Jakarta Sans">
                Pessoa
              </text>
              <text x="200" y="210" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Plus Jakarta Sans">
                Atendida
              </text>

              {/* 4 círculos satélites */}
              {services.items.map((s, i) => {
                const positions = [
                  { x: 200, y: 50 },
                  { x: 350, y: 200 },
                  { x: 200, y: 350 },
                  { x: 50, y: 200 },
                ];
                const p = positions[i];
                const isActive = activeIdx === i;
                return (
                  <g
                    key={s.title}
                    className="cursor-pointer"
                    onClick={() => setActiveIdx(activeIdx === i ? null : i)}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="45"
                      fill={isActive ? "var(--color-primary-600)" : "white"}
                      stroke="var(--color-primary-600)"
                      strokeWidth="2"
                      className="transition-colors"
                    />
                    <text
                      x={p.x}
                      y={p.y + 4}
                      textAnchor="middle"
                      fill={isActive ? "white" : "var(--color-primary-800)"}
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="Plus Jakarta Sans"
                      className="pointer-events-none transition-colors"
                    >
                      <tspan x={p.x} dy="-0.3em">{s.title.split(" ")[0]}</tspan>
                      <tspan x={p.x} dy="1.2em">{s.title.split(" ").slice(1).join(" ")}</tspan>
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Lista de serviços (disclosure pattern, não hover) */}
          <ul role="list" className="space-y-3">
            {services.items.map((service, i) => {
              const isOpen = activeIdx === i;
              return (
                <li key={service.title} className="border-b border-neutral-200 last:border-b-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`service-${i}`}
                    onClick={() => setActiveIdx(isOpen ? null : i)}
                    className={`w-full flex items-center gap-4 py-5 text-left transition-colors
                      ${isOpen ? "text-primary-800" : "text-neutral-900 hover:text-primary-700"}`}
                  >
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors
                      ${isOpen ? "bg-primary-700 text-white" : "bg-primary-50 text-primary-700"}`}>
                      {iconMap[service.icon]}
                    </span>
                    <span className="flex-1">
                      <span className="text-xs font-mono text-neutral-400 block">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xl font-bold block">{service.title}</span>
                    </span>
                    <ChevronDown
                      size={20}
                      aria-hidden="true"
                      className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`service-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 pl-16 pr-4">
                          <p className="text-neutral-700 mb-4 leading-relaxed">{service.description}</p>
                          <ul role="list" className="space-y-2">
                            {service.highlights.map((h) => (
                              <li key={h} className="flex items-start gap-3 text-sm text-neutral-600">
                                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>

        {/* CTA — convite para a página completa de serviços */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mt-20 lg:mt-28 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 to-primary-900 p-10 lg:p-16"
        >
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary-400/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent-400/10 blur-3xl"
          />

          <div className="relative grid lg:grid-cols-[1.4fr_auto] items-center gap-8 lg:gap-12">
            <div className="max-w-2xl">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-primary-200 mb-4">
                Catálogo completo
              </span>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
                Conheça todos os serviços do CVI Amazonas.
              </h3>
              <p className="text-base sm:text-lg text-primary-100 leading-[1.7]">
                Acesse a página dedicada com o detalhamento completo de cada especialidade,
                equipe responsável, público atendido e formas de encaminhamento — tudo reunido
                em um só lugar.
              </p>
            </div>

            <Link
              to="/servicos"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white text-primary-800 font-bold text-base hover:bg-primary-50 transition-colors shadow-xl shadow-primary-900/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white focus-visible:ring-offset-3 focus-visible:ring-offset-primary-800 whitespace-nowrap"
            >
              Ver todos os serviços
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
