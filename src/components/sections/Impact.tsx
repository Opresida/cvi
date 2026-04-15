import { motion } from "framer-motion";
import { siteContent } from "@/data/content";
import { useCountUp } from "@/hooks/useCountUp";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const { impact } = siteContent;

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const reduced = useReducedMotion();
  const { count, ref } = useCountUp(value, reduced ? 0 : 2200);
  return (
    <span ref={ref} className="tabular-nums">
      {(reduced ? value : count).toLocaleString("pt-BR")}
      <span className="text-accent-400">{suffix}</span>
    </span>
  );
}

export function Impact() {
  return (
    <section
      id="impacto"
      aria-labelledby="impact-title"
      className="relative py-28 lg:py-36 bg-neutral-900 text-white overflow-hidden"
    >
      {/* Marca d'água */}
      <div
        aria-hidden="true"
        className="absolute -bottom-10 left-0 text-[20rem] font-black text-white/[0.03] leading-none select-none pointer-events-none hidden lg:block"
      >
        02
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="mb-20 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span aria-hidden="true" className="h-px w-12 bg-accent-400" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-300">
              {impact.section_label}
            </span>
          </div>
          <h2
            id="impact-title"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-6"
          >
            {impact.headline}
          </h2>
          <p className="text-lg text-primary-100/90 leading-relaxed">{impact.subheadline}</p>
        </div>

        {/* Escada de autonomia */}
        <ol role="list" className="relative">
          {/* Linha diagonal conectora */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <line
              x1="0"
              y1="100"
              x2="100"
              y2="0"
              stroke="rgba(52, 211, 153, 0.2)"
              strokeWidth="0.15"
              strokeDasharray="0.5,0.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {impact.stats.map((stat, i) => {
            const totalSteps = impact.stats.length;
            const indent = (i / (totalSteps - 1)) * 100; // percentual horizontal crescente
            return (
              <motion.li
                key={stat.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="relative py-6 md:py-8 border-b border-white/10 last:border-b-0 flex flex-col md:flex-row md:items-baseline gap-4 md:gap-8"
                style={{ paddingLeft: `max(0px, ${indent}% * 0.5)` }}
              >
                {/* Número do degrau */}
                <div className="flex items-baseline gap-4 md:min-w-[280px]">
                  <span
                    aria-hidden="true"
                    className="text-xs font-mono text-accent-400/60 uppercase tracking-wider"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-none">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </p>
                </div>

                {/* Label + descrição */}
                <div className="md:flex-1">
                  <h3 className="text-xl font-bold text-accent-300 mb-1">{stat.label}</h3>
                  <p className="text-sm text-primary-100/70 leading-relaxed max-w-md">
                    {stat.description}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
