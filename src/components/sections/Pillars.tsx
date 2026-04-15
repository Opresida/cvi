import { motion } from "framer-motion";
import { siteContent } from "@/data/content";

const { pillars } = siteContent;

export function Pillars() {
  return (
    <section id="pilares" aria-labelledby="pillars-title" className="relative py-28 lg:py-36 bg-neutral-50 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-10 right-0 text-[20rem] font-black text-primary-100/40 leading-none select-none pointer-events-none hidden lg:block"
      >
        04
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <div className="mb-20 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span aria-hidden="true" className="h-px w-12 bg-primary-600" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
              {pillars.section_label}
            </span>
          </div>
          <h2 id="pillars-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.05]">
            {pillars.headline}
          </h2>
        </div>

        <ol role="list" className="divide-y divide-neutral-300">
          {pillars.items.map((item, i) => (
            <motion.li
              key={item.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative grid grid-cols-12 gap-4 sm:gap-8 py-10 lg:py-14"
            >
              {/* Número gigante editorial */}
              <div className="col-span-12 md:col-span-4 lg:col-span-3">
                <span
                  aria-hidden="true"
                  className="block text-7xl sm:text-8xl lg:text-9xl font-black text-primary-100 leading-none transition-colors group-hover:text-primary-200"
                >
                  {item.number}
                </span>
              </div>

              {/* Conteúdo tipográfico */}
              <div className="col-span-12 md:col-span-8 lg:col-span-9 md:pt-4">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 leading-tight">
                  {item.title}
                </h3>
                <p className="text-base lg:text-lg text-neutral-700 leading-relaxed max-w-2xl">
                  {item.text}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
