import { motion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { siteContent } from "@/data/content";

const { hero } = siteContent;

export function Hero() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative min-h-[92vh] flex items-center overflow-hidden bg-primary-900"
    >
      {/* Background texture — fundo sólido com textura sutil de papel */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' fill='white'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Gradiente sutil */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-primary-900 via-primary-900 to-primary-950"
        style={{ background: "linear-gradient(180deg, #053c47 0%, #085969 100%)" }}
      />

      {/* Linha decorativa - coluna lateral editorial */}
      <div aria-hidden="true" className="absolute left-8 top-24 bottom-24 w-px bg-white/10 hidden lg:block" />
      <div aria-hidden="true" className="absolute right-8 top-24 bottom-24 w-px bg-white/10 hidden lg:block" />

      {/* Conteúdo principal */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-16 py-32 w-full">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-8"
          >
            <span aria-hidden="true" className="h-px w-12 bg-accent-400" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-300">
              {hero.tagline}
            </span>
          </motion.div>

          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.02] mb-8"
          >
            Cada pessoa merece viver com{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-accent-300">autonomia</span>
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 bottom-1 h-3 bg-accent-500/30 -z-0"
              />
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl text-lg sm:text-xl text-primary-100 mb-12 leading-relaxed"
          >
            {hero.subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <a
              href={hero.cta_primary.href}
              className="group inline-flex items-center gap-3 bg-white text-primary-900 font-semibold text-lg px-8 py-4 rounded-full
                shadow-[0_8px_30px_rgba(255,255,255,0.15)] transition-all
                hover:shadow-[0_12px_40px_rgba(255,255,255,0.25)] hover:translate-y-[-2px]
                focus-visible:ring-4 focus-visible:ring-accent-300"
            >
              {hero.cta_primary.label}
              <ArrowRight size={20} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href={hero.cta_secondary.href}
              className="group inline-flex items-center gap-2 text-white font-semibold text-lg px-4 py-4
                relative focus-visible:ring-4 focus-visible:ring-accent-300 rounded"
            >
              <span className="relative">
                {hero.cta_secondary.label}
                <span
                  aria-hidden="true"
                  className="absolute left-0 right-0 -bottom-1 h-0.5 bg-accent-400 origin-left scale-x-100 group-hover:scale-x-110 transition-transform"
                />
              </span>
            </a>
          </motion.div>

          {/* Métrica destaque */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-16 flex items-center gap-6"
          >
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-white leading-none">20<span className="text-accent-400">+</span></p>
              <p className="text-xs uppercase tracking-wider text-primary-200 mt-1">anos</p>
            </div>
            <div aria-hidden="true" className="h-12 w-px bg-white/20" />
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-white leading-none">990mil<span className="text-accent-400">+</span></p>
              <p className="text-xs uppercase tracking-wider text-primary-200 mt-1">atendimentos</p>
            </div>
            <div aria-hidden="true" className="h-12 w-px bg-white/20 hidden sm:block" />
            <div className="hidden sm:block">
              <p className="text-4xl sm:text-5xl font-bold text-white leading-none">50<span className="text-accent-400">+</span></p>
              <p className="text-xs uppercase tracking-wider text-primary-200 mt-1">municípios</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ondas orgânicas - remete ao Rio Amazonas */}
      <svg
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 w-full"
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        style={{ height: "100px" }}
      >
        <path
          d="M0,60 C240,110 480,10 720,50 C960,90 1200,20 1440,60 L1440,140 L0,140 Z"
          fill="white"
          opacity="0.06"
        />
        <path
          d="M0,80 C240,130 480,30 720,70 C960,110 1200,40 1440,80 L1440,140 L0,140 Z"
          fill="white"
          opacity="0.1"
        />
        <path
          d="M0,100 C240,140 480,50 720,90 C960,130 1200,60 1440,100 L1440,140 L0,140 Z"
          fill="white"
        />
      </svg>

      {/* Scroll indicator minimalista */}
      <a
        href="#sobre"
        aria-label="Ir para a próxima seção"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2
          text-primary-900 hover:text-primary-700 focus-visible:ring-4 focus-visible:ring-accent-300 rounded p-2"
      >
        <span className="text-xs font-semibold tracking-wider uppercase">Explorar</span>
        <ArrowDown size={16} aria-hidden="true" />
      </a>
    </section>
  );
}
