import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { siteContent } from "@/data/content";

const { testimonials } = siteContent;

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const total = testimonials.items.length;
  const regionRef = useRef<HTMLDivElement>(null);

  const go = (dir: number) => setIndex((i) => (i + dir + total) % total);
  const goTo = (i: number) => setIndex(i);

  // Navegação por teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!regionRef.current) return;
      if (!regionRef.current.contains(document.activeElement)) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const current = testimonials.items[index];

  return (
    <section id="depoimentos" aria-labelledby="testimonials-title" className="relative py-28 lg:py-36 bg-primary-900 text-white overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-10 right-0 text-[20rem] font-black text-white/[0.03] leading-none select-none pointer-events-none hidden lg:block"
      >
        06
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <div className="mb-16 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span aria-hidden="true" className="h-px w-12 bg-accent-400" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-300">
              {testimonials.section_label}
            </span>
          </div>
          <h2 id="testimonials-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-6">
            {testimonials.headline}
          </h2>
          <p className="text-lg text-primary-100/90 leading-relaxed">{testimonials.subheadline}</p>
        </div>

        {/* Carrossel */}
        <div
          ref={regionRef}
          role="region"
          aria-roledescription="carrossel"
          aria-label="Depoimentos de pacientes, familiares e profissionais"
          className="relative"
        >
          <Quote aria-hidden="true" size={80} className="text-accent-400/30 mb-6" strokeWidth={1} />

          <div
            aria-live="polite"
            aria-atomic="true"
            className="min-h-[280px]"
          >
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-2xl sm:text-3xl lg:text-4xl leading-snug font-medium mb-10 max-w-4xl">
                  {current.quote}
                </p>
                <footer className="flex items-center gap-4">
                  <div
                    aria-hidden="true"
                    className="h-14 w-14 rounded-full bg-gradient-to-br from-accent-400 to-primary-500 flex items-center justify-center text-white font-bold text-lg"
                  >
                    {current.author[0]}
                  </div>
                  <div>
                    <cite className="not-italic font-semibold text-white block text-lg">
                      {current.author}
                    </cite>
                    <span className="text-sm text-primary-200">{current.role}</span>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2" role="tablist" aria-label="Selecionar depoimento">
              {testimonials.items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Depoimento ${i + 1} de ${total}`}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all
                    ${i === index ? "w-10 bg-accent-400" : "w-2 bg-white/30 hover:bg-white/50"}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-primary-200 tabular-nums">
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Depoimento anterior"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 hover:bg-white/10 transition-colors focus-visible:ring-4 focus-visible:ring-accent-300"
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Próximo depoimento"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-500 hover:bg-accent-600 transition-colors focus-visible:ring-4 focus-visible:ring-accent-300"
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
