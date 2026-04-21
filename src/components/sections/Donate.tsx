import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ArrowRight, HeartHandshake } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { siteContent } from "@/data/content";

const { donate } = siteContent;

export function Donate() {
  const [copied, setCopied] = useState(false);

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(donate.pix.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* silently ignore */
    }
  };

  return (
    <section id="doar" aria-labelledby="donate-title" className="relative py-28 lg:py-36 bg-neutral-50 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-10 left-0 text-[20rem] font-black text-secondary-100/50 leading-none select-none pointer-events-none hidden lg:block"
      >
        09
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="mb-16 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span aria-hidden="true" className="h-px w-12 bg-secondary-500" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-600">
              {donate.section_label}
            </span>
          </div>
          <h2 id="donate-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.05] mb-6">
            {donate.headline}
          </h2>
          <p className="text-lg text-neutral-700 leading-relaxed">{donate.subheadline}</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Breakdown de impacto */}
          <div className="lg:col-span-7">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-6">
              O que sua doação realiza
            </h3>
            <ul role="list" className="divide-y divide-neutral-200 border-y border-neutral-200">
              {donate.impact_breakdown.map((item, i) => (
                <motion.li
                  key={item.result}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 py-4"
                >
                  <span aria-hidden="true" className="mt-2 h-2 w-2 rounded-full bg-secondary-500 shrink-0" />
                  <span className="text-base sm:text-lg text-neutral-800 leading-snug">{item.result}</span>
                </motion.li>
              ))}
            </ul>

            {/* Formas de ajudar */}
            <div className="mt-12">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-4">
                Outras formas de contribuir
              </h3>
              <ul role="list" className="flex flex-wrap gap-x-8 gap-y-3 text-base text-neutral-800">
                {donate.options.map((opt) => (
                  <li key={opt.title} className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-secondary-500" />
                    <strong className="font-semibold">{opt.title}</strong>
                    <span className="text-neutral-600 text-sm">— {opt.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card Pix com QR Code */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white border-2 border-secondary-100 rounded-3xl p-8 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <HeartHandshake size={24} aria-hidden="true" className="text-secondary-500" />
                <h3 className="text-xl font-bold text-neutral-900">Doe via Pix</h3>
              </div>

              <div className="bg-white p-4 border border-neutral-200 rounded-2xl inline-flex items-center justify-center mx-auto w-full">
                <QRCodeCanvas
                  value={donate.pix.value}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#053c47"
                  level="M"
                  aria-label="QR Code Pix para doação ao CVI Amazonas"
                />
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">{donate.pix.label}</p>
                <div className="flex items-center justify-between gap-3 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
                  <code className="text-lg font-bold text-neutral-900 font-mono">{donate.pix.value}</code>
                  <button
                    type="button"
                    onClick={copyPix}
                    aria-label="Copiar chave Pix"
                    className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all
                      focus-visible:ring-4 focus-visible:ring-secondary-300
                      ${copied
                        ? "bg-accent-500 text-white"
                        : "bg-secondary-500 text-white hover:bg-secondary-600"}`}
                  >
                    {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                    {copied ? "Copiado!" : "Copiar"}
                  </button>
                </div>
                <AnimatePresence>
                  {copied && (
                    <motion.p
                      role="status"
                      aria-live="polite"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-sm text-accent-700 font-medium"
                    >
                      Chave copiada para a área de transferência.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <a
                href={donate.cta.href}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold px-6 py-4 rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-secondary-300"
              >
                {donate.cta.label}
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
