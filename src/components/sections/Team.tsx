import { motion } from "framer-motion";
import { siteContent } from "@/data/content";
import teamPhoto from "@/assets/images/team-photo.jpg";

const { team } = siteContent;

export function Team() {
  return (
    <section id="equipe" aria-labelledby="team-title" className="relative py-28 lg:py-36 bg-white overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-10 left-0 text-[20rem] font-black text-primary-50 leading-none select-none pointer-events-none hidden lg:block"
      >
        05
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Foto principal — TODO: FOTO REAL substituir quando cliente enviar galeria */}
          <motion.figure
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative"
          >
            <div className="absolute -top-4 -left-4 h-24 w-24 border-t-4 border-l-4 border-primary-600" aria-hidden="true" />
            <div className="absolute -bottom-4 -right-4 h-24 w-24 border-b-4 border-r-4 border-primary-600" aria-hidden="true" />
            <img
              src={teamPhoto}
              alt="Profissional da equipe multidisciplinar do CVI Amazonas em atendimento"
              className="w-full object-cover aspect-[3/4] grayscale-[20%]"
              loading="lazy"
            />
            <figcaption className="sr-only">
              Equipe multidisciplinar do CVI Amazonas composta por fisioterapeutas, fonoaudiólogos, psicólogos e assistentes sociais.
            </figcaption>
          </motion.figure>

          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <span aria-hidden="true" className="h-px w-12 bg-primary-600" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
                {team.section_label}
              </span>
            </div>
            <h2 id="team-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.05] mb-8">
              {team.headline}
            </h2>
            <p className="text-lg text-neutral-700 leading-relaxed mb-12">
              {team.subheadline}
            </p>

            {/* Lista tipográfica de especialidades */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-6">
                Especialidades
              </h3>
              <ul role="list" className="divide-y divide-neutral-200 border-y border-neutral-200">
                {team.specialties.map((spec, i) => (
                  <motion.li
                    key={spec}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-baseline gap-4 py-3"
                  >
                    <span aria-hidden="true" className="text-xs font-mono text-primary-600 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-lg font-medium text-neutral-800">{spec}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
