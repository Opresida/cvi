import { motion } from "framer-motion";
import { HeartHandshake, Users, Award, Sparkles } from "lucide-react";
import { siteContent } from "@/data/content";

const { about, timeline } = siteContent;

const valueIcons: Record<string, React.ReactNode> = {
  "heart-handshake": <HeartHandshake size={32} strokeWidth={1.5} aria-hidden="true" />,
  users: <Users size={32} strokeWidth={1.5} aria-hidden="true" />,
  award: <Award size={32} strokeWidth={1.5} aria-hidden="true" />,
  sparkles: <Sparkles size={32} strokeWidth={1.5} aria-hidden="true" />,
};

export function About() {
  return (
    <section id="sobre" aria-labelledby="about-title" className="relative py-28 lg:py-36 bg-white overflow-hidden">
      {/* Marca d'água numérica editorial */}
      <div
        aria-hidden="true"
        className="absolute -top-8 right-0 text-[20rem] font-black text-primary-50 leading-none select-none pointer-events-none hidden lg:block"
      >
        01
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        {/* Header editorial */}
        <div className="mb-20 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span aria-hidden="true" className="h-px w-12 bg-primary-600" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
              {about.section_label}
            </span>
          </div>
          <motion.h2
            id="about-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.05]"
          >
            {about.headline}
          </motion.h2>
        </div>

        {/* Bloco manifesto - parágrafos tipográficos grandes */}
        <div className="grid lg:grid-cols-12 gap-12 mb-24">
          <div className="lg:col-span-5 lg:sticky lg:top-32 self-start">
            <p className="text-2xl lg:text-3xl font-bold text-primary-900 leading-tight">
              Saúde e reabilitação são direitos,
              <br />
              <span className="text-primary-600">não privilégios.</span>
            </p>
          </div>
          <div className="lg:col-span-7 space-y-6">
            {about.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-lg text-neutral-700 leading-[1.8]"
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>

        {/* Timeline horizontal */}
        <div className="mb-24">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-10">
            Nossa jornada
          </h3>
          <div className="relative">
            {/* Linha horizontal */}
            <div aria-hidden="true" className="absolute left-0 right-0 top-4 h-px bg-neutral-200" />
            <ol role="list" className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {timeline.map((item, i) => (
                <motion.li
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-3 h-3 w-3 rounded-full bg-primary-600 ring-4 ring-white"
                  />
                  <div className="pt-10">
                    <p className="text-xl font-bold text-primary-700 mb-1">{item.year}</p>
                    <h4 className="text-sm font-bold text-neutral-900 mb-2">{item.title}</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">{item.text}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>

        {/* Missão + Visão em blocos tipográficos (sem cards) */}
        <div className="grid lg:grid-cols-2 gap-16 mb-24 border-y border-neutral-200 py-16">
          <div>
            <span aria-hidden="true" className="block text-6xl font-black text-primary-100 leading-none mb-3">“</span>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700 mb-3">
              {about.mission.title}
            </h3>
            <p className="text-xl lg:text-2xl text-neutral-800 leading-snug font-medium">
              {about.mission.text}
            </p>
          </div>
          <div>
            <span aria-hidden="true" className="block text-6xl font-black text-secondary-100 leading-none mb-3">“</span>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-600 mb-3">
              {about.vision.title}
            </h3>
            <p className="text-xl lg:text-2xl text-neutral-800 leading-snug font-medium">
              {about.vision.text}
            </p>
          </div>
        </div>

        {/* Valores: ícones grandes integrados ao texto, não boxes */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-8">
            Nossos valores
          </h3>
          <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {about.values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <span className="text-primary-600 inline-block mb-4 group-hover:text-secondary-500 transition-colors">
                  {valueIcons[v.icon]}
                </span>
                <dt className="text-xl font-bold text-neutral-900 mb-2">{v.title}</dt>
                <dd className="text-sm text-neutral-700 leading-relaxed">{v.text}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
