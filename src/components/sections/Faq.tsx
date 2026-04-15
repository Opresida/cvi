import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { siteContent } from "@/data/content";

const { faq } = siteContent;

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const uid = useId();
  const numberLabel = String(index + 1).padStart(2, "0");

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="group border-b border-neutral-300 last:border-b-0"
    >
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`faq-panel-${uid}`}
          id={`faq-trigger-${uid}`}
          onClick={() => setOpen((v) => !v)}
          className="w-full text-left grid grid-cols-[auto_1fr_auto] items-center gap-5 sm:gap-7 py-6 lg:py-8 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 focus-visible:ring-offset-white rounded-sm"
        >
          <span
            aria-hidden="true"
            className="font-bold text-sm tracking-[0.2em] text-primary-600 tabular-nums"
          >
            {numberLabel}
          </span>
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 leading-snug tracking-tight">
            {question}
          </span>
          <span
            aria-hidden="true"
            className={`flex items-center justify-center h-10 w-10 rounded-full border border-neutral-300 text-primary-700 transition-all ${
              open ? "bg-primary-50 rotate-45 border-primary-500" : "group-hover:border-primary-500"
            }`}
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-panel-${uid}`}
            role="region"
            aria-labelledby={`faq-trigger-${uid}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-[auto_1fr_auto] gap-5 sm:gap-7 pb-8 lg:pb-10">
              <span aria-hidden="true" className="w-[2ch]" />
              <p className="text-base sm:text-lg text-neutral-700 leading-[1.75] max-w-3xl">
                {answer}
              </p>
              <span aria-hidden="true" className="w-10" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative py-28 lg:py-36 bg-white overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute -top-10 right-0 text-[20rem] font-black text-primary-100/40 leading-none select-none pointer-events-none hidden lg:block"
      >
        07
      </div>

      <div className="relative mx-auto max-w-5xl px-6 sm:px-10 lg:px-16">
        <div className="mb-16 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span aria-hidden="true" className="h-px w-12 bg-primary-600" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
              {faq.section_label}
            </span>
          </div>
          <h2
            id="faq-title"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.05] tracking-tight"
          >
            {faq.headline}
          </h2>
          <p className="mt-6 text-lg text-neutral-700 leading-[1.75] max-w-2xl">
            {faq.subheadline}
          </p>
        </div>

        <ol role="list" className="divide-y divide-neutral-300 border-t border-neutral-300">
          {faq.items.map((item, i) => (
            <FaqItem
              key={item.question}
              index={i}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </ol>

        <div className="mt-12 pt-8 border-t border-neutral-300 max-w-2xl">
          <p className="text-base text-neutral-700 leading-[1.75]">
            Não encontrou sua dúvida?{" "}
            <a
              href="#contato"
              className="font-semibold text-primary-700 underline decoration-primary-300 decoration-2 underline-offset-4 hover:decoration-primary-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 rounded-sm"
            >
              Fale conosco
            </a>{" "}
            — nossa equipe de acolhimento responde em até 48 horas.
          </p>
        </div>
      </div>
    </section>
  );
}
