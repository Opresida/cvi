import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote, Check, Info } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipLinks } from "@/components/layout/SkipLinks";
import { AccessibilityToolbar } from "@/components/layout/AccessibilityToolbar";
import { FloatingDonateCTA } from "@/components/layout/FloatingDonateCTA";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { siteContent } from "@/data/content";

const { servicesPage } = siteContent;

const IMAGES = {
  first: "https://i.imgur.com/YuE6Rej.png",
  second: "https://i.imgur.com/6nx0mgC.png",
};

function ImageBand({
  src,
  alt,
  caption,
  align = "right",
  tone = "light",
}: {
  src: string;
  alt: string;
  caption: string;
  align?: "left" | "right";
  tone?: "light" | "dark";
}) {
  const bgCls = tone === "dark" ? "bg-neutral-900" : "bg-white";
  const textMutedCls = tone === "dark" ? "text-primary-300" : "text-primary-700";
  const captionCls = tone === "dark" ? "text-neutral-300" : "text-neutral-700";
  const frameBorderCls = tone === "dark" ? "border-primary-500/40" : "border-primary-300";

  return (
    <section aria-hidden="false" className={`relative ${bgCls} overflow-hidden`}>
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16 py-16 lg:py-24">
        <div
          className={`grid gap-8 lg:gap-16 items-center ${
            align === "left"
              ? "lg:grid-cols-[1.2fr_1fr]"
              : "lg:grid-cols-[1fr_1.2fr]"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, x: align === "left" ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className={`relative ${align === "right" ? "lg:order-last" : ""}`}
          >
            {/* Moldura decorativa */}
            <div
              aria-hidden="true"
              className={`absolute -inset-4 sm:-inset-6 border-2 ${frameBorderCls} rounded-2xl translate-x-3 translate-y-3 sm:translate-x-5 sm:translate-y-5`}
            />
            <img
              src={src}
              alt={alt}
              loading="lazy"
              className="relative w-full h-auto object-cover rounded-2xl shadow-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="max-w-lg"
          >
            <span
              className={`block text-xs font-bold uppercase tracking-[0.3em] ${textMutedCls} mb-4`}
            >
              Vidas que nos movem
            </span>
            <p
              className={`text-xl sm:text-2xl font-bold leading-[1.35] tracking-tight ${
                tone === "dark" ? "text-white" : "text-neutral-900"
              }`}
            >
              {caption}
            </p>
            <span
              aria-hidden="true"
              className={`block mt-6 h-px w-16 ${
                tone === "dark" ? "bg-primary-400" : "bg-primary-600"
              }`}
            />
            <p className={`mt-6 text-base leading-[1.75] ${captionCls}`}>
              Cada rosto representa uma conquista — da primeira consulta aos marcos
              de autonomia. É por isso que cada especialidade, cada projeto e cada
              decisão clínica nasce de uma pergunta simples: o que essa pessoa
              precisa para viver plenamente?
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const alignCls = align === "center" ? "mx-auto text-center" : "";
  return (
    <div className={`max-w-3xl mb-16 ${alignCls}`}>
      {eyebrow && (
        <div
          className={`flex items-center gap-3 mb-6 ${
            align === "center" ? "justify-center" : ""
          }`}
        >
          <span aria-hidden="true" className="h-px w-12 bg-primary-600" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-[1.1] tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-lg text-neutral-700 leading-[1.75]">{subtitle}</p>
      )}
    </div>
  );
}

export function Servicos() {
  return (
    <>
      <SkipLinks />
      <Header />
      <AccessibilityToolbar />

      <main id="main-content" role="main">
        {/* ─── HERO ─────────────────────────────────────────── */}
        <section
          aria-labelledby="servicos-title"
          className="relative pt-40 pb-24 lg:pt-48 lg:pb-32 bg-gradient-to-b from-primary-50 via-white to-white overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute -top-10 right-0 text-[20rem] font-black text-primary-100/50 leading-none select-none pointer-events-none hidden lg:block"
          >
            03
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
                  {servicesPage.hero.eyebrow}
                </span>
              </div>

              <h1
                id="servicos-title"
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.05] tracking-tight mb-6"
              >
                {servicesPage.hero.title}
              </h1>

              <p className="text-lg sm:text-xl text-neutral-700 leading-[1.75] max-w-2xl">
                {servicesPage.hero.lead}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── IMAGEM 1 — HUMANIZAÇÃO PÓS-HERO ─────────────── */}
        <ImageBand
          src={IMAGES.first}
          alt="Equipe do CVI Amazonas em atendimento humanizado a paciente"
          caption="Mais de 20 anos reabilitando pessoas, fortalecendo famílias e transformando comunidades."
          align="left"
          tone="light"
        />

        {/* ─── FILOSOFIA ────────────────────────────────────── */}
        <section
          aria-labelledby="philosophy-title"
          className="relative py-20 lg:py-28 bg-primary-900 text-white overflow-hidden"
        >
          <div className="relative mx-auto max-w-4xl px-6 sm:px-10 lg:px-16 text-center">
            <Quote
              aria-hidden="true"
              className="mx-auto mb-6 text-primary-300"
              size={48}
              strokeWidth={1.2}
            />
            <h2 id="philosophy-title" className="sr-only">
              Filosofia CVI-AM
            </h2>
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.25] tracking-tight text-white mb-8">
              “{servicesPage.philosophy.quote}”
            </blockquote>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-300 mb-10">
              — {servicesPage.philosophy.attribution}
            </p>
            <p className="text-lg text-primary-100 leading-[1.75] max-w-3xl mx-auto">
              {servicesPage.philosophy.description}
            </p>
          </div>
        </section>

        {/* ─── ESPECIALIDADES ───────────────────────────────── */}
        <section
          aria-labelledby="specialties-title"
          className="relative py-24 lg:py-32 bg-white overflow-hidden"
        >
          <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-6">
                <span aria-hidden="true" className="h-px w-12 bg-primary-600" />
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
                  {servicesPage.specialties.section_label}
                </span>
              </div>
              <h2
                id="specialties-title"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-[1.1] tracking-tight mb-5"
              >
                {servicesPage.specialties.headline}
              </h2>
              <p className="text-lg text-neutral-700 leading-[1.75]">
                {servicesPage.specialties.subheadline}
              </p>
            </div>

            <ol role="list" className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {servicesPage.specialties.items.map((item, i) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="group relative flex flex-col p-7 lg:p-8 bg-white border border-neutral-200 rounded-2xl hover:border-primary-400 hover:shadow-card transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <span className="font-mono text-xs tracking-[0.2em] text-primary-600 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {"status" in item && item.status && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warm-50 border border-warm-200 text-warm-800 text-[0.68rem] font-semibold uppercase tracking-wider whitespace-nowrap">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-warm-500"
                          aria-hidden="true"
                        />
                        Em breve
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-neutral-900 leading-tight tracking-tight mb-3">
                    {item.name}
                  </h3>
                  <p className="text-base text-neutral-700 leading-[1.7] mb-5">
                    {item.description}
                  </p>

                  {"areas" in item && item.areas && (
                    <ul role="list" className="space-y-2 mb-4">
                      {item.areas.map((area) => (
                        <li
                          key={area}
                          className="flex items-start gap-2.5 text-sm text-neutral-700"
                        >
                          <Check
                            size={16}
                            aria-hidden="true"
                            className="mt-0.5 text-primary-600 shrink-0"
                            strokeWidth={2.5}
                          />
                          {area}
                        </li>
                      ))}
                    </ul>
                  )}

                  {"note" in item && item.note && (
                    <p className="mt-auto pt-4 border-t border-neutral-100 text-xs font-medium text-neutral-500 leading-relaxed italic">
                      {item.note}
                    </p>
                  )}

                  {"status" in item && item.status && (
                    <p className="mt-auto pt-4 border-t border-warm-100 text-xs font-medium text-warm-800 leading-relaxed flex items-start gap-2">
                      <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                      {item.status}
                    </p>
                  )}
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── PROJETOS ESTRUTURANTES ──────────────────────── */}
        <section
          aria-labelledby="projects-title"
          className="relative py-24 lg:py-32 bg-primary-50 overflow-hidden"
        >
          <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <SectionHeading
              eyebrow={servicesPage.projects.section_label}
              title={servicesPage.projects.headline}
            />

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {servicesPage.projects.items.map((p, i) => (
                <motion.article
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative bg-white rounded-2xl p-8 lg:p-10 border border-neutral-200 hover:shadow-card transition-all"
                >
                  <span className="inline-block font-mono text-xs tracking-[0.2em] text-primary-600 mb-4 tabular-nums">
                    PROJETO {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 leading-tight tracking-tight mb-4">
                    {p.title}
                  </h3>
                  <p className="text-base text-neutral-700 leading-[1.75] mb-6">
                    {p.description}
                  </p>
                  <ol role="list" className="space-y-3 pt-4 border-t border-neutral-100">
                    {p.steps.map((step, j) => (
                      <li
                        key={step}
                        className="flex items-start gap-3 text-sm text-neutral-800"
                      >
                        <span
                          aria-hidden="true"
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-800 text-xs font-bold tabular-nums"
                        >
                          {j + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PATOLOGIAS ───────────────────────────────────── */}
        <section
          aria-labelledby="pathologies-title"
          className="relative py-24 lg:py-32 bg-white overflow-hidden"
        >
          <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <SectionHeading
              eyebrow={servicesPage.pathologies.section_label}
              title={servicesPage.pathologies.headline}
              subtitle={servicesPage.pathologies.subheadline}
            />

            <ul role="list" className="flex flex-wrap gap-3">
              {servicesPage.pathologies.items.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  className="inline-flex items-center px-5 py-2.5 rounded-full bg-primary-50 border border-primary-200 text-primary-800 text-sm font-semibold hover:bg-primary-100 hover:border-primary-400 transition-colors"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── IMAGEM 2 — HUMANIZAÇÃO PRÉ-MODALIDADES ──────── */}
        <ImageBand
          src={IMAGES.second}
          alt="Paciente do CVI Amazonas em momento de reabilitação com profissional da equipe"
          caption="Por trás de cada patologia há uma história. Por trás de cada atendimento, um time inteiro trabalhando por autonomia."
          align="right"
          tone="light"
        />

        {/* ─── MODALIDADES ──────────────────────────────────── */}
        <section
          aria-labelledby="modalities-title"
          className="relative py-24 lg:py-32 bg-neutral-900 text-white overflow-hidden"
        >
          <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-6">
                <span aria-hidden="true" className="h-px w-12 bg-primary-400" />
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-300">
                  {servicesPage.modalities.section_label}
                </span>
              </div>
              <h2
                id="modalities-title"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight"
              >
                {servicesPage.modalities.headline}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesPage.modalities.items.map((m, i) => (
                <motion.div
                  key={m.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-7 bg-neutral-800/60 border border-neutral-700 rounded-2xl hover:border-primary-500 transition-colors"
                >
                  <h3 className="text-xl font-bold text-white leading-tight tracking-tight mb-4">
                    {m.title}
                  </h3>
                  <ul role="list" className="space-y-2.5">
                    {m.points.map((pt) => (
                      <li
                        key={pt}
                        className="flex items-start gap-2.5 text-sm text-neutral-300 leading-relaxed"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1 w-1 rounded-full bg-primary-400 shrink-0"
                        />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FORMAS DE ENTRADA ────────────────────────────── */}
        <section
          aria-labelledby="entry-title"
          className="relative py-24 lg:py-32 bg-white overflow-hidden"
        >
          <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <SectionHeading
              eyebrow={servicesPage.entry.section_label}
              title={servicesPage.entry.headline}
              subtitle={servicesPage.entry.subheadline}
            />

            <ul
              role="list"
              className="grid md:grid-cols-2 gap-x-8 gap-y-3 max-w-4xl"
            >
              {servicesPage.entry.items.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="flex items-start gap-3 py-3 border-b border-neutral-200"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-800 text-xs font-bold tabular-nums"
                  >
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-base text-neutral-800 leading-snug">
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── ELEGIBILIDADE & INELEGIBILIDADE ──────────────── */}
        <section
          aria-labelledby="eligibility-title"
          className="relative py-24 lg:py-32 bg-primary-50 overflow-hidden"
        >
          <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <SectionHeading
              eyebrow={servicesPage.eligibility.section_label}
              title={servicesPage.eligibility.headline}
            />

            {/* Tipos de elegibilidade */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {servicesPage.eligibility.types.map((t, i) => (
                <motion.div
                  key={t.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative bg-white rounded-2xl p-7 lg:p-8 border-l-4 border-primary-600 shadow-sm"
                >
                  <span className="block font-mono text-xs tracking-[0.2em] text-primary-600 mb-3 tabular-nums">
                    TIPO {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-1">
                    {t.label}
                  </h3>
                  <p className="text-sm font-semibold text-primary-700 mb-4">
                    {t.duration}
                  </p>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {t.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Inelegibilidade */}
            <div className="bg-white rounded-2xl p-8 lg:p-10 border border-neutral-200">
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mb-6">
                {servicesPage.eligibility.inelegible_title}
              </h3>
              <ul role="list" className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                {servicesPage.eligibility.inelegible.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-neutral-700 leading-relaxed"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary-500 shrink-0"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── FLUXO DE ALTA ────────────────────────────────── */}
        <section
          aria-labelledby="discharge-title"
          className="relative py-24 lg:py-32 bg-white overflow-hidden"
        >
          <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <SectionHeading
              eyebrow={servicesPage.discharge.section_label}
              title={servicesPage.discharge.headline}
            />

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-8">
              <div className="p-8 bg-primary-50 rounded-2xl">
                <h3 className="text-lg font-bold text-primary-900 tracking-tight mb-5">
                  Documentação obrigatória
                </h3>
                <ul role="list" className="space-y-3">
                  {servicesPage.discharge.documentation.map((d) => (
                    <li
                      key={d}
                      className="flex items-start gap-2.5 text-sm text-neutral-800 leading-relaxed"
                    >
                      <Check
                        size={16}
                        aria-hidden="true"
                        className="mt-0.5 text-primary-600 shrink-0"
                        strokeWidth={2.5}
                      />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 bg-neutral-50 rounded-2xl border border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900 tracking-tight mb-5">
                  Critérios de alta
                </h3>
                <ul role="list" className="space-y-3">
                  {servicesPage.discharge.criteria.map((c, i) => (
                    <li
                      key={c}
                      className="flex items-start gap-3 text-sm text-neutral-800 leading-relaxed"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-700 text-white text-xs font-bold tabular-nums"
                      >
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="max-w-3xl text-center mx-auto text-base text-neutral-700 leading-[1.75] italic border-t border-neutral-200 pt-8">
              <Info
                size={16}
                aria-hidden="true"
                className="inline mr-2 text-primary-600 -mt-0.5"
              />
              {servicesPage.discharge.reassessment}
            </p>
          </div>
        </section>

        {/* ─── CTA FINAL ────────────────────────────────────── */}
        <section
          aria-labelledby="services-cta-title"
          className="relative py-24 lg:py-32 bg-primary-900 text-white overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent-400/15 blur-3xl"
          />

          <div className="relative mx-auto max-w-4xl px-6 sm:px-10 lg:px-16 text-center">
            <h2
              id="services-cta-title"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5"
            >
              {servicesPage.cta.headline}
            </h2>
            <p className="text-lg text-primary-100 leading-[1.75] max-w-2xl mx-auto mb-10">
              {servicesPage.cta.subheadline}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to={servicesPage.cta.primary.href}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-primary-800 font-bold hover:bg-primary-50 transition-colors shadow-xl shadow-primary-900/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white focus-visible:ring-offset-3 focus-visible:ring-offset-primary-900"
              >
                {servicesPage.cta.primary.label}
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                to={servicesPage.cta.secondary.href}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-bold hover:bg-white/10 hover:border-white transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white focus-visible:ring-offset-3 focus-visible:ring-offset-primary-900"
              >
                {servicesPage.cta.secondary.label}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingDonateCTA />
      <FloatingWhatsApp />
    </>
  );
}
